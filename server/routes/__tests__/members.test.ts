import { afterEach, describe, expect, it, vi } from "vitest";
import { createEnv, createMockKV } from "../../__tests__/helpers.ts";
import app from "../../index.ts";

afterEach(() => {
	vi.restoreAllMocks();
});

const memberHeaders = { Cookie: "session_id=member_sid" };

function createAuthStmt() {
	return {
		bind: vi.fn().mockReturnThis(),
		first: vi.fn().mockResolvedValue({
			id: 1,
			name: "Member User",
			role: "member",
			line_user_id: "U_member",
			is_active: 1,
		}),
		all: vi.fn(),
		run: vi.fn(),
	};
}

function createDbWithPrepare(stmts: Record<string, unknown>[]): D1Database {
	let prepareCallCount = 0;
	const authStmt = createAuthStmt();
	return {
		prepare: vi.fn(() => {
			prepareCallCount++;
			if (prepareCallCount === 1) return authStmt;
			return stmts[prepareCallCount - 2] ?? stmts[stmts.length - 1];
		}),
		batch: vi.fn(),
		exec: vi.fn(),
		dump: vi.fn(),
	} as unknown as D1Database;
}

function createEnvWithDb(db: D1Database) {
	const kv = createMockKV({
		"session:member_sid": JSON.stringify({
			userId: 1,
			lineUserId: "U_member",
			role: "member",
		}),
	});
	return createEnv({ SESSION_KV: kv, DB: db });
}

describe("GET /api/members", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request("http://localhost/api/members", {}, env);
		expect(res.status).toBe(401);
	});

	it("returns active members list", async () => {
		const rows = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		];
		const allStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi
				.fn()
				.mockResolvedValue({ results: rows, success: true, meta: {} }),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([allStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/members",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual([
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		]);
	});

	it("returns empty array when no active members", async () => {
		const allStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn().mockResolvedValue({ results: [], success: true, meta: {} }),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([allStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/members",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual([]);
	});
});
