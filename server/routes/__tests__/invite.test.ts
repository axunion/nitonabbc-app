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

describe("GET /api/invite/:token", () => {
  it("redirects to LINE auth URL for a valid token", async () => {
    await db.insert(schema.users).values({
      name: "New Member",
      inviteToken: "valid-token-123",
      inviteUsed: false,
      isActive: true,
    });
    const kv = createMockKV();
    const env = createEnv({ SESSION_KV: kv });

    const res = await testApp.request(
      "http://localhost/api/invite/valid-token-123",
      {},
      env,
    );

    expect(res.status).toBe(302);
    const location = res.headers.get("Location") ?? "";
    expect(location).toContain("access.line.me");
    expect(location).toContain("client_id=test_channel_id");
    expect(kv.put).toHaveBeenCalledWith(
      expect.stringMatching(/^oauth_state:/),
      expect.stringContaining('"inviteToken":"valid-token-123"'),
      { expirationTtl: 600 },
    );
    const state = new URL(location).searchParams.get("state");
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain(`oauth_state=${state}`);
    expect(setCookie).toContain("HttpOnly");
  });

  it("returns 404 for a non-existent token", async () => {
    const res = await testApp.request(
      "http://localhost/api/invite/nonexistent",
      {},
      createEnv(),
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 for an already-used token", async () => {
    await db.insert(schema.users).values({
      name: "Member",
      inviteToken: "used-token",
      inviteUsed: true,
      isActive: true,
    });
    const res = await testApp.request(
      "http://localhost/api/invite/used-token",
      {},
      createEnv(),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for an inactive user", async () => {
    await db.insert(schema.users).values({
      name: "Inactive",
      inviteToken: "inactive-token",
      inviteUsed: false,
      isActive: false,
    });
    const res = await testApp.request(
      "http://localhost/api/invite/inactive-token",
      {},
      createEnv(),
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when LINE account is already linked", async () => {
    await db.insert(schema.users).values({
      name: "Linked",
      lineUserId: "U_already_linked",
      inviteToken: "linked-token",
      inviteUsed: false,
      isActive: true,
    });
    const res = await testApp.request(
      "http://localhost/api/invite/linked-token",
      {},
      createEnv(),
    );
    expect(res.status).toBe(400);
  });
});
