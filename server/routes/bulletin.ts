import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

type BulletinRow = {
	id: number;
	service_date: string;
	sections: string;
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

type SectionTemplateData =
	| {
			id: string;
			type: "worship-program";
			label: string;
			visible?: boolean;
			config: { items: TemplateItemData[] };
	  }
	| {
			id: string;
			type: "announcements";
			label: string;
			visible?: boolean;
			config: { subHeadings?: string[] };
	  }
	| {
			id: string;
			type: "assignments";
			label: string;
			visible?: boolean;
			config: { roles: string[] };
	  };

type SectionData =
	| {
			id: string;
			type: "worship-program";
			label: string;
			data: WorshipItemData[];
	  }
	| {
			id: string;
			type: "announcements";
			label: string;
			data: { heading?: string; content: string }[];
	  }
	| {
			id: string;
			type: "assignments";
			label: string;
			data: Record<string, string>;
	  };

function countWorshipProgress(
	data: WorshipItemData[],
	items: TemplateItemData[],
) {
	let total = 0;
	let filled = 0;
	for (const item of data) {
		const tmpl = items.find((t) => t.type === item.type);
		const inputType = tmpl?.inputType ?? "text";
		if (tmpl?.fields && tmpl.fields.length > 0) {
			for (const field of tmpl.fields) {
				if (field.inputType === "none") continue;
				total++;
				if (item.fieldValues?.[field.key]?.trim()) filled++;
			}
		} else {
			if (inputType === "none") continue;
			total++;
			if (item.details?.trim()) filled++;
		}
	}
	return { total, filled };
}

function countProgress(
	sections: SectionData[],
	template: SectionTemplateData[],
) {
	let totalItems = 0;
	let filledItems = 0;

	for (const section of sections) {
		const tmpl = template.find((t) => t.id === section.id);
		if (section.type === "worship-program") {
			const items = tmpl?.type === "worship-program" ? tmpl.config.items : [];
			const { total, filled } = countWorshipProgress(section.data, items);
			totalItems += total;
			filledItems += filled;
		} else if (section.type === "announcements") {
			totalItems += 1;
			if (section.data.length > 0) filledItems += 1;
		} else if (section.type === "assignments") {
			const roles = tmpl?.type === "assignments" ? tmpl.config.roles : [];
			totalItems += roles.length;
			for (const role of roles) {
				if (section.data[role]?.trim()) filledItems++;
			}
		}
	}

	return { totalItems, filledItems };
}

function toBulletinDetail(row: BulletinRow, template: SectionTemplateData[]) {
	const sections = JSON.parse(row.sections) as SectionData[];
	const { totalItems, filledItems } = countProgress(sections, template);
	return {
		id: row.id,
		serviceDate: row.service_date,
		createdBy: row.created_by,
		updatedBy: row.updated_by,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		totalItems,
		filledItems,
		sections,
	};
}

function toBulletinSummary(row: BulletinRow, template: SectionTemplateData[]) {
	const { sections: _s, ...summary } = toBulletinDetail(row, template);
	return summary;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns the current or next Sunday as "YYYY-MM-DD" (UTC). Sunday returns today. */
function getNextSunday(): string {
	const today = new Date();
	const dayOfWeek = today.getUTCDay();
	const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
	const nextSunday = new Date(today);
	nextSunday.setUTCDate(today.getUTCDate() + daysUntilSunday);
	return nextSunday.toISOString().slice(0, 10);
}

async function getTemplate(db: D1Database): Promise<SectionTemplateData[]> {
	try {
		const row = await db
			.prepare("SELECT value FROM settings WHERE key = ?")
			.bind("bulletin_template")
			.first<{ value: string }>();
		if (row) return JSON.parse(row.value);
	} catch {
		// Table may not exist — return default
	}
	return [];
}

function buildSectionsFromTemplate(
	template: SectionTemplateData[],
): SectionData[] {
	return template
		.filter((s) => s.visible !== false)
		.map((s): SectionData => {
			if (s.type === "worship-program") {
				const data: WorshipItemData[] = s.config.items.map((t) => {
					const item: WorshipItemData = { type: t.type, label: t.label };
					if (t.fields && t.fields.length > 0) {
						item.fieldValues = {};
						for (const field of t.fields) {
							item.fieldValues[field.key] = "";
						}
					}
					return item;
				});
				return { id: s.id, type: "worship-program", label: s.label, data };
			}
			if (s.type === "announcements") {
				return { id: s.id, type: "announcements", label: s.label, data: [] };
			}
			return { id: s.id, type: "assignments", label: s.label, data: {} };
		});
}

export const bulletinRoute = new Hono<AppEnv>();

bulletinRoute.use("/*", authMiddleware);

// GET /api/bulletin — list all bulletins + next Sunday date
bulletinRoute.get("/", async (c) => {
	const [template, { results }] = await Promise.all([
		getTemplate(c.env.DB),
		c.env.DB.prepare(
			"SELECT id, service_date, sections, created_by, updated_by, created_at, updated_at FROM bulletins ORDER BY service_date DESC",
		).all<BulletinRow>(),
	]);

	return c.json({
		bulletins: results.map((r) => toBulletinSummary(r, template)),
		nextSunday: getNextSunday(),
	});
});

// POST /api/bulletin/generate — auto-generate bulletin for next Sunday from template
bulletinRoute.post("/generate", async (c) => {
	const user = c.get("user");
	const template = await getTemplate(c.env.DB);

	const body = await c.req
		.json<{ serviceDate?: string }>()
		.catch((): { serviceDate?: string } => ({}));
	let serviceDate: string;

	if (body.serviceDate && DATE_RE.test(body.serviceDate)) {
		serviceDate = body.serviceDate;
	} else {
		serviceDate = getNextSunday();
	}

	// TODO: copy-forward repeated sections from most recent bulletin (future phase)
	const sections = buildSectionsFromTemplate(template);

	try {
		const result = await c.env.DB.prepare(
			"INSERT INTO bulletins (service_date, sections, created_by, updated_by) VALUES (?, ?, ?, ?)",
		)
			.bind(serviceDate, JSON.stringify(sections), user.id, user.id)
			.run();

		const newRow = await c.env.DB.prepare(
			"SELECT id, service_date, sections, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
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
	const [template, row] = await Promise.all([
		getTemplate(c.env.DB),
		c.env.DB.prepare(
			"SELECT id, service_date, sections, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
		)
			.bind(id)
			.first<BulletinRow>(),
	]);

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
		sections?: unknown[];
	}>();

	if (!body.serviceDate || !DATE_RE.test(body.serviceDate)) {
		return c.json({ error: "serviceDate is required (YYYY-MM-DD)" }, 400);
	}

	const template = await getTemplate(c.env.DB);
	const sections: SectionData[] =
		Array.isArray(body.sections) && body.sections.length > 0
			? (body.sections as SectionData[])
			: buildSectionsFromTemplate(template);

	try {
		const result = await c.env.DB.prepare(
			"INSERT INTO bulletins (service_date, sections, created_by, updated_by) VALUES (?, ?, ?, ?)",
		)
			.bind(body.serviceDate, JSON.stringify(sections), user.id, user.id)
			.run();

		const newRow = await c.env.DB.prepare(
			"SELECT id, service_date, sections, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
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
		sections?: unknown[];
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
	if (body.sections !== undefined) {
		updates.push("sections = ?");
		values.push(JSON.stringify(body.sections));
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

	const [template, updated] = await Promise.all([
		getTemplate(c.env.DB),
		c.env.DB.prepare(
			"SELECT id, service_date, sections, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
		)
			.bind(id)
			.first<BulletinRow>(),
	]);

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
