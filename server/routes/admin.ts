import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { users } from "../db/schema.ts";
import { adminMiddleware } from "../middleware/admin.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

function toMemberResponse(row: typeof users.$inferSelect) {
	return {
		id: row.id,
		name: row.name,
		role: row.role,
		lineUserId: row.lineUserId,
		inviteToken: row.inviteToken,
		inviteUsed: row.inviteUsed,
		isActive: row.isActive,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const adminRoute = new Hono<AppEnv>();

adminRoute.use("/*", authMiddleware);
adminRoute.use("/*", adminMiddleware);

// GET /api/admin/members — list all members
adminRoute.get("/members", async (c) => {
	const db = c.get("db");
	const rows = await db.select().from(users).orderBy(users.id);
	return c.json(rows.map(toMemberResponse));
});

// POST /api/admin/members — create a new member
adminRoute.post("/members", async (c) => {
	const db = c.get("db");
	const body = await c.req.json<{ name?: string; role?: string }>();

	if (!body.name || body.name.trim() === "") {
		return c.json({ error: "Name is required" }, 400);
	}

	const role = body.role ?? "member";
	if (role !== "admin" && role !== "member") {
		return c.json({ error: "Role must be admin or member" }, 400);
	}

	const inviteToken = crypto.randomUUID();

	const [newRow] = await db
		.insert(users)
		.values({
			name: body.name.trim(),
			role,
			inviteToken,
		})
		.returning();

	return c.json(toMemberResponse(newRow), 201);
});

// PUT /api/admin/members/:id — update a member
adminRoute.put("/members/:id", async (c) => {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	if (!Number.isInteger(id) || id <= 0) {
		return c.json({ error: "Invalid id" }, 400);
	}
	const body = await c.req.json<{ name?: string; role?: string }>();

	if (body.name !== undefined && body.name.trim() === "") {
		return c.json({ error: "Name cannot be empty" }, 400);
	}

	const existing = await db.query.users.findFirst({
		where: eq(users.id, id),
	});
	if (!existing) {
		return c.json({ error: "Member not found" }, 404);
	}

	if (body.role && body.role !== "admin" && body.role !== "member") {
		return c.json({ error: "Role must be admin or member" }, 400);
	}

	const patch: Partial<typeof users.$inferInsert> = {};
	if (body.name !== undefined) patch.name = body.name.trim();
	if (body.role !== undefined) patch.role = body.role as "admin" | "member";

	if (Object.keys(patch).length > 0) {
		await db
			.update(users)
			.set({ ...patch, updatedAt: sql`(datetime('now'))` })
			.where(eq(users.id, id));
	}

	const updated = await db.query.users.findFirst({ where: eq(users.id, id) });
	if (!updated) {
		return c.json({ error: "Member not found" }, 404);
	}
	return c.json(toMemberResponse(updated));
});

// DELETE /api/admin/members/:id — soft-delete (deactivate)
adminRoute.delete("/members/:id", async (c) => {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	if (!Number.isInteger(id) || id <= 0) {
		return c.json({ error: "Invalid id" }, 400);
	}
	const user = c.get("user");

	const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
	if (!existing) {
		return c.json({ error: "Member not found" }, 404);
	}

	if (user.id === id) {
		return c.json({ error: "Cannot deactivate yourself" }, 400);
	}

	await db
		.update(users)
		.set({ isActive: false, updatedAt: sql`(datetime('now'))` })
		.where(eq(users.id, id));

	return c.json({ ok: true });
});

// POST /api/admin/members/:id/reinvite — reset LINE link + new token
adminRoute.post("/members/:id/reinvite", async (c) => {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	if (!Number.isInteger(id) || id <= 0) {
		return c.json({ error: "Invalid id" }, 400);
	}

	const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
	if (!existing) {
		return c.json({ error: "Member not found" }, 404);
	}

	const newToken = crypto.randomUUID();

	await db
		.update(users)
		.set({
			lineUserId: null,
			inviteToken: newToken,
			inviteUsed: false,
			updatedAt: sql`(datetime('now'))`,
		})
		.where(eq(users.id, id));

	const updated = await db.query.users.findFirst({ where: eq(users.id, id) });
	if (!updated) {
		return c.json({ error: "Member not found" }, 404);
	}
	return c.json(toMemberResponse(updated));
});
