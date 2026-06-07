---
name: db-migrate
description: >
  Guide for applying schema changes to the local and production D1 database.
  Use when the user mentions migration, DB reset, applying schema changes,
  drizzle generate, or rebuilding the local DB.
allowed-tools: Bash Read
---

Apply schema changes via drizzle-kit + wrangler. Follow these steps:

1. Read `server/db/schema.ts` and display the changes made.

2. Generate the migration SQL:
   ```
   node_modules/.bin/drizzle-kit generate
   ```
   This creates a new `.sql` file under `drizzle/`.

3. For migrations that drop or rename columns the local DB must be rebuilt from
   scratch. Get user approval, then run:
   ```
   pnpm db:reset
   ```
   This deletes `.wrangler/state/v3/d1` (local D1 only — KV/session state is
   preserved) and re-applies all migrations. After the reset, restart `pnpm dev`
   so the fresh DB file exists before further operations.

   For non-breaking additions (new table, new nullable column) a reset is optional —
   skip to step 4 and apply in place.

4. Apply the migration to the local DB (skip if already done via `pnpm db:reset`):
   ```
   pnpm db:migrate:local
   ```

5. To restore sample data after a reset:
   ```
   pnpm db:seed
   ```
   Or reset + seed in one step: `pnpm db:fresh`.

6. Production migrations are handled exclusively by GitHub Actions.
   Never run `wrangler d1 migrations apply nitonabbc-db --remote` locally.

**Important notes**:
- `server/db/schema.ts` is the single source of truth. Never edit the generated
  files under `drizzle/` manually.
- `pnpm db:reset` removes all local D1 data. Always get user approval before
  proceeding.
- Seed data lives in `scripts/seed.sql` (INSERT OR IGNORE, safe to re-run).
