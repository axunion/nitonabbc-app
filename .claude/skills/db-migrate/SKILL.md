---
name: db-migrate
description: >
  Guide for applying schema changes to the local and production D1 database.
  Use when the user mentions migration, DB reset, applying schema changes,
  drizzle generate, or rebuilding the local DB.
allowed-tools: Bash Read
---

@.claude/rules/api.md

The rule above has the full command reference (`db:generate`, `db:migrate:local`,
`db:reset`, `db:seed`, `db:fresh`) and the FK-constraints note. This skill adds
the decision logic and safety gate around those commands:

1. Read `server/db/schema.ts` and display the changes made.

2. Generate the migration SQL: `node_modules/.bin/drizzle-kit generate`.
   This creates a new `.sql` file under `drizzle/`. Never edit generated
   `drizzle/` files by hand — `schema.ts` is the single source of truth.

3. Decide whether the local DB needs a full rebuild:
   - **Breaking change** (column drop/rename, anything that can't apply in
     place) — get user approval, then run `pnpm db:reset`. This deletes
     `.wrangler/state/v3/d1` (local D1 only; KV/session state is preserved)
     and re-applies all migrations. Restart `pnpm dev` afterward so the fresh
     DB file exists before further operations.
   - **Non-breaking addition** (new table, new nullable column) — skip the
     reset and go straight to step 4.

4. Apply the migration to the local DB (skip if already done via `pnpm db:reset`):
   `pnpm db:migrate:local`.

5. To restore sample data after a reset: `pnpm db:seed`, or `pnpm db:fresh`
   to reset + seed in one step.

6. Production migrations are handled exclusively by GitHub Actions.
   Never run `wrangler d1 migrations apply nitonabbc-db --remote` locally.

**Important**: `pnpm db:reset` removes all local D1 data. Always get user
approval before proceeding.
