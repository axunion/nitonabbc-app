import { describe, expect, it } from "vitest";
import { createEnv } from "../../__tests__/helpers.ts";
import app from "../../index.ts";

describe("GET /api/health", () => {
	it("returns status ok", async () => {
		const res = await app.request(
			"http://localhost/api/health",
			{},
			createEnv(),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({ status: "ok" });
	});
});
