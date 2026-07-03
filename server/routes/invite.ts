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

  if (!row?.isActive) {
    return c.json({ error: "Invalid invite token" }, 404);
  }

  if (row.inviteUsed) {
    return c.json({ error: "Invite already used" }, 400);
  }

  if (row.lineUserId) {
    return c.json({ error: "LINE account already linked" }, 400);
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
    scope: "profile openid",
  });

  return c.redirect(
    `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`,
  );
});
