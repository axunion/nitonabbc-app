import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { users } from "../db/schema.ts";
import type { AppEnv, SessionData, User } from "../types.ts";

async function getOrCreateDevUser(
	db: AppEnv["Variables"]["db"],
): Promise<User> {
	const row = await db.query.users.findFirst({
		where: eq(users.lineUserId, "dev_line_user_id"),
	});

	if (row) {
		return {
			id: row.id,
			name: row.name,
			role: row.role,
			lineUserId: row.lineUserId ?? "",
			isActive: row.isActive,
		};
	}

	const [inserted] = await db
		.insert(users)
		.values({
			name: "Dev Admin",
			role: "admin",
			lineUserId: "dev_line_user_id",
			inviteToken: "dev_invite_token",
			inviteUsed: true,
			isActive: true,
		})
		.returning();

	return {
		id: inserted.id,
		name: inserted.name,
		role: inserted.role,
		lineUserId: inserted.lineUserId ?? "",
		isActive: inserted.isActive,
	};
}

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	const db = c.get("db");

	if (c.env.DEV_AUTH === "true") {
		const devUser = await getOrCreateDevUser(db);
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

	const row = await db.query.users.findFirst({
		where: eq(users.id, session.userId),
	});

	if (!row?.isActive) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const user: User = {
		id: row.id,
		name: row.name,
		role: row.role,
		lineUserId: row.lineUserId ?? "",
		isActive: row.isActive,
	};

	c.set("user", user);
	await next();
});
