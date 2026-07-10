import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { users } from "../db/schema.ts";
import type { AppEnv } from "../types.ts";
import { OAUTH_STATE_TTL, setOAuthStateCookie } from "./auth.ts";

export const inviteRoute = new Hono<AppEnv>();

inviteRoute.get("/:token", async (c) => {
  const db = c.get("db");
  const token = c.req.param("token");

  const row = await db.query.users.findFirst({
    where: eq(users.inviteToken, token),
  });

  // Any unusable link redirects to the login screen with ?error= so end
  // users see a localized toast instead of a raw JSON response.
  if (!row?.isActive || row.inviteUsed || row.lineUserId) {
    return c.redirect("/?error=invalid_invite");
  }

  const state = crypto.randomUUID();
  await c.env.SESSION_KV.put(
    `oauth_state:${state}`,
    JSON.stringify({ inviteToken: token }),
    { expirationTtl: OAUTH_STATE_TTL },
  );
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
