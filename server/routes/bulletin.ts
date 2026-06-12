import { desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { bulletins, settings } from "../db/schema.ts";
import type {
	SectionData,
	SectionTemplate,
	TemplateItem,
	WorshipItemData,
} from "../db/types.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";
import { DEFAULT_TEMPLATE } from "./bulletinTemplateDefaults.ts";

function countWorshipProgress(data: WorshipItemData[], items: TemplateItem[]) {
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

function countProgress(sections: SectionData[], template: SectionTemplate[]) {
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
		} else if (section.type === "weekly-verse") {
			totalItems += 1;
			if (section.data.text?.trim()) filledItems += 1;
		} else if (section.type === "monthly-song") {
			totalItems += 1;
			if (section.data.title?.trim()) filledItems += 1;
		} else if (section.type === "weekly-prayer") {
			const days = ["日", "月", "火", "水", "木", "金", "土"];
			totalItems += days.length;
			for (const day of days) {
				if (section.data[day]?.trim()) filledItems++;
			}
		} else if (section.type === "service-meta") {
			const defs = tmpl?.type === "service-meta" ? tmpl.config.fieldDefs : [];
			totalItems += defs.length;
			for (const def of defs) {
				if (section.data.fieldValues[def.key]?.trim()) filledItems++;
			}
		}
		// upcoming-events, birthdays, scripture-quotes, attendance, financial-summary: no required items
	}

	return { totalItems, filledItems };
}

function toBulletinDetail(
	row: typeof bulletins.$inferSelect,
	template: SectionTemplate[],
) {
	const { totalItems, filledItems } = countProgress(row.sections, template);
	return {
		id: row.id,
		serviceDate: row.serviceDate,
		createdBy: row.createdBy,
		updatedBy: row.updatedBy,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		totalItems,
		filledItems,
		sections: row.sections,
	};
}

