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

function toBulletinSummary(row: BulletinRow) {
	return {
		id: row.id,
		serviceDate: row.service_date,
		createdBy: row.created_by,
		updatedBy: row.updated_by,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function toBulletinDetail(row: BulletinRow) {
	return {
		...toBulletinSummary(row),
		worship: JSON.parse(row.worship),
		announcements: JSON.parse(row.announcements),
		assignments: JSON.parse(row.assignments),
	};
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const bulletinRoute = new Hono<AppEnv>();

bulletinRoute.use("/*", authMiddleware);

// GET /api/bulletin — list all bulletins
bulletinRoute.get("/", async (c) => {
	const { results } = await c.env.DB.prepare(
		"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins ORDER BY service_date DESC",
	).all<BulletinRow>();

	return c.json(results.map(toBulletinSummary));
});

// GET /api/bulletin/:id — get single bulletin
bulletinRoute.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));

	const row = await c.env.DB.prepare(
		"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
	)
		.bind(id)
		.first<BulletinRow>();

	if (!row) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	return c.json(toBulletinDetail(row));
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

		const newRow = await c.env.DB.prepare(
			"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
		)
			.bind(result.meta.last_row_id)
			.first<BulletinRow>();

		if (!newRow) {
			return c.json({ error: "Failed to retrieve created bulletin" }, 500);
		}

		return c.json(toBulletinDetail(newRow), 201);
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

	const updated = await c.env.DB.prepare(
		"SELECT id, service_date, worship, announcements, assignments, created_by, updated_by, created_at, updated_at FROM bulletins WHERE id = ?",
	)
		.bind(id)
		.first<BulletinRow>();

	if (!updated) {
		return c.json({ error: "Bulletin not found" }, 404);
	}

	return c.json(toBulletinDetail(updated));
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
