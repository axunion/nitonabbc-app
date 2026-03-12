import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

type BulletinRow = {
	id: number;
	service_date: string;
	worship: string;
	announcements: string;
	assignments: string;
	created_by: number;
	updated_by: number;
	created_at: string;
	updated_at: string;
};

type WorshipItemData = {
	type: string;
	label: string;
	details?: string;
	fieldValues?: Record<string, string>;
	assigneeId?: number | null;
};

type TemplateItemData = {
	type: string;
	label: string;
	inputType?: string;
	fields?: { key: string; label: string; inputType: string }[];
};

function countProgress(
	worship: WorshipItemData[],
	template: TemplateItemData[],
) {
	let totalItems = 0;
	let filledItems = 0;

	for (let i = 0; i < worship.length; i++) {
		const item = worship[i];
		const tmpl = template.find((t) => t.type === item.type);
		const inputType = tmpl?.inputType ?? "text";

		if (tmpl?.fields && tmpl.fields.length > 0) {
			for (const field of tmpl.fields) {
				if (field.inputType === "none") continue;
				totalItems++;
				if (item.fieldValues?.[field.key]?.trim()) {
					filledItems++;
				}
			}
		} else {
			if (inputType === "none") continue;
			totalItems++;
			if (item.details?.trim()) {
				filledItems++;
			}
		}
	}

	return { totalItems, filledItems };
}

function toBulletinSummary(row: BulletinRow, template: TemplateItemData[]) {
	const worship: WorshipItemData[] = JSON.parse(row.worship);
	const { totalItems, filledItems } = countProgress(worship, template);

	return {
		id: row.id,
		serviceDate: row.service_date,
		createdBy: row.created_by,
		updatedBy: row.updated_by,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		totalItems,
		filledItems,
	};
}

function toBulletinDetail(row: BulletinRow, template: TemplateItemData[]) {
	return {
		...toBulletinSummary(row, template),
		worship: JSON.parse(row.worship) as WorshipItemData[],
		announcements: JSON.parse(row.announcements),
		assignments: JSON.parse(row.assignments),
	};
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function getTemplate(db: D1Database): Promise<TemplateItemData[]> {
	try {
		const row = await db
			.prepare("SELECT value FROM settings WHERE key = ?")
			.bind("worship_template")
			.first<{ value: string }>();
		if (row) return JSON.parse(row.value);
	} catch {
		// Table may not exist — return default
	}
	return [];
}

export const bulletinRoute = new Hono<AppEnv>();

bulletinRoute.use("/*", authMiddleware);

// GET /api/bulletin — list all bulletins
bulletinRoute.get("/", async (c) => {
	const template = await getTemplate(c.env.DB);
	const { results } = await c.env.DB.prepare(
		"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins ORDER BY service_date DESC",
	).all<BulletinRow>();

	return c.json(results.map((r) => toBulletinSummary(r, template)));
});

// POST /api/bulletin/generate — auto-generate next Sunday's bulletin from template
bulletinRoute.post("/generate", async (c) => {
	const user = c.get("user");
	const template = await getTemplate(c.env.DB);

	// Calculate next Sunday
	const today = new Date();
	const dayOfWeek = today.getUTCDay();
	const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
	const nextSunday = new Date(today);
	nextSunday.setUTCDate(today.getUTCDate() + daysUntilSunday);
	const serviceDate = nextSunday.toISOString().slice(0, 10);

	// Build worship items from template
	const worship: WorshipItemData[] = template.map((t) => {
		const item: WorshipItemData = { type: t.type, label: t.label };
		if (t.fields && t.fields.length > 0) {
			item.fieldValues = {};
			for (const field of t.fields) {
				item.fieldValues[field.key] = "";
			}
		}
		return item;
	});

	const worshipJson = JSON.stringify(worship);
	const announcements = "[]";
	const assignments = "{}";

	try {
		const result = await c.env.DB.prepare(
			"INSERT INTO bulletins (service_date, worship, announcements, assignments, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)",
		)
			.bind(
				serviceDate,
				worshipJson,
				announcements,
				assignments,
				user.id,
				user.id,
			)
			.run();

		const newRow = await c.env.DB.prepare(
			"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
		)
			.bind(result.meta.last_row_id)
			.first<BulletinRow>();

		if (!newRow) {
			return c.json({ error: "Failed to retrieve created bulletin" }, 500);
		}

		return c.json(toBulletinDetail(newRow, template), 201);
	} catch (e) {
		if (e instanceof Error && e.message.includes("UNIQUE constraint")) {
			return c.json({ error: "Bulletin for this date already exists" }, 409);
		}
		throw e;
	}
});

// GET /api/bulletin/:id — get single bulletin
bulletinRoute.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const template = await getTemplate(c.env.DB);

	const row = await c.env.DB.prepare(
		"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
	)
		.bind(id)
		.first<BulletinRow>();

	if (!row) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	return c.json(toBulletinDetail(row, template));
});

