import { Hono } from "hono";
import { adminMiddleware } from "../middleware/admin.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

type TemplateItem = { type: string; label: string };

const DEFAULT_TEMPLATE: TemplateItem[] = [
	{ type: "prelude", label: "前奏" },
	{ type: "hymn", label: "賛美歌" },
	{ type: "prayer", label: "祈り" },
	{ type: "reading", label: "聖書朗読" },
	{ type: "sermon", label: "説教" },
	{ type: "offering", label: "献金" },
	{ type: "hymn2", label: "賛美歌" },
	{ type: "doxology", label: "頌栄" },
	{ type: "benediction", label: "祝祷" },
];

type SettingsRow = {
	key: string;
	value: string;
	updated_at: string;
};

function isValidTemplate(body: unknown): body is TemplateItem[] {
	if (!Array.isArray(body) || body.length === 0) return false;
	return body.every(
		(item: unknown) =>
			typeof item === "object" &&
			item !== null &&
			typeof (item as TemplateItem).type === "string" &&
			(item as TemplateItem).type.length > 0 &&
			typeof (item as TemplateItem).label === "string" &&
			(item as TemplateItem).label.length > 0,
	);
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

	const items: TemplateItem[] = body.map((item) => ({
		type: item.type,
		label: item.label,
	}));

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
