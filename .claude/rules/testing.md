---
paths:
  - "server/**/*.test.ts"
  - "server/__tests__/**"
  - "vitest.config.ts"
---

# Testing Rules (TDD)

Develop API routes using TDD.

## Testing scope

**Test only the backend (`server/`). This is an intentional design decision.**

- The majority of business logic resides on the server side
- The frontend is small scale (~30 users) with an admin always present; visual inspection is sufficient coverage
- Testing Solid.js hooks has a high runtime dependency cost relative to the benefit
- Pure frontend utilities (`src/utils/`) are indirectly covered by the backend tests

## Test structure

- **Test runner**: Vitest (config: `vitest.config.ts`)
- **Scope**: `server/**/*.test.ts` (API routes and middleware) only
- **Environment**: Node.js (`@cloudflare/vitest-pool-workers` is not used)
  - KV is mocked with an in-memory `Map`
  - D1 is replaced by a **better-sqlite3 in-memory database** running real SQL via drizzle migrations

## File layout

```
server/
  __tests__/helpers.ts                   # Shared utilities (createTestDb, wrapWithDb, createMockKV, createEnv)
  routes/__tests__/<name>.test.ts        # Tests per route
  middleware/__tests__/<name>.test.ts
```

## Test utilities (`server/__tests__/helpers.ts`)

- `createMockKV(initial?)` — in-memory Map mock for KVNamespace
- `createEnv(overrides?)` — assembles Bindings; the `DB` field is a dummy (not used directly)
- `createTestDb()` — creates a fresh `:memory:` SQLite database, applies drizzle migrations from `./drizzle/`, returns a drizzle instance
- `wrapWithDb(app, db)` — wraps the Hono app so that `db` is injected into the context before `dbMiddleware` runs (idempotent check skips the real D1 init)

## Standard test pattern

```typescript
import type { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEnv, createMockKV, createTestDb, wrapWithDb,
} from "../../__tests__/helpers.ts";
import { schema } from "../../db/index.ts";
import app from "../../index.ts";
import type { AppEnv } from "../../types.ts";

let db: ReturnType<typeof createTestDb>;
let testApp: Hono<AppEnv>;

beforeEach(() => {
  db = createTestDb();
  testApp = wrapWithDb(app, db);
});
afterEach(() => { vi.restoreAllMocks(); });

// Seed data directly into db, build session KV, make requests via testApp:
it("example", async () => {
  const [user] = await db.insert(schema.users).values({
    name: "Admin", role: "admin", lineUserId: "U1",
    inviteToken: "tok", inviteUsed: true, isActive: true,
  }).returning();
  const kv = createMockKV({
    "session:sid": JSON.stringify({ userId: user.id, lineUserId: "U1", role: "admin" }),
  });
  const res = await testApp.request(
    "http://localhost/api/admin/members",
    { headers: { Cookie: "session_id=sid" } },
    createEnv({ SESSION_KV: kv }),
  );
  expect(res.status).toBe(200);
});
```

## TDD workflow

1. **Write the test first** — describe the expected behavior in the test
2. **Make it fail (Red)** — run `node_modules/.bin/vitest run` and confirm failure
3. **Implement (Green)** — write the minimum code to make the test pass
4. **Refactor** — clean up the code while keeping tests green

## Mocking external fetch

Mock external HTTP calls like the LINE API with `vi.spyOn(global, "fetch")`.
Do not forget `afterEach(() => vi.restoreAllMocks())`.

## Note: pnpm test vs direct vitest

Because better-sqlite3 requires native bindings that pnpm's build-approval flow
may block, run tests directly with `node_modules/.bin/vitest run` rather than
`pnpm test` if the latter fails with `ERR_PNPM_IGNORED_BUILDS`.
