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

async function seedAdminEnv() {
	const [admin] = await db
		.insert(schema.users)
		.values({
			name: "Admin",
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
	return createEnv({ SESSION_KV: kv });
}

async function seedMemberEnv() {
	const [member] = await db
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
			userId: member.id,
			lineUserId: "U_member",
			role: "member",
		}),
	});
	return createEnv({ SESSION_KV: kv });
}

const adminHeaders = { Cookie: "session_id=admin_sid" };
const memberHeaders = { Cookie: "session_id=member_sid" };

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

describe("GET /api/bulletin-template", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin-template",
			{},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns default template when not set in DB", async () => {
		const env = await seedAdminEnv();
		const res = await testApp.request(
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
		expect(json[0].type).toBe("worship-program");
	});

	it("returns stored SectionTemplate[] from DB", async () => {
		const env = await seedAdminEnv();
		await db.insert(schema.settings).values({
			key: "bulletin_template",
			value: JSON.stringify(validTemplate),
		});

		const res = await testApp.request(
			"http://localhost/api/bulletin-template",
			{ headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual(validTemplate);
	});

	it("allows member access (not admin-only)", async () => {
		const env = await seedMemberEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin-template",
			{ headers: memberHeaders },
			env,
		);
		expect(res.status).toBe(200);
	});
});

describe("PUT /api/bulletin-template", () => {
	it("returns 401 without session", async () => {
		const res = await testApp.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(validTemplate),
			},
			createEnv(),
		);
		expect(res.status).toBe(401);
	});

	it("returns 403 for member role", async () => {
		const env = await seedMemberEnv();
		const res = await testApp.request(
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
		const env = await seedAdminEnv();
		const res = await testApp.request(
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
		const env = await seedAdminEnv();
		const res = await testApp.request(
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
		const env = await seedAdminEnv();
		const res = await testApp.request(
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

	it("returns 400 for duplicate section ids", async () => {
		const env = await seedAdminEnv();
		const res = await testApp.request(
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

	it("saves SectionTemplate[] and returns 200", async () => {
		const env = await seedAdminEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify(validTemplate),
			},
			env,
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it.each([
		[
			"weekly-prayer",
			{
				id: "prayer",
				type: "weekly-prayer",
				label: "今週の祈り",
				visible: true,
				config: {},
			},
		],
		[
			"text-block",
			{
				id: "tb",
				type: "text-block",
				label: "テキスト",
				visible: true,
				config: {},
			},
		],
		[
			"monthly-song",
			{
				id: "song",
				type: "monthly-song",
				label: "今月の歌",
				visible: true,
				config: {},
			},
		],
		[
			"weekly-verse",
			{
				id: "verse",
				type: "weekly-verse",
				label: "今週のみことば",
				visible: true,
				config: {},
			},
		],
		[
			"upcoming-events",
			{
				id: "events",
				type: "upcoming-events",
				label: "今後の予定",
				visible: true,
				config: {},
			},
		],
		[
			"scripture-quotes",
			{
				id: "sq",
				type: "scripture-quotes",
				label: "引用聖句",
				visible: true,
				config: {},
			},
		],
	])("accepts %s section and returns 200", async (_type, section) => {
		const env = await seedAdminEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([section]),
			},
			env,
		);
		expect(res.status).toBe(200);
	});

	it.each([
		[
			"weekly-prayer",
			{ id: "prayer", type: "weekly-prayer", label: "今週の祈り", config: [] },
		],
		[
			"text-block",
			{ id: "tb", type: "text-block", label: "テキスト", config: [] },
		],
		[
			"monthly-song",
			{ id: "song", type: "monthly-song", label: "今月の歌", config: [] },
		],
		[
			"weekly-verse",
			{
				id: "verse",
				type: "weekly-verse",
				label: "今週のみことば",
				config: [],
			},
		],
	])("returns 400 when %s config is an array", async (_type, section) => {
		const env = await seedAdminEnv();
		const res = await testApp.request(
			"http://localhost/api/bulletin-template",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify([section]),
			},
			env,
		);
		expect(res.status).toBe(400);
	});
});
