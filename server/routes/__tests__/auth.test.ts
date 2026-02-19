import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../index.ts";
import { createEnv, createMockD1, createMockKV } from "../../__tests__/helpers.ts";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("GET /api/auth/login", () => {
	it("redirects to LINE authorization URL", async () => {
		const env = createEnv();
		const res = await app.request("http://localhost/api/auth/login", {}, env);
		expect(res.status).toBe(302);
		const location = res.headers.get("Location") ?? "";
		expect(location).toContain("access.line.me");
		expect(location).toContain("client_id=test_channel_id");
		expect(location).toContain("scope=profile+openid");
	});

	it("stores oauth state in KV with 10-minute TTL", async () => {
		const kv = createMockKV();
		const env = createEnv({ SESSION_KV: kv });
		await app.request("http://localhost/api/auth/login", {}, env);
		expect(kv.put).toHaveBeenCalledWith(
			expect.stringMatching(/^oauth_state:/),
			"1",
			{ expirationTtl: 600 },
		);
	});
});

describe("GET /api/auth/callback", () => {
	it("returns 400 when code and state are missing", async () => {
		const env = createEnv();
		const res = await app.request("http://localhost/api/auth/callback", {}, env);
		expect(res.status).toBe(400);
	});

	it("returns 400 when state is not found in KV", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/auth/callback?code=testcode&state=invalid_state",
			{},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 500 when LINE token exchange fails", async () => {
		const state = "valid_state";
		const kv = createMockKV({ [`oauth_state:${state}`]: "1" });
		const env = createEnv({ SESSION_KV: kv });
		vi.spyOn(global, "fetch").mockResolvedValueOnce(
			new Response(null, { status: 400 }),
		);

		const res = await app.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(500);
	});

	it("returns 500 when LINE profile fetch fails", async () => {
		const state = "valid_state";
		const kv = createMockKV({ [`oauth_state:${state}`]: "1" });
		const env = createEnv({ SESSION_KV: kv });
		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ access_token: "token" }), { status: 200 }),
			)
			.mockResolvedValueOnce(new Response(null, { status: 500 }));

		const res = await app.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(500);
	});

	it("redirects to /?error=not_registered when user is not found in DB", async () => {
		const state = "valid_state";
		const kv = createMockKV({ [`oauth_state:${state}`]: "1" });
		const db = createMockD1([]);
		const env = createEnv({ SESSION_KV: kv, DB: db });
		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ access_token: "token" }), { status: 200 }),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ userId: "U1234" }), { status: 200 }),
			);

		const res = await app.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toContain("error=not_registered");
	});

	it("creates session, sets cookie, and redirects to / on success", async () => {
		const state = "valid_state";
		const kv = createMockKV({ [`oauth_state:${state}`]: "1" });
		const db = createMockD1([
			{ id: 1, name: "Test User", role: "member", line_user_id: "U1234", is_active: 1 },
		]);
		const env = createEnv({ SESSION_KV: kv, DB: db });
		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ access_token: "token" }), { status: 200 }),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ userId: "U1234" }), { status: 200 }),
			);

		const res = await app.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toBe("/");
		expect(res.headers.get("Set-Cookie")).toContain("session_id=");
		expect(kv.put).toHaveBeenCalledWith(
			expect.stringMatching(/^session:/),
			expect.stringContaining('"userId":1'),
			{ expirationTtl: 60 * 60 * 24 * 30 },
		);
	});
});

describe("POST /api/auth/logout", () => {
	it("deletes session from KV and returns 204", async () => {
		const kv = createMockKV({ "session:test_sid": '{"userId":1}' });
		const env = createEnv({ SESSION_KV: kv });
		const res = await app.request(
			"http://localhost/api/auth/logout",
			{ method: "POST", headers: { Cookie: "session_id=test_sid" } },
			env,
		);
		expect(res.status).toBe(204);
		expect(kv.delete).toHaveBeenCalledWith("session:test_sid");
	});

	it("returns 204 even without session cookie", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/auth/logout",
			{ method: "POST" },
			env,
		);
		expect(res.status).toBe(204);
	});
});

describe("GET /api/auth/me", () => {
	it("returns 401 when no session cookie", async () => {
		const env = createEnv();
		const res = await app.request("http://localhost/api/auth/me", {}, env);
		expect(res.status).toBe(401);
	});

	it("returns 401 when session is not found in KV", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/auth/me",
			{ headers: { Cookie: "session_id=ghost" } },
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns 401 when user is inactive", async () => {
		const kv = createMockKV({
			"session:sid": JSON.stringify({ userId: 1, lineUserId: "U1234", role: "member" }),
		});
		const db = createMockD1([
			{ id: 1, name: "Test User", role: "member", line_user_id: "U1234", is_active: 0 },
		]);
		const env = createEnv({ SESSION_KV: kv, DB: db });
		const res = await app.request(
			"http://localhost/api/auth/me",
			{ headers: { Cookie: "session_id=sid" } },
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns user info for a valid session", async () => {
		const kv = createMockKV({
			"session:sid": JSON.stringify({ userId: 1, lineUserId: "U1234", role: "member" }),
		});
		const db = createMockD1([
			{ id: 1, name: "Test User", role: "member", line_user_id: "U1234", is_active: 1 },
		]);
		const env = createEnv({ SESSION_KV: kv, DB: db });
		const res = await app.request(
			"http://localhost/api/auth/me",
			{ headers: { Cookie: "session_id=sid" } },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({ id: 1, name: "Test User", role: "member" });
	});

	it("bypasses auth and returns dev user when DEV_AUTH=true", async () => {
		const env = createEnv({ DEV_AUTH: "true" });
		const res = await app.request("http://localhost/api/auth/me", {}, env);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({ name: "Dev Admin", role: "admin" });
	});
});
