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

const sampleSections = JSON.stringify([
	{
		id: "worship",
		type: "worship-program",
		label: "礼拝プログラム",
		data: [{ type: "hymn", label: "賛美歌", details: "312番" }],
	},
	{
		id: "announcements",
		type: "announcements",
		label: "お知らせ",
		data: [{ content: "来週は合同礼拝です" }],
	},
	{
		id: "assignments",
		type: "assignments",
		label: "奉仕当番",
		data: { 受付: "田中", 音響: "佐藤" },
	},
]);

// --- GET /api/bulletin ---

describe("GET /api/bulletin", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request("http://localhost/api/bulletin", {}, env);
		expect(res.status).toBe(401);
	});

	it("returns empty array when no bulletins", async () => {
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const allStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn().mockResolvedValue({ results: [], success: true, meta: {} }),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, allStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as {
			bulletins: unknown[];
			nextSunday: string;
		};
		expect(json.bulletins).toEqual([]);
		expect(json.nextSunday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it("returns bulletins sorted by service_date DESC", async () => {
		const rows = [
			{
				id: 2,
				service_date: "2025-06-15",
				sections: "[]",
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-10 00:00:00",
				updated_at: "2025-06-10 00:00:00",
			},
			{
				id: 1,
				service_date: "2025-06-08",
				sections: "[]",
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-01 00:00:00",
				updated_at: "2025-06-01 00:00:00",
			},
		];
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const allStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi
				.fn()
				.mockResolvedValue({ results: rows, success: true, meta: {} }),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, allStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as {
			bulletins: unknown[];
			nextSunday: string;
		};
		expect(json.bulletins).toHaveLength(2);
		expect(json.bulletins[0]).toMatchObject({
			id: 2,
			serviceDate: "2025-06-15",
		});
		expect(json.bulletins[1]).toMatchObject({
			id: 1,
			serviceDate: "2025-06-08",
		});
		expect(json.nextSunday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/999",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("returns bulletin with parsed sections field", async () => {
		const row = {
			id: 1,
			service_date: "2025-06-08",
			sections: sampleSections,
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(row),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
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
			sections: [
				{
					id: "worship",
					type: "worship-program",
					data: [{ type: "hymn", label: "賛美歌", details: "312番" }],
				},
				{
					id: "announcements",
					type: "announcements",
					data: [{ content: "来週は合同礼拝です" }],
				},
				{
					id: "assignments",
					type: "assignments",
					data: { 受付: "田中", 音響: "佐藤" },
				},
			],
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
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
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
		const db = createDbWithPrepare([templateStmt, runStmt]);
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

	it("creates bulletin with sections and returns 201", async () => {
		const sections = [
			{
				id: "worship",
				type: "worship-program",
				label: "礼拝プログラム",
				data: [{ type: "prelude", label: "前奏" }],
			},
		];
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
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
				sections: JSON.stringify(sections),
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-01 00:00:00",
				updated_at: "2025-06-01 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, runStmt, selectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-06-08", sections }),
			},
			env,
		);
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 1,
			serviceDate: "2025-06-08",
			sections: [{ id: "worship", type: "worship-program" }],
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
				body: JSON.stringify({ sections: [] }),
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
				body: JSON.stringify({ sections: [] }),
			},
			env,
		);
		expect(res.status).toBe(404);
	});

	it("updates bulletin sections and returns 200", async () => {
		const updatedSections = [
			{
				id: "announcements",
				type: "announcements",
				label: "お知らせ",
				data: [{ content: "Updated" }],
			},
		];
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
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const reSelectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				service_date: "2025-06-08",
				sections: JSON.stringify(updatedSections),
				created_by: 1,
				updated_by: 1,
				created_at: "2025-06-01 00:00:00",
				updated_at: "2025-06-05 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([
			existStmt,
			runStmt,
			templateStmt,
			reSelectStmt,
		]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{
				method: "PUT",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ sections: updatedSections }),
			},
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 1,
			sections: [
				{
					id: "announcements",
					type: "announcements",
					data: [{ content: "Updated" }],
				},
			],
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

// --- POST /api/bulletin/generate ---

