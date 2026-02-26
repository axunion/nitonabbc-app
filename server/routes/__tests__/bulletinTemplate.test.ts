import { afterEach, describe, expect, it, vi } from "vitest";
import {
	createEnv,
	createMockD1,
	createMockKV,
} from "../../__tests__/helpers.ts";
import app from "../../index.ts";

afterEach(() => {
	vi.restoreAllMocks();
});

const adminHeaders = { Cookie: "session_id=admin_sid" };
const memberHeaders = { Cookie: "session_id=member_sid" };

function createAdminAuthStmt() {
	return {
		bind: vi.fn().mockReturnThis(),
		first: vi.fn().mockResolvedValue({
			id: 1,
			name: "Admin User",
			role: "admin",
			line_user_id: "U_admin",
			is_active: 1,
		}),
		all: vi.fn(),
		run: vi.fn(),
	};
}

function createMemberAuthStmt() {
	return {
		bind: vi.fn().mockReturnThis(),
		first: vi.fn().mockResolvedValue({
			id: 2,
			name: "Member User",
			role: "member",
			line_user_id: "U_member",
			is_active: 1,
		}),
		all: vi.fn(),
		run: vi.fn(),
	};
}

function createAdminKV() {
	return createMockKV({
		"session:admin_sid": JSON.stringify({
			userId: 1,
			lineUserId: "U_admin",
			role: "admin",
		}),
	});
}

function createMemberKV() {
	return createMockKV({
		"session:member_sid": JSON.stringify({
			userId: 2,
			lineUserId: "U_member",
			role: "member",
		}),
	});
}

function createDbWithPrepare(
	stmts: Record<string, unknown>[],
	authStmt?: Record<string, unknown>,
): D1Database {
	let prepareCallCount = 0;
	const auth = authStmt ?? createAdminAuthStmt();
	return {
		prepare: vi.fn(() => {
			prepareCallCount++;
			if (prepareCallCount === 1) return auth;
			return stmts[prepareCallCount - 2] ?? stmts[stmts.length - 1];
		}),
		batch: vi.fn(),
		exec: vi.fn(),
		dump: vi.fn(),
	} as unknown as D1Database;
}

// --- GET /api/bulletin-template ---

describe("GET /api/bulletin-template", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{},
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns default template when not set in DB", async () => {
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([selectStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{ headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as { type: string; label: string }[];
		expect(Array.isArray(json)).toBe(true);
		expect(json.length).toBeGreaterThan(0);
		expect(json[0]).toHaveProperty("type");
		expect(json[0]).toHaveProperty("label");
	});

	it("returns stored template from DB", async () => {
		const stored = [
			{ type: "hymn", label: "Hymn" },
			{ type: "sermon", label: "Sermon" },
		];
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				key: "worship_template",
				value: JSON.stringify(stored),
				updated_at: "2025-01-01 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([selectStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{ headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual(stored);
	});

	it("allows member access (not admin-only)", async () => {
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([selectStmt], createMemberAuthStmt());
		const env = createEnv({ SESSION_KV: createMemberKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
	});
});

// --- PUT /api/bulletin-template ---

describe("PUT /api/bulletin-template", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify([{ type: "hymn", label: "Hymn" }]),
			},
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns 403 for member role", async () => {
		const db = createMockD1([
			{
				id: 2,
				name: "Member User",
				role: "member",
				line_user_id: "U_member",
				is_active: 1,
			},
		]);
		const env = createEnv({ SESSION_KV: createMemberKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: {
					...memberHeaders,
					"Content-Type": "application/json",
				},
				body: JSON.stringify([{ type: "hymn", label: "Hymn" }]),
			},
			env,
		);
		expect(res.status).toBe(403);
	});

	it("returns 400 for empty array", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 for invalid item (missing type or label)", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([{ type: "hymn" }]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("saves template and returns 200", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: {},
				results: [],
			}),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const template = [
			{ type: "prelude", label: "Prelude" },
			{ type: "hymn", label: "Hymn" },
		];
		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify(template),
			},
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({ ok: true });
	});
});
