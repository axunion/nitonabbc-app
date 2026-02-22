import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

export const authRoute = new Hono<AppEnv>();

authRoute.get("/login", async (c) => {
	const state = crypto.randomUUID();
	await c.env.SESSION_KV.put(`oauth_state:${state}`, "1", {
		expirationTtl: 600,
	});

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

authRoute.get("/callback", async (c) => {
	const { code, state } = c.req.query();

	if (!code || !state) {
		return c.json({ error: "Invalid callback parameters" }, 400);
	}

	const storedState = await c.env.SESSION_KV.get(`oauth_state:${state}`);
	if (!storedState) {
		return c.json({ error: "Invalid or expired state" }, 400);
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
		return c.json({ error: "Failed to exchange token" }, 500);
	}

	const tokenData = (await tokenRes.json()) as { access_token: string };

	const profileRes = await fetch("https://api.line.me/v2/profile", {
		headers: { Authorization: `Bearer ${tokenData.access_token}` },
	});

	if (!profileRes.ok) {
		return c.json({ error: "Failed to fetch LINE profile" }, 500);
	}

	const profile = (await profileRes.json()) as { userId: string };

	if (inviteToken) {
		// Invite flow: link LINE account to pre-registered user
		const inviteRow = await c.env.DB.prepare(
			"SELECT id, name, role, invite_used, line_user_id, is_active FROM users WHERE invite_token = ?",
		)
			.bind(inviteToken)
			.first<{
				id: number;
				name: string;
				role: string;
				invite_used: number;
				line_user_id: string | null;
				is_active: number;
			}>();

		if (!inviteRow || !inviteRow.is_active || inviteRow.invite_used) {
			return c.redirect("/?error=invalid_invite");
		}

		// Check if LINE user ID is already linked to another user
		const existing = await c.env.DB.prepare(
			"SELECT id FROM users WHERE line_user_id = ?",
		)
			.bind(profile.userId)
			.first<{ id: number }>();

		if (existing) {
			return c.redirect("/?error=line_already_linked");
		}

		// Link LINE account and mark invite as used
		await c.env.DB.prepare(
			"UPDATE users SET line_user_id = ?, invite_used = 1, updated_at = datetime('now') WHERE invite_token = ?",
		)
			.bind(profile.userId, inviteToken)
			.run();

		const sessionId = crypto.randomUUID();
		const sessionData = JSON.stringify({
			userId: inviteRow.id,
			lineUserId: profile.userId,
			role: inviteRow.role,
		});

		await c.env.SESSION_KV.put(`session:${sessionId}`, sessionData, {
			expirationTtl: 60 * 60 * 24 * 30,
		});

		setCookie(c, "session_id", sessionId, {
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
		});

		return c.redirect("/");
	}

	// Normal login flow
	const row = await c.env.DB.prepare(
		"SELECT id, name, role, line_user_id, is_active FROM users WHERE line_user_id = ? AND is_active = 1",
	)
		.bind(profile.userId)
		.first<{
			id: number;
			name: string;
			role: string;
			line_user_id: string;
			is_active: number;
		}>();

	if (!row) {
		return c.redirect("/?error=not_registered");
	}

	const sessionId = crypto.randomUUID();
	const sessionData = JSON.stringify({
		userId: row.id,
		lineUserId: row.line_user_id,
		role: row.role,
	});

	await c.env.SESSION_KV.put(`session:${sessionId}`, sessionData, {
		expirationTtl: 60 * 60 * 24 * 30,
	});

	setCookie(c, "session_id", sessionId, {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
	});

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
