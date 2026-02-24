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

// Helper: create env with valid member session + DB that returns member user for auth
function createMemberEnv() {
	const kv = createMockKV({
		"session:member_sid": JSON.stringify({
			userId: 1,
			lineUserId: "U_member",
			role: "member",
		}),
	});
	const db = createMockD1([
		{
			id: 1,
			name: "Member User",
			role: "member",
			line_user_id: "U_member",
			is_active: 1,
		},
	]);
	return createEnv({ SESSION_KV: kv, DB: db });
}

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

// --- GET /api/bulletin ---

describe("GET /api/bulletin", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request("http://localhost/api/bulletin", {}, env);
		expect(res.status).toBe(401);
	});

	it("returns empty array when no bulletins", async () => {
		const allStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn().mockResolvedValue({ results: [], success: true, meta: {} }),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([allStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual([]);
	});

	it("returns bulletins sorted by service_date DESC", async () => {
		const rows = [
			{
				id: 2,
				service_date: "2025-06-15",
				worship: "[]",
				announcements: "[]",
				assignments: "{}",
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-10 00:00:00",
				updated_at: "2025-06-10 00:00:00",
			},
			{
				id: 1,
				service_date: "2025-06-08",
				worship: "[]",
				announcements: "[]",
				assignments: "{}",
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-01 00:00:00",
				updated_at: "2025-06-01 00:00:00",
			},
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
			"http://localhost/api/bulletin",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as unknown[];
		expect(json).toHaveLength(2);
		expect(json[0]).toMatchObject({ id: 2, serviceDate: "2025-06-15" });
		expect(json[1]).toMatchObject({ id: 1, serviceDate: "2025-06-08" });
	});
});

// --- GET /api/bulletin/:id ---

describe("GET /api/bulletin/:id", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request("http://localhost/api/bulletin/1", {}, env);
		expect(res.status).toBe(401);
	});

	it("returns 404 when bulletin not found", async () => {
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/999",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("returns bulletin with parsed JSON fields", async () => {
		const row = {
			id: 1,
			service_date: "2025-06-08",
			worship: JSON.stringify([
				{ type: "hymn", label: "賛美歌", details: "312番" },
			]),
			announcements: JSON.stringify([{ content: "来週は合同礼拝です" }]),
			assignments: JSON.stringify({ 受付: "田中", 音響: "佐藤" }),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(row),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 1,
			serviceDate: "2025-06-08",
			worship: [{ type: "hymn", label: "賛美歌", details: "312番" }],
			announcements: [{ content: "来週は合同礼拝です" }],
			assignments: { 受付: "田中", 音響: "佐藤" },
			createdBy: 1,
			updatedBy: 1,
		});
	});
});

// --- POST /api/bulletin ---

describe("POST /api/bulletin", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-06-08" }),
			},
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns 400 when serviceDate is missing", async () => {
		const env = createMemberEnv();
		const res = await app.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({}),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 when serviceDate format is invalid", async () => {
		const env = createMemberEnv();
		const res = await app.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "06/08/2025" }),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 409 when serviceDate already exists", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi
				.fn()
				.mockRejectedValue(
					new Error("UNIQUE constraint failed: bulletins.service_date"),
				),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-06-08" }),
			},
			env,
		);
		expect(res.status).toBe(409);
	});

	it("creates bulletin with 201", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: { last_row_id: 1 },
				results: [],
			}),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				service_date: "2025-06-08",
				worship: JSON.stringify([{ type: "prelude", label: "前奏" }]),
				announcements: "[]",
				assignments: "{}",
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-01 00:00:00",
				updated_at: "2025-06-01 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([runStmt, selectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({
					serviceDate: "2025-06-08",
					worship: [{ type: "prelude", label: "前奏" }],
				}),
			},
			env,
		);
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 1,
			serviceDate: "2025-06-08",
			worship: [{ type: "prelude", label: "前奏" }],
		});
	});
});

// --- PUT /api/bulletin/:id ---

describe("PUT /api/bulletin/:id", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ announcements: [] }),
			},
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns 404 when bulletin not found", async () => {
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/999",
			{
				method: "PUT",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ announcements: [] }),
			},
			env,
		);
		expect(res.status).toBe(404);
	});

	it("updates bulletin partially and returns 200", async () => {
		const existStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ id: 1 }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const reSelectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				service_date: "2025-06-08",
				worship: "[]",
				announcements: JSON.stringify([{ content: "Updated" }]),
				assignments: "{}",
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-01 00:00:00",
				updated_at: "2025-06-05 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([existStmt, runStmt, reSelectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{
				method: "PUT",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ announcements: [{ content: "Updated" }] }),
			},
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 1,
			announcements: [{ content: "Updated" }],
			updatedBy: 1,
		});
	});
});

// --- DELETE /api/bulletin/:id ---

describe("DELETE /api/bulletin/:id", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ method: "DELETE" },
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns 404 when bulletin not found", async () => {
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/999",
			{ method: "DELETE", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("deletes bulletin and returns 200", async () => {
		const existStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ id: 1 }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([existStmt, runStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ method: "DELETE", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({ ok: true });
	});
});
