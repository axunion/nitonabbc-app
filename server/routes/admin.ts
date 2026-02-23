import { Hono } from "hono";
import { adminMiddleware } from "../middleware/admin.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";

type MemberRow = {
	id: number;
	name: string;
	role: string;
	line_user_id: string | null;
	invite_token: string;
	invite_used: number;
	is_active: number;
	created_at: string;
	updated_at: string;
};

function toMemberResponse(row: MemberRow) {
	return {
		id: row.id,
		name: row.name,
		role: row.role,
		lineUserId: row.line_user_id,
		inviteToken: row.invite_token,
		inviteUsed: row.invite_used === 1,
		isActive: row.is_active === 1,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export const adminRoute = new Hono<AppEnv>();

adminRoute.use("/*", authMiddleware);
adminRoute.use("/*", adminMiddleware);

// GET /api/admin/members — list all members
adminRoute.get("/members", async (c) => {
	const { results } = await c.env.DB.prepare(
		"SELECT id, name, role, line_user_id, invite_token, invite_used, is_active, created_at, updated_at FROM users ORDER BY id",
	).all<MemberRow>();

	return c.json(results.map(toMemberResponse));
});

// POST /api/admin/members — create a new member
adminRoute.post("/members", async (c) => {
	const body = await c.req.json<{ name?: string; role?: string }>();

	if (!body.name || body.name.trim() === "") {
		return c.json({ error: "Name is required" }, 400);
	}

	const role = body.role ?? "member";
	if (role !== "admin" && role !== "member") {
		return c.json({ error: "Role must be admin or member" }, 400);
	}

	const inviteToken = crypto.randomUUID();

	const result = await c.env.DB.prepare(
		"INSERT INTO users (name, role, invite_token) VALUES (?, ?, ?)",
	)
		.bind(body.name.trim(), role, inviteToken)
		.run();

	const newRow = await c.env.DB.prepare(
		"SELECT id, name, role, line_user_id, invite_token, invite_used, is_active, created_at, updated_at FROM users WHERE id = ?",
	)
		.bind(result.meta.last_row_id)
		.first<MemberRow>();

	if (!newRow) {
		return c.json({ error: "Failed to retrieve created member" }, 500);
	}
	return c.json(toMemberResponse(newRow), 201);
});

// PUT /api/admin/members/:id — update a member
adminRoute.put("/members/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const body = await c.req.json<{ name?: string; role?: string }>();

	const existing = await c.env.DB.prepare("SELECT id FROM users WHERE id = ?")
		.bind(id)
		.first();

	if (!existing) {
		return c.json({ error: "Member not found" }, 404);
	}

	if (body.role && body.role !== "admin" && body.role !== "member") {
		return c.json({ error: "Role must be admin or member" }, 400);
	}

	const updates: string[] = [];
	const values: unknown[] = [];

	if (body.name !== undefined) {
		updates.push("name = ?");
		values.push(body.name.trim());
	}
	if (body.role !== undefined) {
		updates.push("role = ?");
		values.push(body.role);
	}

	if (updates.length > 0) {
		updates.push("updated_at = datetime('now')");
		values.push(id);
		await c.env.DB.prepare(
			`UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
		)
			.bind(...values)
			.run();
	}

	const updated = await c.env.DB.prepare(
		"SELECT id, name, role, line_user_id, invite_token, invite_used, is_active, created_at, updated_at FROM users WHERE id = ?",
	)
		.bind(id)
		.first<MemberRow>();

	if (!updated) {
		return c.json({ error: "Member not found" }, 404);
	}
	return c.json(toMemberResponse(updated));
});

// DELETE /api/admin/members/:id — soft-delete (deactivate)
adminRoute.delete("/members/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const user = c.get("user");

	const existing = await c.env.DB.prepare("SELECT id FROM users WHERE id = ?")
		.bind(id)
		.first();

	if (!existing) {
		return c.json({ error: "Member not found" }, 404);
	}

	if (user.id === id) {
		return c.json({ error: "Cannot deactivate yourself" }, 400);
	}

	await c.env.DB.prepare(
		"UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?",
	)
		.bind(id)
		.run();

	return c.json({ ok: true });
});

// POST /api/admin/members/:id/reinvite — reset LINE link + new token
adminRoute.post("/members/:id/reinvite", async (c) => {
	const id = Number(c.req.param("id"));

	const existing = await c.env.DB.prepare("SELECT id FROM users WHERE id = ?")
		.bind(id)
		.first();

	if (!existing) {
		return c.json({ error: "Member not found" }, 404);
	}

	const newToken = crypto.randomUUID();

	await c.env.DB.prepare(
		"UPDATE users SET line_user_id = NULL, invite_token = ?, invite_used = 0, updated_at = datetime('now') WHERE id = ?",
	)
		.bind(newToken, id)
		.run();

	const updated = await c.env.DB.prepare(
		"SELECT id, name, role, line_user_id, invite_token, invite_used, is_active, created_at, updated_at FROM users WHERE id = ?",
	)
		.bind(id)
		.first<MemberRow>();

	if (!updated) {
		return c.json({ error: "Member not found" }, 404);
	}
	return c.json(toMemberResponse(updated));
});
