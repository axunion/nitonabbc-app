import { createMiddleware } from "hono/factory";
import { createDb } from "../db/index.ts";
import type { AppEnv } from "../types.ts";

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	// Idempotent: skip if db is already set (e.g. injected by a test wrapper)
	if (!(c.var as Record<string, unknown>).db) {
		c.set("db", createDb(c.env.DB));
	}
	await next();
});
