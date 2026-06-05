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

3. If `.wrangler/state/` exists, inform the user that a local DB reset is required
   for migrations that drop/rename columns. Ask them to run:
   ```
   rm -rf .wrangler/state/
   ```
   (Claude cannot execute this due to security policy — user must run it manually.)

4. Apply the migration to the local DB:
   ```
   wrangler d1 migrations apply nitonabbc-db --local
   ```
   After a `.wrangler/state/` reset, also restart `pnpm dev` first so the empty
   DB file is created before applying migrations.

5. Ask whether the changes also need to be applied to production.
   - If yes, explain to run `wrangler d1 migrations apply nitonabbc-db --remote`
     and ask for confirmation before proceeding.

**Important notes**:
- `server/db/schema.ts` is the single source of truth. Never edit the generated
  files under `drizzle/` manually.
- Deleting `.wrangler/state/` removes all local test data. Always get user approval
  before proceeding.
- For non-breaking additions (new table, new nullable column), a reset is optional —
  the migration can be applied in place.
