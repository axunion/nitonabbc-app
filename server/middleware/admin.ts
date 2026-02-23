import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types.ts";

export const adminMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	const user = c.get("user");
	if (user.role !== "admin") {
		return c.json({ error: "Forbidden" }, 403);
	}
	await next();
});
