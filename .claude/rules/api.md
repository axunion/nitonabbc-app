---
paths:
  - "server/**"
  - "worker/**"
  - "db/**"
---

# API Rules

## Server structure

- Route definitions: `server/routes/<resource>.ts` (one file per resource)
- Route registration: add `.route("/api/<resource>", resourceRoute)` in `server/index.ts`
- Middleware: `server/middleware/<name>.ts`
- Type definitions: manage `Bindings` and `Variables` centrally in `server/types.ts` as `AppEnv`
- Worker entry: re-export Hono app from `worker/index.ts`
- Type checking: `tsconfig.server.json` (uses `@cloudflare/workers-types`)

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

See `.claude/rules/testing.md` for test targets, structure, and mock utilities. `pnpm test` targets `server/**/*.test.ts` only. Create the test file before implementing a new route (TDD).

## D1 schema management

See the Database section in CLAUDE.md for schema change and production deploy procedures.

- Foreign key constraints exist (e.g. `bulletins.created_by` → `users.id`). Ensure referenced records exist before INSERT.
- In DEV_AUTH mode, `getOrCreateDevUser()` in `auth.ts` automatically creates a dev user, satisfying foreign key constraints.
