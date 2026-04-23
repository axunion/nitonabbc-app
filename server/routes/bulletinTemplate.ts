import { Hono } from "hono";
import { adminMiddleware } from "../middleware/admin.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

type TemplateField = {
	key: string;
	label: string;
	inputType: string;
};

type TemplateItem = {
	type: string;
	label: string;
	inputType?: string;
	fields?: TemplateField[];
};

type SectionTemplate =
	| {
			id: string;
			type: "worship-program";
			label: string;
			visible?: boolean;
			config: { items: TemplateItem[] };
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

const VALID_INPUT_TYPES = ["text", "number", "member", "scripture", "none"];
const VALID_SECTION_TYPES = ["worship-program", "announcements", "assignments"];

const DEFAULT_WORSHIP_ITEMS: TemplateItem[] = [
	{ type: "prelude", label: "前奏", inputType: "none" },
	{ type: "hymn", label: "賛美歌", inputType: "text" },
	{ type: "prayer", label: "祈り", inputType: "member" },
	{ type: "reading", label: "聖書朗読", inputType: "scripture" },
	{
		type: "sermon",
		label: "説教",
		fields: [
			{ key: "title", label: "タイトル", inputType: "text" },
			{ key: "preacher", label: "説教者", inputType: "member" },
			{ key: "scripture", label: "聖書箇所", inputType: "scripture" },
		],
	},
	{ type: "offering", label: "献金", inputType: "none" },
	{ type: "hymn2", label: "賛美歌", inputType: "text" },
	{ type: "doxology", label: "頌栄", inputType: "none" },
	{ type: "benediction", label: "祝祷", inputType: "none" },
];

const DEFAULT_TEMPLATE: SectionTemplate[] = [
	{
		id: "worship",
		type: "worship-program",
		label: "礼拝プログラム",
		visible: true,
		config: { items: DEFAULT_WORSHIP_ITEMS },
	},
];

type SettingsRow = {
	key: string;
	value: string;
	updated_at: string;
};

function isValidField(field: unknown): field is TemplateField {
	if (typeof field !== "object" || field === null) return false;
	const f = field as Record<string, unknown>;
	return (
		typeof f.key === "string" &&
		f.key.length > 0 &&
		typeof f.label === "string" &&
		f.label.length > 0 &&
		typeof f.inputType === "string" &&
		VALID_INPUT_TYPES.includes(f.inputType)
	);
}

function isValidWorshipConfig(config: unknown): boolean {
	if (typeof config !== "object" || config === null) return false;
	const c = config as Record<string, unknown>;
	if (!Array.isArray(c.items) || c.items.length === 0) return false;
	return c.items.every((item: unknown) => {
		if (typeof item !== "object" || item === null) return false;
		const t = item as Record<string, unknown>;
		if (
			typeof t.type !== "string" ||
			t.type.length === 0 ||
			typeof t.label !== "string" ||
			t.label.length === 0
		)
			return false;
		if (
			t.inputType !== undefined &&
			!VALID_INPUT_TYPES.includes(t.inputType as string)
		)
			return false;
		if (t.fields !== undefined) {
			if (!Array.isArray(t.fields) || t.fields.length === 0) return false;
			if (!t.fields.every(isValidField)) return false;
		}
		return true;
	});
}

function isValidAnnouncementsConfig(config: unknown): boolean {
	if (typeof config !== "object" || config === null) return false;
	const c = config as Record<string, unknown>;
	if (c.subHeadings !== undefined) {
		if (!Array.isArray(c.subHeadings)) return false;
		if (!c.subHeadings.every((s: unknown) => typeof s === "string"))
			return false;
	}
	return true;
}

function isValidAssignmentsConfig(config: unknown): boolean {
	if (typeof config !== "object" || config === null) return false;
	const c = config as Record<string, unknown>;
	if (!Array.isArray(c.roles) || c.roles.length === 0) return false;
	return c.roles.every(
		(r: unknown) => typeof r === "string" && (r as string).length > 0,
	);
}

function isValidSection(section: unknown): section is SectionTemplate {
	if (typeof section !== "object" || section === null) return false;
	const s = section as Record<string, unknown>;
	if (typeof s.id !== "string" || s.id.length === 0) return false;
	if (typeof s.type !== "string" || !VALID_SECTION_TYPES.includes(s.type))
		return false;
	if (typeof s.label !== "string" || s.label.length === 0) return false;
	if (s.visible !== undefined && typeof s.visible !== "boolean") return false;
	if (s.type === "worship-program") return isValidWorshipConfig(s.config);
	if (s.type === "announcements") return isValidAnnouncementsConfig(s.config);
	if (s.type === "assignments") return isValidAssignmentsConfig(s.config);
	return false;
}

function isValidTemplate(body: unknown): body is SectionTemplate[] {
	if (!Array.isArray(body) || body.length === 0) return false;
	if (!body.every(isValidSection)) return false;
	const ids = body.map((s) => (s as Record<string, unknown>).id);
	return new Set(ids).size === ids.length;
}

function sanitizeWorshipItems(items: TemplateItem[]): TemplateItem[] {
	return items.map((item) => {
		const sanitized: TemplateItem = { type: item.type, label: item.label };
		if (item.fields && item.fields.length > 0) {
			sanitized.fields = item.fields.map((f) => ({
				key: f.key,
				label: f.label,
				inputType: f.inputType,
			}));
		} else if (item.inputType) {
			sanitized.inputType = item.inputType;
		}
		return sanitized;
	});
}

function sanitizeTemplate(sections: SectionTemplate[]): SectionTemplate[] {
	return sections.map((s) => {
		const base = {
			id: s.id,
			type: s.type,
			label: s.label,
			visible: s.visible ?? true,
		};
		if (s.type === "worship-program") {
			return {
				...base,
				type: "worship-program" as const,
				config: { items: sanitizeWorshipItems(s.config.items) },
			};
		}
		if (s.type === "announcements") {
			return {
				...base,
				type: "announcements" as const,
				config: { subHeadings: s.config.subHeadings ?? [] },
			};
		}
		return {
			...base,
			type: "assignments" as const,
			config: { roles: s.config.roles },
		};
	});
}

// Migrate an old TemplateItem[] value into a SectionTemplate[] wrapping it as worship-program
function migrateOldTemplate(oldValue: string): SectionTemplate[] {
	try {
		const items = JSON.parse(oldValue) as TemplateItem[];
		if (!Array.isArray(items)) return DEFAULT_TEMPLATE;
		return [
			{
				id: "worship",
				type: "worship-program",
				label: "礼拝プログラム",
				visible: true,
				config: { items },
			},
		];
	} catch {
		return DEFAULT_TEMPLATE;
	}
}

export const bulletinTemplateRoute = new Hono<AppEnv>();

// GET — any authenticated user can read the template
bulletinTemplateRoute.get("/", authMiddleware, async (c) => {
	try {
		const { results } = await c.env.DB.prepare(
			"SELECT key, value FROM settings WHERE key IN (?, ?)",
		)
			.bind("bulletin_template", "worship_template")
			.all<SettingsRow>();

		const row = results.find((r) => r.key === "bulletin_template");
		if (row) {
			return c.json(JSON.parse(row.value));
		}

		const oldRow = results.find((r) => r.key === "worship_template");

		if (oldRow) {
			const migrated = migrateOldTemplate(oldRow.value);
			await c.env.DB.prepare(
				"INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
			)
				.bind("bulletin_template", JSON.stringify(migrated))
				.run();
			await c.env.DB.prepare("DELETE FROM settings WHERE key = ?")
				.bind("worship_template")
				.run();
			return c.json(migrated);
		}

		return c.json(DEFAULT_TEMPLATE);
	} catch {
		return c.json(DEFAULT_TEMPLATE);
	}
});

// PUT — admin only
bulletinTemplateRoute.put("/", authMiddleware, adminMiddleware, async (c) => {
	const body = await c.req.json();

	if (!isValidTemplate(body)) {
		return c.json(
			{
				error:
					"Template must be a non-empty array of valid sections with unique ids",
			},
			400,
		);
	}

	const sections = sanitizeTemplate(body);

	try {
		await c.env.DB.prepare(
			"INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
		)
			.bind("bulletin_template", JSON.stringify(sections))
			.run();
	} catch {
		await c.env.DB.exec(
			"CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')))",
		);
		await c.env.DB.prepare(
			"INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
		)
			.bind("bulletin_template", JSON.stringify(sections))
			.run();
	}

	return c.json({ ok: true });
});
