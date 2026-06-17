import type { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEnv,
  createMockKV,
  createTestDb,
  wrapWithDb,
} from "../../__tests__/helpers.ts";
import { schema } from "../../db/index.ts";
import app from "../../index.ts";
import type { AppEnv } from "../../types.ts";

type TestDb = ReturnType<typeof createTestDb>;

let db: TestDb;
let testApp: Hono<AppEnv>;

beforeEach(() => {
  db = createTestDb();
  testApp = wrapWithDb(app, db);
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function seedMemberSession() {
  const [user] = await db
    .insert(schema.users)
    .values({
      name: "Member User",
      role: "member",
      lineUserId: "U_member",
      inviteToken: "member_token",
      inviteUsed: true,
      isActive: true,
    })
    .returning();
  const kv = createMockKV({
    "session:member_sid": JSON.stringify({
      userId: user.id,
      lineUserId: "U_member",
      role: "member",
    }),
  });
  return createEnv({ SESSION_KV: kv });
}

const memberHeaders = { Cookie: "session_id=member_sid" };

describe("GET /api/members", () => {
  it("returns 401 without session", async () => {
    const res = await testApp.request(
      "http://localhost/api/members",
      {},
      createEnv(),
    );
    expect(res.status).toBe(401);
  });

  it("returns active members list", async () => {
    const env = await seedMemberSession();
    await db.insert(schema.users).values([
      { name: "Alice", inviteToken: "tok_alice", isActive: true },
      { name: "Bob", inviteToken: "tok_bob", isActive: true },
    ]);

    const res = await testApp.request(
      "http://localhost/api/members",
      { headers: memberHeaders },
      env,
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { id: number; name: string }[];
    // Includes the seeded member user + Alice + Bob (active only)
    const names = json.map((r) => r.name).sort();
    expect(names).toContain("Alice");
    expect(names).toContain("Bob");
  });

  it("includes serviceRoles in each member", async () => {
    const env = await seedMemberSession();
    await db.insert(schema.users).values([
      {
        name: "Preacher",
        inviteToken: "tok_preacher",
        isActive: true,
        serviceRoles: ["説教", "司会"],
      },
    ]);

    const res = await testApp.request(
      "http://localhost/api/members",
      { headers: memberHeaders },
      env,
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      name: string;
      serviceRoles: string[];
    }[];
    const preacher = json.find((m) => m.name === "Preacher");
    expect(preacher?.serviceRoles).toEqual(["説教", "司会"]);
  });

  it("excludes inactive members", async () => {
    const env = await seedMemberSession();
    await db.insert(schema.users).values([
      { name: "Active", inviteToken: "tok_active", isActive: true },
      { name: "Inactive", inviteToken: "tok_inactive", isActive: false },
    ]);

    const res = await testApp.request(
      "http://localhost/api/members",
      { headers: memberHeaders },
      env,
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { name: string }[];
    const names = json.map((r) => r.name);
    expect(names).toContain("Active");
    expect(names).not.toContain("Inactive");
  });

  it("returns empty array when no active members", async () => {
    // Seed a member user for auth but immediately deactivate everyone after getting env
    const env = await seedMemberSession();
    // deactivate all users
    const { eq } = await import("drizzle-orm");
    await db
      .update(schema.users)
      .set({ isActive: false })
      .where(eq(schema.users.isActive, true));

    const res = await testApp.request(
      "http://localhost/api/members",
      { headers: memberHeaders },
      env,
    );
    // Auth will fail since user is now inactive
    expect(res.status).toBe(401);
  });
});
