import { afterEach, describe, expect, it, vi } from "vitest";
import {
	createEnv,
	createMockD1,
	createMockKV,
} from "../../__tests__/helpers.ts";
import app from "../../index.ts";

afterEach(() => {
	vi.restoreAllMocks();
});

// Helper: create env with valid admin session + DB that returns admin user for auth
function createAdminEnv() {
	const kv = createMockKV({
		"session:admin_sid": JSON.stringify({
			userId: 1,
			lineUserId: "U_admin",
			role: "admin",
		}),
	});

	const adminRow = {
		id: 1,
		name: "Admin User",
		role: "admin",
		line_user_id: "U_admin",
		is_active: 1,
	};

	const db = createMockD1([adminRow]);
	return createEnv({ SESSION_KV: kv, DB: db });
}

const adminHeaders = { Cookie: "session_id=admin_sid" };

// Helper: create env with member session
function createMemberEnv() {
	const kv = createMockKV({
		"session:member_sid": JSON.stringify({
			userId: 2,
			lineUserId: "U_member",
			role: "member",
		}),
	});
	const db = createMockD1([
		{
			id: 2,
			name: "Member User",
			role: "member",
			line_user_id: "U_member",
			is_active: 1,
		},
	]);
	return createEnv({ SESSION_KV: kv, DB: db });
}

describe("GET /api/admin/members", () => {
	it("returns 401 without session", async () => {
		const env = createEnv();
		const res = await app.request(
			"http://localhost/api/admin/members",
			{},
			env,
		);
		expect(res.status).toBe(401);
	});

	it("returns 403 for member role", async () => {
		const env = createMemberEnv();
		const res = await app.request(
			"http://localhost/api/admin/members",
			{ headers: { Cookie: "session_id=member_sid" } },
			env,
		);
		expect(res.status).toBe(403);
	});

	it("returns member list for admin", async () => {
		const members = [
			{
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				invite_token: "tok1",
				invite_used: 1,
				is_active: 1,
				created_at: "2025-01-01 00:00:00",
				updated_at: "2025-01-01 00:00:00",
			},
			{
				id: 2,
				name: "Member",
				role: "member",
				line_user_id: null,
				invite_token: "tok2",
				invite_used: 0,
				is_active: 1,
				created_at: "2025-01-02 00:00:00",
				updated_at: "2025-01-02 00:00:00",
			},
		];

		const allStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi
				.fn()
				.mockResolvedValue({ results: members, success: true, meta: {} }),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};

		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				return allStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members",
			{ headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as unknown[];
		expect(json).toHaveLength(2);
		expect(json[0]).toMatchObject({
			id: 1,
			name: "Admin",
			role: "admin",
			lineUserId: "U_admin",
			inviteToken: "tok1",
			inviteUsed: true,
			isActive: true,
		});
		expect(json[1]).toMatchObject({
			id: 2,
			name: "Member",
			role: "member",
			lineUserId: null,
			inviteToken: "tok2",
			inviteUsed: false,
			isActive: true,
		});
	});
});

describe("POST /api/admin/members", () => {
	it("returns 400 when name is missing", async () => {
		const env = createAdminEnv();
		const res = await app.request(
			"http://localhost/api/admin/members",
			{
				method: "POST",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ role: "member" }),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 when role is invalid", async () => {
		const env = createAdminEnv();
		const res = await app.request(
			"http://localhost/api/admin/members",
			{
				method: "POST",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "New", role: "superadmin" }),
			},
			env,
		);
		expect(res.status).toBe(400);
	});

	it("creates a member with 201 and returns the new member", async () => {
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({
				success: true,
				meta: { last_row_id: 5 },
				results: [],
			}),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 5,
				name: "New Member",
				role: "member",
				line_user_id: null,
				invite_token: "generated-token",
				invite_used: 0,
				is_active: 1,
				created_at: "2025-06-01 00:00:00",
				updated_at: "2025-06-01 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				if (prepareCallCount === 2) return runStmt;
				return selectStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members",
			{
				method: "POST",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "New Member", role: "member" }),
			},
			env,
		);
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 5,
			name: "New Member",
			role: "member",
			inviteToken: "generated-token",
		});
	});
});

