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

const VALID_INPUT_TYPES = ["text", "number", "member", "scripture", "none"];

const DEFAULT_TEMPLATE: TemplateItem[] = [
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

type SettingsRow = {
	key: string;
	value: string;
	updated_at: string;
};

function isValidField(field: unknown): field is TemplateField {
	if (typeof field !== "object" || field === null) return false;
	const f = field as TemplateField;
	return (
		typeof f.key === "string" &&
		f.key.length > 0 &&
		typeof f.label === "string" &&
		f.label.length > 0 &&
		typeof f.inputType === "string" &&
		VALID_INPUT_TYPES.includes(f.inputType)
	);
}

function isValidTemplate(body: unknown): body is TemplateItem[] {
	if (!Array.isArray(body) || body.length === 0) return false;
	return body.every((item: unknown) => {
		if (typeof item !== "object" || item === null) return false;
		const t = item as TemplateItem;
		if (
			typeof t.type !== "string" ||
			t.type.length === 0 ||
			typeof t.label !== "string" ||
			t.label.length === 0
		)
			return false;
		if (t.inputType !== undefined && !VALID_INPUT_TYPES.includes(t.inputType))
			return false;
		if (t.fields !== undefined) {
			if (!Array.isArray(t.fields) || t.fields.length === 0) return false;
			if (!t.fields.every(isValidField)) return false;
		}
		return true;
	});
}

function sanitizeTemplate(body: TemplateItem[]): TemplateItem[] {
	return body.map((item) => {
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

export const bulletinTemplateRoute = new Hono<AppEnv>();

// GET — any authenticated user can read the template
bulletinTemplateRoute.get("/", authMiddleware, async (c) => {
	try {
		const row = await c.env.DB.prepare(
			"SELECT key, value, updated_at FROM settings WHERE key = ?",
		)
			.bind("worship_template")
			.first<SettingsRow>();

		if (!row) {
			return c.json(DEFAULT_TEMPLATE);
		}

		return c.json(JSON.parse(row.value));
	} catch {
		// Table may not exist yet — return default
		return c.json(DEFAULT_TEMPLATE);
	}
});

// PUT — admin only
bulletinTemplateRoute.put("/", authMiddleware, adminMiddleware, async (c) => {
	const body = await c.req.json();

	if (!isValidTemplate(body)) {
		return c.json(
			{ error: "Template must be a non-empty array of { type, label }" },
			400,
		);
	}

	const items = sanitizeTemplate(body);

	try {
		await c.env.DB.prepare(
			"INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
		)
			.bind("worship_template", JSON.stringify(items))
			.run();
	} catch {
		// Table may not exist — create it and retry
		await c.env.DB.exec(
			"CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')))",
		);
		await c.env.DB.prepare(
			"INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
		)
			.bind("worship_template", JSON.stringify(items))
			.run();
	}

	return c.json({ ok: true });
});
