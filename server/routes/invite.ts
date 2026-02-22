import { Hono } from "hono";
import type { AppEnv } from "../types.ts";

export const inviteRoute = new Hono<AppEnv>();

inviteRoute.get("/:token", async (c) => {
	const token = c.req.param("token");

	const row = await c.env.DB.prepare(
		"SELECT id, name, invite_used, line_user_id, is_active FROM users WHERE invite_token = ?",
	)
		.bind(token)
		.first<{
			id: number;
			name: string;
			invite_used: number;
			line_user_id: string | null;
			is_active: number;
		}>();

	if (!row || !row.is_active) {
		return c.json({ error: "Invalid invite token" }, 404);
	}

	if (row.invite_used) {
		return c.json({ error: "Invite already used" }, 400);
	}

	if (row.line_user_id) {
		return c.json({ error: "LINE account already linked" }, 400);
	}

	const state = crypto.randomUUID();
	await c.env.SESSION_KV.put(
		`oauth_state:${state}`,
		JSON.stringify({ inviteToken: token }),
		{ expirationTtl: 600 },
	);

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
