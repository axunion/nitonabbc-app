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

const validTemplate = [
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
];

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
			first: vi.fn(),
			all: vi.fn().mockResolvedValue({ results: [] }),
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
		const json = (await res.json()) as {
			id: string;
			type: string;
			label: string;
		}[];
		expect(Array.isArray(json)).toBe(true);
		expect(json.length).toBeGreaterThan(0);
		expect(json[0]).toHaveProperty("id");
		expect(json[0]).toHaveProperty("type");
		expect(json[0]).toHaveProperty("label");
		expect(json[0].type).toBe("worship-program");
	});

	it("returns stored SectionTemplate[] from DB", async () => {
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn().mockResolvedValue({
				results: [
					{
						key: "bulletin_template",
						value: JSON.stringify(validTemplate),
					},
				],
			}),
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
		expect(json).toEqual(validTemplate);
	});

	it("allows member access (not admin-only)", async () => {
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn().mockResolvedValue({ results: [] }),
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

	it("migrates old worship_template key to bulletin_template on read", async () => {
		const oldItems = [
			{ type: "prelude", label: "前奏", inputType: "none" },
			{ type: "hymn", label: "賛美歌", inputType: "text" },
		];
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn().mockResolvedValue({
				results: [
					{
						key: "worship_template",
						value: JSON.stringify(oldItems),
					},
				],
			}),
			run: vi.fn(),
		};
		// INSERT new key
		const insertStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		// DELETE old key
		const deleteStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([selectStmt, insertStmt, deleteStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{ headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as {
			id: string;
			type: string;
			config: { items: unknown[] };
		}[];
		expect(Array.isArray(json)).toBe(true);
		expect(json[0].type).toBe("worship-program");
		expect(json[0].config.items).toEqual(oldItems);
		expect(insertStmt.run).toHaveBeenCalled();
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
				body: JSON.stringify(validTemplate),
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
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify(validTemplate),
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

	it("returns 400 when section is missing label", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{ id: "worship", type: "worship-program", config: { items: [] } },
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 for unknown section type", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{ id: "s1", type: "unsupported-type", label: "未知", config: {} },
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("accepts weekly-prayer section and returns 200", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "prayer",
						type: "weekly-prayer",
						label: "今週の祈り",
						visible: true,
						config: {},
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(200);
	});

	it("returns 400 when weekly-prayer config is an array", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "prayer",
						type: "weekly-prayer",
						label: "今週の祈り",
						config: [],
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 for duplicate section ids", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "worship",
						type: "worship-program",
						label: "礼拝1",
						config: {
							items: [{ type: "hymn", label: "賛美歌", inputType: "text" }],
						},
					},
					{
						id: "worship",
						type: "worship-program",
						label: "礼拝2",
						config: {
							items: [{ type: "hymn", label: "賛美歌", inputType: "text" }],
						},
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("accepts text-block section and returns 200", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "tb",
						type: "text-block",
						label: "汎用テキスト",
						visible: true,
						config: {},
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(200);
	});

	it("returns 400 when text-block config is an array", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "tb",
						type: "text-block",
						label: "汎用テキスト",
						config: [],
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("accepts monthly-song section and returns 200", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "song",
						type: "monthly-song",
						label: "今月の歌",
						visible: true,
						config: {},
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(200);
	});

	it("returns 400 when monthly-song config is an array", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "song",
						type: "monthly-song",
						label: "今月の歌",
						config: [],
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("accepts weekly-verse section and returns 200", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "verse",
						type: "weekly-verse",
						label: "今週のみことば",
						visible: true,
						config: {},
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(200);
	});

	it("returns 400 when weekly-verse config is an array", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "verse",
						type: "weekly-verse",
						label: "今週のみことば",
						config: [],
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("accepts upcoming-events section and returns 200", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "events",
						type: "upcoming-events",
						label: "今後の予定",
						visible: true,
						config: {},
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(200);
	});

	it("returns 400 when upcoming-events config is an array", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "events",
						type: "upcoming-events",
						label: "今後の予定",
						config: [],
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("accepts scripture-quotes section and returns 200", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const db = createDbWithPrepare([runStmt]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "sq",
						type: "scripture-quotes",
						label: "引用聖句",
						visible: true,
						config: {},
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(200);
	});

	it("returns 400 when scripture-quotes config is an array", async () => {
		const db = createDbWithPrepare([]);
		const env = createEnv({ SESSION_KV: createAdminKV(), DB: db });

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([
					{
						id: "sq",
						type: "scripture-quotes",
						label: "引用聖句",
						config: [],
					},
				]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("saves SectionTemplate[] and returns 200", async () => {
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

		const res = await app.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify(validTemplate),
			},
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({ ok: true });
	});
});
