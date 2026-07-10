import { and, eq, sql } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { users } from "../db/schema.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

const SESSION_TTL = 60 * 60 * 24 * 30;
export const OAUTH_STATE_TTL = 600;

// Binds the OAuth state to the browser that started the flow, so a callback
// completed in a different browser (login CSRF / session fixation) is rejected.
export function setOAuthStateCookie(c: Context<AppEnv>, state: string): void {
  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: OAUTH_STATE_TTL,
  });
}

async function issueSession(
  c: Context<AppEnv>,
  userId: number,
  lineUserId: string,
  role: "admin" | "member",
): Promise<void> {
  const sessionId = crypto.randomUUID();
  await c.env.SESSION_KV.put(
    `session:${sessionId}`,
    JSON.stringify({ userId, lineUserId, role }),
    { expirationTtl: SESSION_TTL },
  );
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export const authRoute = new Hono<AppEnv>();

authRoute.get("/login", async (c) => {
  const state = crypto.randomUUID();
  await c.env.SESSION_KV.put(`oauth_state:${state}`, "1", {
    expirationTtl: OAUTH_STATE_TTL,
  });
  setOAuthStateCookie(c, state);

  const redirectUri = new URL("/api/auth/callback", c.req.url).toString();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: c.env.LINE_CHANNEL_ID,
    redirect_uri: redirectUri,
    state,
    scope: "profile",
  });

  return c.redirect(
    `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`,
  );
});

authRoute.get("/callback", async (c) => {
  const db = c.get("db");
  const { code, state } = c.req.query();

  // Failures redirect to the login screen with ?error= so end users see a
  // localized toast instead of a raw JSON response (also covers the user
  // cancelling on the LINE consent screen, which omits code/state).
  if (!code || !state) {
    return c.redirect("/?error=auth_failed");
  }

  // The state cookie binds this callback to the browser that started the flow.
  const cookieState = getCookie(c, "oauth_state");
  deleteCookie(c, "oauth_state", { path: "/" });
  if (!cookieState || cookieState !== state) {
    return c.redirect("/?error=auth_failed");
  }

  const storedState = await c.env.SESSION_KV.get(`oauth_state:${state}`);
  if (!storedState) {
    return c.redirect("/?error=auth_failed");
  }
  await c.env.SESSION_KV.delete(`oauth_state:${state}`);

  // Determine if this is an invite flow
  let inviteToken: string | null = null;
  if (storedState !== "1") {
    try {
      const parsed = JSON.parse(storedState) as { inviteToken?: string };
      inviteToken = parsed.inviteToken ?? null;
    } catch {
      // Not JSON, treat as normal login
    }
  }

  const redirectUri = new URL("/api/auth/callback", c.req.url).toString();

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: c.env.LINE_CHANNEL_ID,
      client_secret: c.env.LINE_CHANNEL_SECRET,
    }),
  });

  if (!tokenRes.ok) {
    return c.redirect("/?error=auth_failed");
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    return c.redirect("/?error=auth_failed");
  }

  const profile = (await profileRes.json()) as { userId: string };

  if (inviteToken) {
    // Check if LINE user ID is already linked to another user
    const existing = await db.query.users.findFirst({
      where: eq(users.lineUserId, profile.userId),
    });
    if (existing) {
      return c.redirect("/?error=line_already_linked");
    }

    // Atomic claim: only succeeds if invite is still valid (active + unused).
    // The WHERE condition prevents a race where two concurrent callbacks both
    // pass the inviteUsed check and both create sessions for the same account.
    const [claimed] = await db
      .update(users)
      .set({
        lineUserId: profile.userId,
        inviteUsed: true,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(
        and(
          eq(users.inviteToken, inviteToken),
          eq(users.inviteUsed, false),
          eq(users.isActive, true),
        ),
      )
      .returning();

    if (!claimed) {
      return c.redirect("/?error=invalid_invite");
    }

    await issueSession(c, claimed.id, profile.userId, claimed.role);
    return c.redirect("/");
  }

  // Normal login flow
  const row = await db.query.users.findFirst({
    where: eq(users.lineUserId, profile.userId),
  });

  if (!row?.isActive) {
    return c.redirect("/?error=not_registered");
  }

  await issueSession(c, row.id, profile.userId, row.role);
  return c.redirect("/");
});

authRoute.post("/logout", async (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) {
    await c.env.SESSION_KV.delete(`session:${sessionId}`);
  }

  deleteCookie(c, "session_id", { path: "/" });

  return c.body(null, 204);
});

authRoute.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    name: user.name,
    role: user.role,
    lineUserId: user.lineUserId,
  });
});
