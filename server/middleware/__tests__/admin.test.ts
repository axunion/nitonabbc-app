import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../../types.ts";
import { adminMiddleware } from "../admin.ts";

describe("adminMiddleware", () => {
	it("returns 403 for member role", async () => {
		const testApp = new Hono<AppEnv>();
		testApp.use("/*", async (c, next) => {
			c.set("user", {
				id: 1,
				name: "Member",
				role: "member",
				lineUserId: "U1",
				isActive: true,
			});
			await next();
		});
		testApp.use("/*", adminMiddleware);
		testApp.get("/test", (c) => c.json({ ok: true }));

		const res = await testApp.request("http://localhost/test");
		expect(res.status).toBe(403);
		const json = await res.json();
		expect(json).toEqual({ error: "Forbidden" });
	});

	it("passes through for admin role", async () => {
		const testApp = new Hono<AppEnv>();
		testApp.use("/*", async (c, next) => {
			c.set("user", {
				id: 1,
				name: "Admin",
				role: "admin",
				lineUserId: "U1",
				isActive: true,
			});
			await next();
		});
		testApp.use("/*", adminMiddleware);
		testApp.get("/test", (c) => c.json({ ok: true }));

		const res = await testApp.request("http://localhost/test");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({ ok: true });
	});
});