describe("POST /api/bulletin/generate", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST" },
			env,
		);
		expect(res.status).toBe(401);
	});

	it("generates bulletin from SectionTemplate[] and returns 201", async () => {
		const templateValue = JSON.stringify([
			{
				id: "worship",
				type: "worship-program",
				label: "礼拝プログラム",
				visible: true,
				config: {
					items: [
						{ type: "prelude", label: "前奏", inputType: "none" },
						{ type: "hymn", label: "賛美歌", inputType: "text" },
					],
				},
			},
			{
				id: "announcements",
				type: "announcements",
				label: "お知らせ",
				visible: true,
				config: { subHeadings: [] },
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: { last_row_id: 10 },
				results: [],
			}),
		};
		const generatedSections = [
			{
				id: "worship",
				type: "worship-program",
				label: "礼拝プログラム",
				data: [
					{ type: "prelude", label: "前奏" },
					{ type: "hymn", label: "賛美歌" },
				],
			},
			{
				id: "announcements",
				type: "announcements",
				label: "お知らせ",
				data: [],
			},
		];
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 10,
				service_date: "2026-04-27",
				sections: JSON.stringify(generatedSections),
				created_by: 1,
				updated_by: 1,
				created_at: "2026-04-23 00:00:00",
				updated_at: "2026-04-23 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, runStmt, selectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(201);
		const json = (await res.json()) as { id: number; sections: unknown[] };
		expect(json.id).toBe(10);
		expect(json.sections).toHaveLength(2);
	});

	it("generates bulletin with weekly-prayer section initialized to 7 empty days", async () => {
		const templateValue = JSON.stringify([
			{
				id: "prayer",
				type: "weekly-prayer",
				label: "今週の祈り",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: { last_row_id: 20 },
				results: [],
			}),
		};
		const generatedSections = [
			{
				id: "prayer",
				type: "weekly-prayer",
				label: "今週の祈り",
				data: { 日: "", 月: "", 火: "", 水: "", 木: "", 金: "", 土: "" },
			},
		];
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 20,
				service_date: "2026-04-27",
				sections: JSON.stringify(generatedSections),
				created_by: 1,
				updated_by: 1,
				created_at: "2026-04-23 00:00:00",
				updated_at: "2026-04-23 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, runStmt, selectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(201);
		const json = (await res.json()) as {
			id: number;
			sections: { type: string; data: Record<string, string> }[];
		};
		expect(json.id).toBe(20);
		expect(json.sections).toHaveLength(1);
		expect(json.sections[0].type).toBe("weekly-prayer");
		expect(json.sections[0].data).toEqual({
			日: "",
			月: "",
			火: "",
			水: "",
			木: "",
			金: "",
			土: "",
		});
	});

	it("returns 409 when next Sunday already exists", async () => {
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				value: JSON.stringify([
					{
						id: "worship",
						type: "worship-program",
						label: "礼拝プログラム",
						visible: true,
						config: { items: [] },
					},
				]),
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
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
		const db = createDbWithPrepare([templateStmt, runStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(409);
	});
});

// --- Progress counting ---