function toBulletinSummary(
	row: typeof bulletins.$inferSelect,
	template: SectionTemplate[],
) {
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

async function getTemplate(
	db: AppEnv["Variables"]["db"],
): Promise<SectionTemplate[]> {
	const row = await db.query.settings.findFirst({
		where: eq(settings.key, "bulletin_template"),
	});
	if (!row) return DEFAULT_TEMPLATE;
	return JSON.parse(row.value) as SectionTemplate[];
}

function buildSectionsFromTemplate(template: SectionTemplate[]): SectionData[] {
	return template
		.filter((s) => s.visible !== false)
		.map((s): SectionData => {
			if (s.type === "worship-program") {
				const data = s.config.items.map((t) => {
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
			if (s.type === "weekly-verse") {
				return {
					id: s.id,
					type: "weekly-verse",
					label: s.label,
					data: { reference: "", text: "" },
				};
			}
			if (s.type === "monthly-song") {
				return {
					id: s.id,
					type: "monthly-song",
					label: s.label,
					data: { title: "", keywords: [] },
				};
			}
			if (s.type === "text-block") {
				return {
					id: s.id,
					type: "text-block",
					label: s.label,
					data: { heading: "", body: "" },
				};
			}
			if (s.type === "weekly-prayer") {
				return {
					id: s.id,
					type: "weekly-prayer",
					label: s.label,
					data: { 日: "", 月: "", 火: "", 水: "", 木: "", 金: "", 土: "" },
				};
			}
			if (s.type === "upcoming-events") {
				return {
					id: s.id,
					type: "upcoming-events",
					label: s.label,
					data: [],
				};
			}
			if (s.type === "birthdays") {
				return { id: s.id, type: "birthdays", label: s.label, data: [] };
			}
			if (s.type === "scripture-quotes") {
				return {
					id: s.id,
					type: "scripture-quotes",
					label: s.label,
					data: [],
				};
			}
			if (s.type === "attendance") {
				const data: Record<string, { adults: string }> = {};
				for (const m of s.config.meetings) {
					data[m.key] = { adults: "" };
				}
				return { id: s.id, type: "attendance", label: s.label, data };
			}
			if (s.type === "service-meta") {
				const fieldValues: Record<string, string> = {};
				for (const def of s.config.fieldDefs) {
					fieldValues[def.key] = "";
				}
				return {
					id: s.id,
					type: "service-meta",
					label: s.label,
					data: { fieldValues },
				};
			}
			if (s.type === "financial-summary") {
				const data: Record<string, { amount: string }> = {};
				for (const item of s.config.items) {
					data[item.key] = { amount: "" };
				}
				return {
					id: s.id,
					type: "financial-summary",
					label: s.label,
					data,
				};
			}
			return { id: s.id, type: "assignments", label: s.label, data: {} };
		});
}

export const bulletinRoute = new Hono<AppEnv>();

bulletinRoute.use("/*", authMiddleware);

// GET /api/bulletin — list all bulletins + next Sunday date
bulletinRoute.get("/", async (c) => {
	const db = c.get("db");
	const [template, rows] = await Promise.all([
		getTemplate(db),
		db.select().from(bulletins).orderBy(desc(bulletins.serviceDate)),
	]);

	return c.json({
		bulletins: rows.map((r) => toBulletinSummary(r, template)),
		nextSunday: getNextSunday(),
	});
});

// POST /api/bulletin/generate — auto-generate bulletin for next Sunday from template
bulletinRoute.post("/generate", async (c) => {
	const db = c.get("db");
	const user = c.get("user");
	const template = await getTemplate(db);

	const body = await c.req
		.json<{ serviceDate?: string }>()
		.catch((): { serviceDate?: string } => ({}));
	let serviceDate: string;

	if (body.serviceDate && DATE_RE.test(body.serviceDate)) {
		serviceDate = body.serviceDate;
	} else {
		serviceDate = getNextSunday();
	}

	const sections = buildSectionsFromTemplate(template);

	try {
		const [newRow] = await db
			.insert(bulletins)
			.values({
				serviceDate,
				sections,
				createdBy: user.id,
				updatedBy: user.id,
			})
			.returning();

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
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	if (!Number.isInteger(id) || id <= 0) {
		return c.json({ error: "Invalid id" }, 400);
	}
	const [template, row] = await Promise.all([
		getTemplate(db),
		db.query.bulletins.findFirst({ where: eq(bulletins.id, id) }),
	]);

	if (!row) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	return c.json(toBulletinDetail(row, template));
});

// POST /api/bulletin — create a new bulletin
bulletinRoute.post("/", async (c) => {
	const db = c.get("db");
	const user = c.get("user");
	const body = await c.req.json<{
		serviceDate?: string;
		sections?: unknown[];
	}>();

	if (!body.serviceDate || !DATE_RE.test(body.serviceDate)) {
		return c.json({ error: "serviceDate is required (YYYY-MM-DD)" }, 400);
	}

	const template = await getTemplate(db);
	const sections: SectionData[] =
		Array.isArray(body.sections) && body.sections.length > 0
			? (body.sections as SectionData[])
			: buildSectionsFromTemplate(template);

	try {
		const [newRow] = await db
			.insert(bulletins)
			.values({
				serviceDate: body.serviceDate,
				sections,
				createdBy: user.id,
				updatedBy: user.id,
			})
			.returning();

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
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	if (!Number.isInteger(id) || id <= 0) {
		return c.json({ error: "Invalid id" }, 400);
	}
	const user = c.get("user");
	const body = await c.req.json<{
		serviceDate?: string;
		sections?: unknown[];
	}>();

	const existing = await db.query.bulletins.findFirst({
		where: eq(bulletins.id, id),
	});
	if (!existing) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	if (body.serviceDate !== undefined && !DATE_RE.test(body.serviceDate)) {
		return c.json({ error: "serviceDate must be YYYY-MM-DD" }, 400);
	}

	await db
		.update(bulletins)
		.set({
			...(body.serviceDate !== undefined
				? { serviceDate: body.serviceDate }
				: {}),
			...(body.sections !== undefined
				? { sections: body.sections as SectionData[] }
				: {}),
			updatedBy: user.id,
			updatedAt: sql`(datetime('now'))`,
		})
		.where(eq(bulletins.id, id));

	const [template, updated] = await Promise.all([
		getTemplate(db),
		db.query.bulletins.findFirst({ where: eq(bulletins.id, id) }),
	]);

	if (!updated) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	return c.json(toBulletinDetail(updated, template));
});

// DELETE /api/bulletin/:id — delete a bulletin
bulletinRoute.delete("/:id", async (c) => {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	if (!Number.isInteger(id) || id <= 0) {
		return c.json({ error: "Invalid id" }, 400);
	}

	const existing = await db.query.bulletins.findFirst({
		where: eq(bulletins.id, id),
	});
	if (!existing) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	await db.delete(bulletins).where(eq(bulletins.id, id));

	return c.json({ ok: true });
});
