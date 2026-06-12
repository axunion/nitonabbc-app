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

async function seedMemberAndEnv() {
	const [user] = await db
		.insert(schema.users)
		.values({
			name: "Member",
			role: "member",
			lineUserId: "U_member",
			inviteToken: "member_token",
			inviteUsed: true,
			isActive: true,
		})
		.returning();
	const kv = createMockKV({
		"session:member_sid": JSON.stringify({
			userId: user.id,
			lineUserId: "U_member",
			role: "member",
		}),
	});
	return { user, env: createEnv({ SESSION_KV: kv }) };
}

const memberHeaders = { Cookie: "session_id=member_sid" };

const sampleSections = [
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
];

// --- GET /api/bulletin ---

describe("GET /api/bulletin", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin",
			{},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns empty array when no bulletins", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect((json as { bulletins: unknown[] }).bulletins).toEqual([]);
		expect(typeof (json as { nextSunday: string }).nextSunday).toBe("string");
	});

	it("returns bulletins ordered by service_date desc", async () => {
		const { user, env } = await seedMemberAndEnv();
		await db.insert(schema.bulletins).values([
			{
				serviceDate: "2025-01-05",
				sections: [],
				createdBy: user.id,
				updatedBy: user.id,
			},
			{
				serviceDate: "2025-01-12",
				sections: [],
				createdBy: user.id,
				updatedBy: user.id,
			},
		]);

		const res = await testApp.request(
			"http://localhost/api/bulletin",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		const list = (json as { bulletins: { serviceDate: string }[] }).bulletins;
		expect(list).toHaveLength(2);
		expect(list[0].serviceDate).toBe("2025-01-12");
		expect(list[1].serviceDate).toBe("2025-01-05");
	});
});

// --- GET /api/bulletin/:id ---

describe("GET /api/bulletin/:id", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin/1",
			{},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 404 when bulletin not found", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin/9999",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("returns bulletin detail", async () => {
		const { user, env } = await seedMemberAndEnv();
		const [bulletin] = await db
			.insert(schema.bulletins)
			.values({
				serviceDate: "2025-01-05",
				sections: sampleSections as never,
				createdBy: user.id,
				updatedBy: user.id,
			})
			.returning();

		const res = await testApp.request(
			`http://localhost/api/bulletin/${bulletin.id}`,
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: bulletin.id,
			serviceDate: "2025-01-05",
			sections: sampleSections,
		});
	});
});

// --- POST /api/bulletin ---

describe("POST /api/bulletin", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-01-05" }),
			},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 400 without serviceDate", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
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

	it("returns 400 with invalid date format", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "not-a-date" }),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("creates a bulletin and returns 201", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({
					serviceDate: "2025-01-05",
					sections: sampleSections,
				}),
			},
			env,
		);
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json).toMatchObject({ serviceDate: "2025-01-05" });
	});

	it("returns 409 for duplicate service date", async () => {
		const { user, env } = await seedMemberAndEnv();
		await db.insert(schema.bulletins).values({
			serviceDate: "2025-01-05",
			sections: [],
			createdBy: user.id,
			updatedBy: user.id,
		});

		const res = await testApp.request(
			"http://localhost/api/bulletin",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-01-05" }),
			},
			env,
		);
		expect(res.status).toBe(409);
	});
});

// --- POST /api/bulletin/generate ---

describe("POST /api/bulletin/generate", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin/generate",
			{ method: "POST" },
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("generates bulletin from template with 201", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin/generate",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-06-01" }),
			},
			env,
		);
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json).toMatchObject({ serviceDate: "2025-06-01" });
	});

	it("generates from the default template when none is saved", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin/generate",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-06-08" }),
			},
			env,
		);
		expect(res.status).toBe(201);
		const created = (await res.json()) as { id: number };

		const detailRes = await testApp.request(
			`http://localhost/api/bulletin/${created.id}`,
			{ headers: memberHeaders },
			env,
		);
		const detail = (await detailRes.json()) as { sections: { id: string }[] };
		expect(detail.sections).toHaveLength(14);
		expect(detail.sections[0].id).toBe("morning");
	});

	it("returns 409 for duplicate service date on generate", async () => {
		const { user, env } = await seedMemberAndEnv();
		await db.insert(schema.bulletins).values({
			serviceDate: "2025-06-01",
			sections: [],
			createdBy: user.id,
			updatedBy: user.id,
		});

		const res = await testApp.request(
			"http://localhost/api/bulletin/generate",
			{
				method: "POST",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-06-01" }),
			},
			env,
		);
		expect(res.status).toBe(409);
	});
});

