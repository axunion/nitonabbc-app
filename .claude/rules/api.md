---
paths:
  - "server/**"
  - "worker/**"
  - "drizzle/**"
---

# API Rules

## Server structure

- Route definitions: `server/routes/<resource>.ts` (one file per resource)
- Route registration: add `.route("/api/<resource>", resourceRoute)` in `server/index.ts`
- Middleware: `server/middleware/<name>.ts`
- Type definitions: manage `Bindings` and `Variables` centrally in `server/types.ts` as `AppEnv`
- Worker entry: re-export Hono app from `worker/index.ts`
- Type checking: `tsconfig.server.json` (uses `@cloudflare/workers-types`)

## DB access

- **All DB access goes through `c.get("db")`** — a drizzle instance injected by `dbMiddleware`
- Schema tables: `import { users, bulletins, settings } from "../db/schema.ts"`
- Query helpers: `import { eq, sql, asc, desc } from "drizzle-orm"`
- Never access `c.env.DB` directly in route handlers or middleware
- `dbMiddleware` is idempotent: if `db` is already set (e.g. by a test wrapper), it skips re-initialisation

## Schema management

- Schema definition: `server/db/schema.ts` is the single source of truth
- Shared bulletin types: `server/db/types.ts` (`SectionData`, `SectionTemplate`, `WorshipItemData`, etc.)
- Generate migration: `node_modules/.bin/drizzle-kit generate`
- Migration output: `drizzle/` directory (committed; applied by wrangler)
- Apply local: `wrangler d1 migrations apply nitonabbc-db --local`
- Apply remote: `wrangler d1 migrations apply nitonabbc-db --remote`

## Response conventions

- Success: `c.json(data)` or `c.json(data, statusCode)`
- Error: `c.json({ error: "message" }, statusCode)`
- Empty response: `c.body(null, 204)`

## Cloudflare Workers environment

- Node.js APIs are not available (`fs`, `path`, etc.)
- Access env vars and bindings via `c.env`
- D1 binding: `DB` · KV binding: `SESSION_KV`
- Session: `session:{uuid}` → `{ userId, lineUserId, role }` JSON
- OAuth state: `oauth_state:{uuid}` → `"1"` or `{ inviteToken: "..." }` JSON

## Testing

See `.claude/rules/testing.md` for test targets, structure, and utilities.
`node_modules/.bin/vitest run` targets `server/**/*.test.ts` only.
Create the test file before implementing a new route (TDD).

## FK constraints

Foreign key constraints exist (`bulletins.created_by` → `users.id`).
In DEV_AUTH mode, `getOrCreateDevUser()` in `middleware/auth.ts` automatically
creates a dev user, satisfying FK constraints.
