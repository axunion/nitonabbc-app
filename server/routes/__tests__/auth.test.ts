import type { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createEnv,
	createMockKV,
	createTestDb,
	wrapWithDb,
} from "../../__tests__/helpers.ts";
import { schema } from "../../db/index.ts";
import app from "../../index.ts";
import type { AppEnv } from "../../types.ts";

type TestDb = ReturnType<typeof createTestDb>;

let db: TestDb;
let testApp: Hono<AppEnv>;

beforeEach(() => {
	db = createTestDb();
	testApp = wrapWithDb(app, db);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("GET /api/auth/login", () => {
	it("redirects to LINE authorization URL", async () => {
		const env = createEnv();
		const res = await testApp.request(
			"http://localhost/api/auth/login",
			{},
			env,
		);
		expect(res.status).toBe(302);
		const location = res.headers.get("Location") ?? "";
		expect(location).toContain("access.line.me");
		expect(location).toContain("client_id=test_channel_id");
		expect(location).toContain("scope=profile+openid");
	});

	it("stores oauth state in KV with 10-minute TTL", async () => {
		const kv = createMockKV();
		const env = createEnv({ SESSION_KV: kv });
		await testApp.request("http://localhost/api/auth/login", {}, env);
		expect(kv.put).toHaveBeenCalledWith(
			expect.stringMatching(/^oauth_state:/),
			"1",
			{ expirationTtl: 600 },
		);
	});
});

describe("GET /api/auth/callback", () => {
	it("returns 400 when code and state are missing", async () => {
		const res = await testApp.request(
			"http://localhost/api/auth/callback",
			{},
			createEnv(),
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 when state is not found in KV", async () => {
		const res = await testApp.request(
			"http://localhost/api/auth/callback?code=testcode&state=invalid_state",
			{},
			createEnv(),
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
		const res = await testApp.request(
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
				new Response(JSON.stringify({ access_token: "token" }), {
					status: 200,
				}),
			)
			.mockResolvedValueOnce(new Response(null, { status: 500 }));
		const res = await testApp.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(500);
	});

	it("redirects to /?error=not_registered when user not found in DB", async () => {
		const state = "valid_state";
		const kv = createMockKV({ [`oauth_state:${state}`]: "1" });
		const env = createEnv({ SESSION_KV: kv });
		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ access_token: "token" }), {
					status: 200,
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ userId: "U1234" }), { status: 200 }),
			);
		const res = await testApp.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toContain("error=not_registered");
	});

	it("links LINE account and creates session for invite callback", async () => {
		// Seed user with invite token
		const [inviteUser] = await db
			.insert(schema.users)
			.values({
				name: "New Member",
				role: "member",
				inviteToken: "invite-token-abc",
				inviteUsed: false,
				isActive: true,
			})
			.returning();

		const state = "invite_state";
		const kv = createMockKV({
			[`oauth_state:${state}`]: JSON.stringify({
				inviteToken: "invite-token-abc",
			}),
		});
		const env = createEnv({ SESSION_KV: kv });

		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ access_token: "token" }), {
					status: 200,
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ userId: "U_new_line" }), { status: 200 }),
			);

		const res = await testApp.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toBe("/");
		expect(res.headers.get("Set-Cookie")).toContain("session_id=");

		// Verify LINE was linked and session stored
		expect(kv.put).toHaveBeenCalledWith(
			expect.stringMatching(/^session:/),
			expect.stringContaining(`"userId":${inviteUser.id}`),
			{ expirationTtl: 60 * 60 * 24 * 30 },
		);
	});

	it("redirects with error when LINE ID is already used by another user on invite callback", async () => {
		// One user with the invite token, another already linked with this LINE ID
		await db.insert(schema.users).values([
			{
				name: "New Member",
				inviteToken: "invite-token-dup",
				inviteUsed: false,
				isActive: true,
			},
			{
				name: "Existing",
				lineUserId: "U_duplicate",
				inviteToken: "other-token",
				inviteUsed: true,
				isActive: true,
			},
		]);

		const state = "invite_state";
		const kv = createMockKV({
			[`oauth_state:${state}`]: JSON.stringify({
				inviteToken: "invite-token-dup",
			}),
		});
		const env = createEnv({ SESSION_KV: kv });

		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ access_token: "token" }), {
					status: 200,
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ userId: "U_duplicate" }), {
					status: 200,
				}),
			);

		const res = await testApp.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toContain("error=line_already_linked");
	});

	it("creates session, sets cookie, and redirects to / on success", async () => {
		// Seed a user with the LINE ID
		const [user] = await db
			.insert(schema.users)
			.values({
				name: "Test User",
				role: "member",
				lineUserId: "U1234",
				inviteToken: "tok_user",
				inviteUsed: true,
				isActive: true,
			})
			.returning();

		const state = "valid_state";
		const kv = createMockKV({ [`oauth_state:${state}`]: "1" });
		const env = createEnv({ SESSION_KV: kv });

		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ access_token: "token" }), {
					status: 200,
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ userId: "U1234" }), { status: 200 }),
			);

		const res = await testApp.request(
			`http://localhost/api/auth/callback?code=testcode&state=${state}`,
			{},
			env,
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toBe("/");
		expect(res.headers.get("Set-Cookie")).toContain("session_id=");
		expect(kv.put).toHaveBeenCalledWith(
			expect.stringMatching(/^session:/),
			expect.stringContaining(`"userId":${user.id}`),
			{ expirationTtl: 60 * 60 * 24 * 30 },
		);
	});
});

