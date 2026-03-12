import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

export const membersRoute = new Hono<AppEnv>();

membersRoute.use("/*", authMiddleware);

// GET /api/members — list active members
membersRoute.get("/", async (c) => {
	const { results } = await c.env.DB.prepare(
		"SELECT id, name FROM users WHERE is_active = 1 ORDER BY name",
	).all<{ id: number; name: string }>();

	return c.json(results);
});
