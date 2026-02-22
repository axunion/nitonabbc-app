import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../../index.ts";
import { createEnv, createMockD1, createMockKV } from "../../__tests__/helpers.ts";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("GET /api/invite/:token", () => {
	it("redirects to LINE auth URL for a valid token", async () => {
		const db = createMockD1([
			{
				id: 1,
				name: "New Member",
				invite_used: 0,
				line_user_id: null,
				is_active: 1,
			},
		]);
		const kv = createMockKV();
		const env = createEnv({ DB: db, SESSION_KV: kv });

		const res = await app.request(
			"http://localhost/api/invite/valid-token-123",
			{},
			env,
		);

		expect(res.status).toBe(302);
		const location = res.headers.get("Location") ?? "";
		expect(location).toContain("access.line.me");
		expect(location).toContain("client_id=test_channel_id");

		expect(kv.put).toHaveBeenCalledWith(
			expect.stringMatching(/^oauth_state:/),
			expect.stringContaining('"inviteToken":"valid-token-123"'),
			{ expirationTtl: 600 },
		);
	});

	it("returns 404 for a non-existent token", async () => {
		const db = createMockD1([]);
		const env = createEnv({ DB: db });

		const res = await app.request(
			"http://localhost/api/invite/nonexistent",
			{},
			env,
		);

		expect(res.status).toBe(404);
	});

	it("returns 400 for an already-used token", async () => {
		const db = createMockD1([
			{
				id: 1,
				name: "Member",
				invite_used: 1,
				line_user_id: null,
				is_active: 1,
			},
		]);
		const env = createEnv({ DB: db });

		const res = await app.request(
			"http://localhost/api/invite/used-token",
			{},
			env,
		);

		expect(res.status).toBe(400);
	});

	it("returns 404 for an inactive user", async () => {
		const db = createMockD1([
			{
				id: 1,
				name: "Inactive",
				invite_used: 0,
				line_user_id: null,
				is_active: 0,
			},
		]);
		const env = createEnv({ DB: db });

		const res = await app.request(
			"http://localhost/api/invite/inactive-token",
			{},
			env,
		);

		expect(res.status).toBe(404);
	});

	it("returns 400 when LINE account is already linked", async () => {
		const db = createMockD1([
			{
				id: 1,
				name: "Linked",
				invite_used: 0,
				line_user_id: "U_already_linked",
				is_active: 1,
			},
		]);
		const env = createEnv({ DB: db });

		const res = await app.request(
			"http://localhost/api/invite/linked-token",
			{},
			env,
		);

		expect(res.status).toBe(400);
	});
});
