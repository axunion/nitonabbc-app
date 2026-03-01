import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../types.ts";

export const securityHeaders: MiddlewareHandler<AppEnv> = async (c, next) => {
	await next();
	c.header("X-Content-Type-Options", "nosniff");
	c.header("X-Frame-Options", "DENY");
	c.header("Referrer-Policy", "strict-origin-when-cross-origin");
};
