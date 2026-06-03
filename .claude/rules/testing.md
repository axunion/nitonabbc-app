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
- **Environment**: Node.js (`@cloudflare/vitest-pool-workers` is not used; D1/KV are mocked)

## File layout

```
server/
  __tests__/helpers.ts                   # Shared KV/D1 mock utilities
  routes/__tests__/<name>.test.ts        # Tests per route
  middleware/__tests__/<name>.test.ts
```

## Mock utilities (`server/__tests__/helpers.ts`)

- `createMockKV(initial?)` — in-memory Map mock for KVNamespace
- `createMockD1(rows?)` — D1Database mock returning fixed rows
- `createEnv(overrides?)` — assembles Bindings; override only what each test needs

## Testing Hono routes

Use `app.request(url, init?, env?)`. Pass `createEnv()` as the third argument to inject Bindings.

```typescript
const env = createEnv({ SESSION_KV: createMockKV({ "session:sid": "..." }) });
const res = await app.request("http://localhost/api/auth/me",
  { headers: { Cookie: "session_id=sid" } },
  env,
);
```

## TDD workflow

1. **Write the test first** — describe the expected behavior in the test
2. **Make it fail (Red)** — run `pnpm test` and confirm failure
3. **Implement (Green)** — write the minimum code to make the test pass
4. **Refactor** — clean up the code while keeping tests green

## Mocking external fetch

Mock external HTTP calls like the LINE API with `vi.spyOn(global, "fetch")`.
Do not forget `afterEach(() => vi.restoreAllMocks())`.
