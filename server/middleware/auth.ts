import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { AppEnv, SessionData, User } from "../types.ts";

async function getOrCreateDevUser(db: D1Database): Promise<User> {
	const row = await db
		.prepare(
			"SELECT id, name, role, line_user_id, is_active FROM users WHERE line_user_id = ?",
		)
		.bind("dev_line_user_id")
		.first<{
			id: number;
			name: string;
			role: string;
			line_user_id: string;
			is_active: number;
		}>();

	if (row) {
		return {
			id: row.id,
			name: row.name,
			role: row.role as User["role"],
			lineUserId: row.line_user_id,
			isActive: row.is_active === 1,
		};
	}

	const result = await db
		.prepare(
			"INSERT INTO users (name, role, line_user_id, invite_token, invite_used, is_active) VALUES (?, ?, ?, ?, 1, 1)",
		)
		.bind("Dev Admin", "admin", "dev_line_user_id", "dev_invite_token")
		.run();

	return {
		id: result.meta.last_row_id as number,
		name: "Dev Admin",
		role: "admin",
		lineUserId: "dev_line_user_id",
		isActive: true,
	};
}

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	if (c.env.DEV_AUTH === "true") {
		const devUser = await getOrCreateDevUser(c.env.DB);
		c.set("user", devUser);
		await next();
		return;
	}

	const sessionId = getCookie(c, "session_id");
	if (!sessionId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const raw = await c.env.SESSION_KV.get(`session:${sessionId}`);
	if (!raw) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const session = JSON.parse(raw) as SessionData;

	const row = await c.env.DB.prepare(
		"SELECT id, name, role, line_user_id, is_active FROM users WHERE id = ?",
	)
		.bind(session.userId)
		.first<{
			id: number;
			name: string;
			role: string;
			line_user_id: string;
			is_active: number;
		}>();

	if (!row || row.is_active === 0) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const user: User = {
		id: row.id,
		name: row.name,
		role: row.role as User["role"],
		lineUserId: row.line_user_id,
		isActive: row.is_active === 1,
	};

	c.set("user", user);
	await next();
});