describe("POST /api/auth/logout", () => {
	it("deletes session from KV and returns 204", async () => {
		const kv = createMockKV({ "session:test_sid": '{"userId":1}' });
		const env = createEnv({ SESSION_KV: kv });
		const res = await testApp.request(
			"http://localhost/api/auth/logout",
			{ method: "POST", headers: { Cookie: "session_id=test_sid" } },
			env,
		);
		expect(res.status).toBe(204);
		expect(kv.delete).toHaveBeenCalledWith("session:test_sid");
	});

	it("returns 204 even without session cookie", async () => {
		const res = await testApp.request(
			"http://localhost/api/auth/logout",
			{ method: "POST" },
			createEnv(),
		);
		expect(res.status).toBe(204);
	});
});

describe("GET /api/auth/me", () => {
	it("returns 401 when no session cookie", async () => {
		const res = await testApp.request(
			"http://localhost/api/auth/me",
			{},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 401 when session is not found in KV", async () => {
		const res = await testApp.request(
			"http://localhost/api/auth/me",
			{ headers: { Cookie: "session_id=ghost" } },
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 401 when user is inactive", async () => {
		const [user] = await db
			.insert(schema.users)
			.values({
				name: "Inactive User",
				lineUserId: "U1234",
				inviteToken: "tok_inactive",
				inviteUsed: true,
				isActive: false,
			})
			.returning();
		const kv = createMockKV({
			"session:sid": JSON.stringify({
				userId: user.id,
				lineUserId: "U1234",
				role: "member",
			}),
		});
		const res = await testApp.request(
			"http://localhost/api/auth/me",
			{ headers: { Cookie: "session_id=sid" } },
			createEnv({ SESSION_KV: kv }),
		);
		expect(res.status).toBe(401);
	});

	it("returns user info for a valid session", async () => {
		const [user] = await db
			.insert(schema.users)
			.values({
				name: "Test User",
				role: "member",
				lineUserId: "U1234",
				inviteToken: "tok_user",
				inviteUsed: true,
				isActive: true,
			})
			.returning();
		const kv = createMockKV({
			"session:sid": JSON.stringify({
				userId: user.id,
				lineUserId: "U1234",
				role: "member",
			}),
		});
		const res = await testApp.request(
			"http://localhost/api/auth/me",
			{ headers: { Cookie: "session_id=sid" } },
			createEnv({ SESSION_KV: kv }),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: user.id,
			name: "Test User",
			role: "member",
		});
	});

	it("bypasses auth and returns dev user when DEV_AUTH=true", async () => {
		const res = await testApp.request(
			"http://localhost/api/auth/me",
			{},
			createEnv({ DEV_AUTH: "true" }),
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({ name: "Dev Admin", role: "admin" });
	});
});
