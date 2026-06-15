import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { users } from "../db/schema.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

export const membersRoute = new Hono<AppEnv>();

membersRoute.use("/*", authMiddleware);

// GET /api/members — list active members with their service roles
membersRoute.get("/", async (c) => {
	const db = c.get("db");
	const rows = await db
		.select({
			id: users.id,
			name: users.name,
			serviceRoles: users.serviceRoles,
		})
		.from(users)
		.where(eq(users.isActive, true))
		.orderBy(asc(users.name));
	return c.json(rows);
});