describe("progress counting via GET /api/bulletin/:id", () => {
	it("counts announcements as 1/1 when at least one item exists", async () => {
		const templateValue = JSON.stringify([
			{
				id: "announcements",
				type: "announcements",
				label: "お知らせ",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "announcements",
					type: "announcements",
					label: "お知らせ",
					data: [{ content: "テスト" }],
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 1, filledItems: 1 });
	});

	it("counts announcements as 0/1 when no items", async () => {
		const templateValue = JSON.stringify([
			{
				id: "announcements",
				type: "announcements",
				label: "お知らせ",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "announcements",
					type: "announcements",
					label: "お知らせ",
					data: [],
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 1, filledItems: 0 });
	});

	it("counts assignments against template roles", async () => {
		const templateValue = JSON.stringify([
			{
				id: "assignments",
				type: "assignments",
				label: "奉仕当番",
				visible: true,
				config: { roles: ["司会", "奏楽", "受付"] },
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "assignments",
					type: "assignments",
					label: "奉仕当番",
					data: { 司会: "田中", 奏楽: "山田", 受付: "" },
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 3, filledItems: 2 });
	});

	it("does not count text-block in progress", async () => {
		const templateValue = JSON.stringify([
			{
				id: "tb",
				type: "text-block",
				label: "汎用テキスト",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "tb",
					type: "text-block",
					label: "汎用テキスト",
					data: { heading: "見出し", body: "本文テキスト" },
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 0, filledItems: 0 });
	});

	it("counts weekly-verse as 1/1 when text is filled", async () => {
		const templateValue = JSON.stringify([
			{
				id: "verse",
				type: "weekly-verse",
				label: "今週のみことば",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "verse",
					type: "weekly-verse",
					label: "今週のみことば",
					data: {
						reference: "ローマ人への手紙 8:28",
						text: "神を愛する人たち...",
					},
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 1, filledItems: 1 });
	});

	it("counts monthly-song as 1/1 when title is filled", async () => {
		const templateValue = JSON.stringify([
			{
				id: "song",
				type: "monthly-song",
				label: "今月の歌",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "song",
					type: "monthly-song",
					label: "今月の歌",
					data: { title: "暗闇 過ぎ去って", keywords: ["ハレルヤ"] },
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 1, filledItems: 1 });
	});

	it("counts monthly-song as 0/1 when title is empty", async () => {
		const templateValue = JSON.stringify([
			{
				id: "song",
				type: "monthly-song",
				label: "今月の歌",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "song",
					type: "monthly-song",
					label: "今月の歌",
					data: { title: "", keywords: [] },
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 1, filledItems: 0 });
	});

	it("counts weekly-prayer as filled/7 based on non-empty day values", async () => {
		const templateValue = JSON.stringify([
			{
				id: "prayer",
				type: "weekly-prayer",
				label: "今週の祈り",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "prayer",
					type: "weekly-prayer",
					label: "今週の祈り",
					data: {
						日: "牧師の働き",
						月: "兄弟姉妹の健康",
						火: "",
						水: "求道者の救い",
						木: "",
						金: "宣教師の働き",
						土: "礼拝の準備",
					},
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 7, filledItems: 5 });
	});

	it("counts weekly-prayer as 0/7 when all days are empty", async () => {
		const templateValue = JSON.stringify([
			{
				id: "prayer",
				type: "weekly-prayer",
				label: "今週の祈り",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "prayer",
					type: "weekly-prayer",
					label: "今週の祈り",
					data: { 日: "", 月: "", 火: "", 水: "", 木: "", 金: "", 土: "" },
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 7, filledItems: 0 });
	});

	it("counts weekly-verse as 0/1 when text is empty", async () => {
		const templateValue = JSON.stringify([
			{
				id: "verse",
				type: "weekly-verse",
				label: "今週のみことば",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "verse",
					type: "weekly-verse",
					label: "今週のみことば",
					data: { reference: "", text: "" },
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 1, filledItems: 0 });
	});

	it("does not count upcoming-events in progress (0/0)", async () => {
		const templateValue = JSON.stringify([
			{
				id: "events",
				type: "upcoming-events",
				label: "今後の予定",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "events",
					type: "upcoming-events",
					label: "今後の予定",
					data: [
						{ date: "2026-05-04〜06", description: "全国青年キャンプ" },
						{ date: "2026-05-10", description: "母の日合同礼拝" },
					],
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 0, filledItems: 0 });
	});
});

// --- birthdays section ---

describe("birthdays section progress and generation", () => {
	it("does not count birthdays in progress (0/0)", async () => {
		const templateValue = JSON.stringify([
			{
				id: "bdays",
				type: "birthdays",
				label: "今月の誕生日",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "bdays",
					type: "birthdays",
					label: "今月の誕生日",
					data: [
						{ day: "2日", name: "勇人兄" },
						{ day: "6日", name: "太秀師" },
					],
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 0, filledItems: 0 });
	});

	it("generates bulletin with birthdays section initialized to empty array", async () => {
		const templateValue = JSON.stringify([
			{
				id: "bdays",
				type: "birthdays",
				label: "今月の誕生日",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: { last_row_id: 40 },
				results: [],
			}),
		};
		const generatedSections = [
			{
				id: "bdays",
				type: "birthdays",
				label: "今月の誕生日",
				data: [],
			},
		];
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 40,
				service_date: "2026-04-27",
				sections: JSON.stringify(generatedSections),
				created_by: 1,
				updated_by: 1,
				created_at: "2026-04-23 00:00:00",
				updated_at: "2026-04-23 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, runStmt, selectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(201);
		const json = (await res.json()) as {
			id: number;
			sections: { type: string; data: unknown[] }[];
		};
		expect(json.id).toBe(40);
		expect(json.sections).toHaveLength(1);
		expect(json.sections[0].type).toBe("birthdays");
		expect(json.sections[0].data).toEqual([]);
	});

	it("returns birthdays section data when fetching a bulletin by id", async () => {
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 5,
			service_date: "2026-04-27",
			sections: JSON.stringify([
				{
					id: "bdays",
					type: "birthdays",
					label: "今月の誕生日",
					data: [{ day: "2日", name: "勇人兄" }],
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2026-04-23 00:00:00",
			updated_at: "2026-04-23 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/5",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 5,
			sections: [
				{
					id: "bdays",
					type: "birthdays",
					data: [{ day: "2日", name: "勇人兄" }],
				},
			],
		});
	});
});

// --- scripture-quotes section ---

describe("scripture-quotes section progress and generation", () => {
	it("does not count scripture-quotes in progress (0/0)", async () => {
		const templateValue = JSON.stringify([
			{
				id: "sq",
				type: "scripture-quotes",
				label: "引用聖句",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 1,
			service_date: "2025-06-08",
			sections: JSON.stringify([
				{
					id: "sq",
					type: "scripture-quotes",
					label: "引用聖句",
					data: [
						{
							reference: "ガラテヤ人への手紙 6:2",
							text: "互いの重荷を負い合いなさい。",
						},
					],
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2025-06-01 00:00:00",
			updated_at: "2025-06-01 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/1",
			{ headers: memberHeaders },
			env,
		);
		const json = await res.json();
		expect(json).toMatchObject({ totalItems: 0, filledItems: 0 });
	});

	it("generates bulletin with scripture-quotes section initialized to empty array", async () => {
		const templateValue = JSON.stringify([
			{
				id: "sq",
				type: "scripture-quotes",
				label: "引用聖句",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: { last_row_id: 50 },
				results: [],
			}),
		};
		const generatedSections = [
			{
				id: "sq",
				type: "scripture-quotes",
				label: "引用聖句",
				data: [],
			},
		];
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 50,
				service_date: "2026-04-27",
				sections: JSON.stringify(generatedSections),
				created_by: 1,
				updated_by: 1,
				created_at: "2026-04-23 00:00:00",
				updated_at: "2026-04-23 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, runStmt, selectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(201);
		const json = (await res.json()) as {
			id: number;
			sections: { type: string; data: unknown[] }[];
		};
		expect(json.id).toBe(50);
		expect(json.sections).toHaveLength(1);
		expect(json.sections[0].type).toBe("scripture-quotes");
		expect(json.sections[0].data).toEqual([]);
	});

	it("returns scripture-quotes section data when fetching a bulletin by id", async () => {
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const bulletinRow = {
			id: 6,
			service_date: "2026-04-27",
			sections: JSON.stringify([
				{
					id: "sq",
					type: "scripture-quotes",
					label: "引用聖句",
					data: [
						{
							reference: "ガラテヤ人への手紙 6:2",
							text: "互いの重荷を負い合いなさい。",
						},
					],
				},
			]),
			created_by: 1,
			updated_by: 1,
			created_at: "2026-04-23 00:00:00",
			updated_at: "2026-04-23 00:00:00",
		};
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(bulletinRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, firstStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/6",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 6,
			sections: [
				{
					id: "sq",
					type: "scripture-quotes",
					data: [
						{
							reference: "ガラテヤ人への手紙 6:2",
							text: "互いの重荷を負い合いなさい。",
						},
					],
				},
			],
		});
	});
});

// --- upcoming-events section generation ---

describe("upcoming-events section via POST /api/bulletin/generate", () => {
	it("generates bulletin with upcoming-events section initialized to empty array", async () => {
		const templateValue = JSON.stringify([
			{
				id: "events",
				type: "upcoming-events",
				label: "今後の予定",
				visible: true,
				config: {},
			},
		]);
		const templateStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({ value: templateValue }),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: { last_row_id: 30 },
				results: [],
			}),
		};
		const generatedSections = [
			{
				id: "events",
				type: "upcoming-events",
				label: "今後の予定",
				data: [],
			},
		];
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 30,
				service_date: "2026-04-27",
				sections: JSON.stringify(generatedSections),
				created_by: 1,
				updated_by: 1,
				created_at: "2026-04-23 00:00:00",
				updated_at: "2026-04-23 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const db = createDbWithPrepare([templateStmt, runStmt, selectStmt]);
		const env = createEnvWithDb(db);

		const res = await app.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(201);
		const json = (await res.json()) as {
			id: number;
			sections: { type: string; data: unknown[] }[];
		};
		expect(json.id).toBe(30);
		expect(json.sections).toHaveLength(1);
		expect(json.sections[0].type).toBe("upcoming-events");
		expect(json.sections[0].data).toEqual([]);
	});
});