// POST /api/bulletin — create a new bulletin
bulletinRoute.post("/", async (c) => {
	const user = c.get("user");
	const body = await c.req.json<{
		serviceDate?: string;
		worship?: unknown[];
		announcements?: unknown[];
		assignments?: Record<string, string>;
	}>();

	if (!body.serviceDate || !DATE_RE.test(body.serviceDate)) {
		return c.json({ error: "serviceDate is required (YYYY-MM-DD)" }, 400);
	}

	const worship = JSON.stringify(body.worship ?? []);
	const announcements = JSON.stringify(body.announcements ?? []);
	const assignments = JSON.stringify(body.assignments ?? {});

	try {
		const result = await c.env.DB.prepare(
			"INSERT INTO bulletins (service_date, worship, announcements, assignments, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)",
		)
			.bind(
				body.serviceDate,
				worship,
				announcements,
				assignments,
				user.id,
				user.id,
			)
			.run();

		const template = await getTemplate(c.env.DB);
		const newRow = await c.env.DB.prepare(
			"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
		)
			.bind(result.meta.last_row_id)
			.first<BulletinRow>();

		if (!newRow) {
			return c.json({ error: "Failed to retrieve created bulletin" }, 500);
		}

		return c.json(toBulletinDetail(newRow, template), 201);
	} catch (e) {
		if (e instanceof Error && e.message.includes("UNIQUE constraint")) {
			return c.json({ error: "Bulletin for this date already exists" }, 409);
		}
		throw e;
	}
});

// PUT /api/bulletin/:id — update a bulletin
bulletinRoute.put("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const user = c.get("user");
	const body = await c.req.json<{
		serviceDate?: string;
		worship?: unknown[];
		announcements?: unknown[];
		assignments?: Record<string, string>;
	}>();

	const existing = await c.env.DB.prepare(
		"SELECT id FROM bulletins WHERE id = ?",
	)
		.bind(id)
		.first();

	if (!existing) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	if (body.serviceDate !== undefined && !DATE_RE.test(body.serviceDate)) {
		return c.json({ error: "serviceDate must be YYYY-MM-DD" }, 400);
	}

	const updates: string[] = [];
	const values: unknown[] = [];

	if (body.serviceDate !== undefined) {
		updates.push("service_date = ?");
		values.push(body.serviceDate);
	}
	if (body.worship !== undefined) {
		updates.push("worship = ?");
		values.push(JSON.stringify(body.worship));
	}
	if (body.announcements !== undefined) {
		updates.push("announcements = ?");
		values.push(JSON.stringify(body.announcements));
	}
	if (body.assignments !== undefined) {
		updates.push("assignments = ?");
		values.push(JSON.stringify(body.assignments));
	}

	if (updates.length > 0) {
		updates.push("updated_by = ?");
		values.push(user.id);
		updates.push("updated_at = datetime('now')");
		values.push(id);
		await c.env.DB.prepare(
			`UPDATE bulletins SET ${updates.join(", ")} WHERE id = ?`,
		)
			.bind(...values)
			.run();
	}

	const template = await getTemplate(c.env.DB);
	const updated = await c.env.DB.prepare(
		"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
	)
		.bind(id)
		.first<BulletinRow>();

	if (!updated) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	return c.json(toBulletinDetail(updated, template));
});

// DELETE /api/bulletin/:id — delete a bulletin
bulletinRoute.delete("/:id", async (c) => {
	const id = Number(c.req.param("id"));

	const existing = await c.env.DB.prepare(
		"SELECT id FROM bulletins WHERE id = ?",
	)
		.bind(id)
		.first();

	if (!existing) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	await c.env.DB.prepare("DELETE FROM bulletins WHERE id = ?").bind(id).run();

	return c.json({ ok: true });
});
