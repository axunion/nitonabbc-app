import { eq } from "drizzle-orm";
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

async function seedAdminAndEnv() {
	const [admin] = await db
		.insert(schema.users)
		.values({
			name: "Admin User",
			role: "admin",
			lineUserId: "U_admin",
			inviteToken: "admin_token",
			inviteUsed: true,
			isActive: true,
		})
		.returning();
	const kv = createMockKV({
		"session:admin_sid": JSON.stringify({
			userId: admin.id,
			lineUserId: "U_admin",
			role: "admin",
		}),
	});
	return { admin, env: createEnv({ SESSION_KV: kv }) };
}

async function seedMemberAndEnv() {
	const [member] = await db
		.insert(schema.users)
		.values({
			name: "Member User",
			role: "member",
			lineUserId: "U_member",
			inviteToken: "member_token",
			inviteUsed: true,
			isActive: true,
		})
		.returning();
	const kv = createMockKV({
		"session:member_sid": JSON.stringify({
			userId: member.id,
			lineUserId: "U_member",
			role: "member",
		}),
	});
	return { member, env: createEnv({ SESSION_KV: kv }) };
}

const adminHeaders = { Cookie: "session_id=admin_sid" };
const memberHeaders = { Cookie: "session_id=member_sid" };

describe("GET /api/admin/members", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/admin/members",
			{},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 403 for member role", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/admin/members",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(403);
	});

	it("returns member list for admin", async () => {
		const { env } = await seedAdminAndEnv();
		// Seed a second user
		await db.insert(schema.users).values({
			name: "Member",
			role: "member",
			lineUserId: null,
			inviteToken: "tok_member",
			inviteUsed: false,
			isActive: true,
		});

		const res = await testApp.request(
			"http://localhost/api/admin/members",
			{ headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as unknown[];
		expect(json).toHaveLength(2);
		expect(json[0]).toMatchObject({
			name: "Admin User",
			role: "admin",
			lineUserId: "U_admin",
			inviteUsed: true,
			isActive: true,
		});
		expect(json[1]).toMatchObject({
			name: "Member",
			role: "member",
			lineUserId: null,
			inviteUsed: false,
			isActive: true,
		});
	});
});

describe("POST /api/admin/members", () => {
	it("returns 400 when name is missing", async () => {
		const { env } = await seedAdminAndEnv();
		const res = await testApp.request(
			"http://localhost/api/admin/members",
			{
				method: "POST",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ role: "member" }),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 when role is invalid", async () => {
		const { env } = await seedAdminAndEnv();
		const res = await testApp.request(
			"http://localhost/api/admin/members",
			{
				method: "POST",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "New", role: "superadmin" }),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("creates a member with 201 and returns the new member", async () => {
		const { env } = await seedAdminAndEnv();
		const res = await testApp.request(
			"http://localhost/api/admin/members",
			{
				method: "POST",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "New Member", role: "member" }),
			},
			env,
		);
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json).toMatchObject({
			name: "New Member",
			role: "member",
			lineUserId: null,
			inviteUsed: false,
			isActive: true,
		});
		expect(typeof (json as { inviteToken: string }).inviteToken).toBe("string");
	});
});

describe("PUT /api/admin/members/:id", () => {
	it("returns 404 when member not found", async () => {
		const { env } = await seedAdminAndEnv();
		const res = await testApp.request(
			"http://localhost/api/admin/members/9999",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "Updated" }),
			},
			env,
		);
		expect(res.status).toBe(404);
	});

	it("updates member and returns 200", async () => {
		const { env } = await seedAdminAndEnv();
		const [target] = await db
			.insert(schema.users)
			.values({
				name: "Old Name",
				role: "member",
				inviteToken: "tok_target",
			})
			.returning();

		const res = await testApp.request(
			`http://localhost/api/admin/members/${target.id}`,
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "New Name", role: "admin" }),
			},
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: target.id,
			name: "New Name",
			role: "admin",
		});
	});
});

describe("DELETE /api/admin/members/:id", () => {
	it("returns 404 when member not found", async () => {
		const { env } = await seedAdminAndEnv();
		const res = await testApp.request(
			"http://localhost/api/admin/members/9999",
			{ method: "DELETE", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("returns 400 when trying to deactivate self", async () => {
		const { admin, env } = await seedAdminAndEnv();
		const res = await testApp.request(
			`http://localhost/api/admin/members/${admin.id}`,
			{ method: "DELETE", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json).toMatchObject({ error: "Cannot deactivate yourself" });
	});

	it("deactivates member with 200", async () => {
		const { env } = await seedAdminAndEnv();
		const [target] = await db
			.insert(schema.users)
			.values({ name: "Target", inviteToken: "tok_target" })
			.returning();

		const res = await testApp.request(
			`http://localhost/api/admin/members/${target.id}`,
			{ method: "DELETE", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ ok: true });

		// Verify the user is now inactive in DB
		const [row] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, target.id));
		expect(row?.isActive).toBe(false);
	});
});

describe("POST /api/admin/members/:id/reinvite", () => {
	it("returns 404 when member not found", async () => {
		const { env } = await seedAdminAndEnv();
		const res = await testApp.request(
			"http://localhost/api/admin/members/9999/reinvite",
			{ method: "POST", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("resets LINE link and generates new invite token", async () => {
		const { env } = await seedAdminAndEnv();
		const [target] = await db
			.insert(schema.users)
			.values({
				name: "Linked Member",
				lineUserId: "U_old",
				inviteToken: "old_token",
				inviteUsed: true,
			})
			.returning();

		const res = await testApp.request(
			`http://localhost/api/admin/members/${target.id}/reinvite`,
			{ method: "POST", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: target.id,
			lineUserId: null,
			inviteUsed: false,
		});
		// New token must differ from old
		expect((json as { inviteToken: string }).inviteToken).not.toBe("old_token");
	});
});