describe("PUT /api/admin/members/:id", () => {
	it("returns 404 when member not found", async () => {
		const firstStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				return firstStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members/999",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "Updated" }),
			},
			env,
		);
		expect(res.status).toBe(404);
	});

	it("updates member and returns 200", async () => {
		const existingRow = {
			id: 2,
			name: "Old Name",
			role: "member",
			line_user_id: null,
			invite_token: "tok2",
			invite_used: 0,
			is_active: 1,
			created_at: "2025-01-01 00:00:00",
			updated_at: "2025-01-01 00:00:00",
		};
		const updatedRow = {
			...existingRow,
			name: "New Name",
			role: "admin",
			updated_at: "2025-06-01 00:00:00",
		};

		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(existingRow),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const reSelectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(updatedRow),
			all: vi.fn(),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				if (prepareCallCount === 2) return selectStmt;
				if (prepareCallCount === 3) return runStmt;
				return reSelectStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members/2",
			{
				method: "PUT",
				headers: { ...adminHeaders, "Content-Type": "application/json" },
				body: JSON.stringify({ name: "New Name", role: "admin" }),
			},
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({ id: 2, name: "New Name", role: "admin" });
	});
});

describe("DELETE /api/admin/members/:id", () => {
	it("returns 404 when member not found", async () => {
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				return selectStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members/999",
			{ method: "DELETE", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("returns 400 when trying to deactivate self", async () => {
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				return selectStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members/1",
			{ method: "DELETE", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json).toMatchObject({ error: "Cannot deactivate yourself" });
	});

	it("deactivates member with 200", async () => {
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 2,
				name: "Member",
				role: "member",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				if (prepareCallCount === 2) return selectStmt;
				return runStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members/2",
			{ method: "DELETE", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		expect(runStmt.bind).toHaveBeenCalledWith(2);
	});
});

describe("POST /api/admin/members/:id/reinvite", () => {
	it("returns 404 when member not found", async () => {
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue(null),
			all: vi.fn(),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				return selectStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members/999/reinvite",
			{ method: "POST", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(404);
	});

	it("resets LINE link and generates new invite token", async () => {
		const authStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 1,
				name: "Admin",
				role: "admin",
				line_user_id: "U_admin",
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const selectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 2,
				name: "Member",
				role: "member",
				line_user_id: "U_old",
				invite_token: "old_token",
				invite_used: 1,
				is_active: 1,
			}),
			all: vi.fn(),
			run: vi.fn(),
		};
		const runStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn().mockResolvedValue({ success: true, meta: {}, results: [] }),
		};
		const reSelectStmt = {
			bind: vi.fn().mockReturnThis(),
			first: vi.fn().mockResolvedValue({
				id: 2,
				name: "Member",
				role: "member",
				line_user_id: null,
				invite_token: "new_token",
				invite_used: 0,
				is_active: 1,
				created_at: "2025-01-01 00:00:00",
				updated_at: "2025-06-01 00:00:00",
			}),
			all: vi.fn(),
			run: vi.fn(),
		};

		let prepareCallCount = 0;
		const db = {
			prepare: vi.fn(() => {
				prepareCallCount++;
				if (prepareCallCount === 1) return authStmt;
				if (prepareCallCount === 2) return selectStmt;
				if (prepareCallCount === 3) return runStmt;
				return reSelectStmt;
			}),
			batch: vi.fn(),
			exec: vi.fn(),
			dump: vi.fn(),
		} as unknown as D1Database;

		const kv = createMockKV({
			"session:admin_sid": JSON.stringify({
				userId: 1,
				lineUserId: "U_admin",
				role: "admin",
			}),
		});
		const env = createEnv({ SESSION_KV: kv, DB: db });

		const res = await app.request(
			"http://localhost/api/admin/members/2/reinvite",
			{ method: "POST", headers: adminHeaders },
			env,
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toMatchObject({
			id: 2,
			lineUserId: null,
			inviteUsed: false,
		});
		// Verify the update query was called with correct params
		expect(runStmt.bind).toHaveBeenCalledWith(expect.any(String), 2);
	});
});