// --- PUT /api/bulletin/:id ---

describe("PUT /api/bulletin/:id", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin/1",
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 404 when bulletin not found", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin/9999",
			{
				method: "PUT",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "2025-01-05" }),
			},
			env,
		);
		expect(res.status).toBe(404);
	});

	it("returns 400 for invalid serviceDate format", async () => {
		const { user, env } = await seedMemberAndEnv();
		const [bulletin] = await db
			.insert(schema.bulletins)
			.values({
				serviceDate: "2025-01-05",
				sections: [],
				createdBy: user.id,
				updatedBy: user.id,
			})
			.returning();

		const res = await testApp.request(
			`http://localhost/api/bulletin/${bulletin.id}`,
			{
				method: "PUT",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: "not-a-date" }),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("updates bulletin and returns 200", async () => {
		const { user, env } = await seedMemberAndEnv();
		const [bulletin] = await db
			.insert(schema.bulletins)
			.values({
				serviceDate: "2025-01-05",
				sections: [],
				createdBy: user.id,
				updatedBy: user.id,
			})
			.returning();

		const res = await testApp.request(
			`http://localhost/api/bulletin/${bulletin.id}`,
			{
				method: "PUT",
				headers: { ...memberHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({
					serviceDate: "2025-01-12",
					sections: sampleSections,
				}),
			},
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			serviceDate: "2025-01-12",
			sections: sampleSections,
		});
	});
});

// --- DELETE /api/bulletin/:id ---

describe("DELETE /api/bulletin/:id", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin/1",
			{ method: "DELETE" },
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 404 when bulletin not found", async () => {
		const { env } = await seedMemberAndEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin/9999",
			{ method: "DELETE", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("deletes bulletin and returns 200", async () => {
		const { user, env } = await seedMemberAndEnv();
		const [bulletin] = await db
			.insert(schema.bulletins)
			.values({
				serviceDate: "2025-01-05",
				sections: [],
				createdBy: user.id,
				updatedBy: user.id,
			})
			.returning();

		const res = await testApp.request(
			`http://localhost/api/bulletin/${bulletin.id}`,
			{ method: "DELETE", headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ ok: true });
	});
});

// --- Progress counting ---

describe("countProgress via GET /api/bulletin/:id", () => {
	it("counts worship progress correctly", async () => {
		const { user, env } = await seedMemberAndEnv();
		// Set up template with worship-program
		await db.insert(schema.settings).values({
			key: "bulletin_template",
			value: JSON.stringify([
				{
					id: "worship",
					type: "worship-program",
					label: "礼拝",
					visible: true,
					config: {
						items: [
							{ type: "hymn", label: "賛美歌", inputType: "text" },
							{ type: "prayer", label: "祈り", inputType: "member" },
						],
					},
				},
			]),
		});
		const sections = [
			{
				id: "worship",
				type: "worship-program",
				label: "礼拝",
				data: [
					{ type: "hymn", label: "賛美歌", details: "312番" }, // filled
					{ type: "prayer", label: "祈り", details: "" }, // empty
				],
			},
		];
		const [bulletin] = await db
			.insert(schema.bulletins)
			.values({
				serviceDate: "2025-01-05",
				sections: sections as never,
				createdBy: user.id,
				updatedBy: user.id,
			})
			.returning();

		const res = await testApp.request(
			`http://localhost/api/bulletin/${bulletin.id}`,
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect((json as { totalItems: number }).totalItems).toBe(2);
		expect((json as { filledItems: number }).filledItems).toBe(1);
	});
});
