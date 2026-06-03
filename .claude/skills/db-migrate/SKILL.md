---
name: db-migrate
description: >
  Guide for resetting and re-applying the local D1 database after schema changes.
  Use when the user mentions migration, DB reset, applying schema changes, or rebuilding the local DB.
allowed-tools: Bash Read
---

Apply `db/schema.sql` changes to the local D1 database. Follow these steps:

1. Read `db/schema.sql` and display the changes.
2. If `.wrangler/state/` exists, inform the user that a local DB reset is required and ask them to run the following command themselves (Claude cannot execute it due to security policy):
   ```
   rm -rf .wrangler/state/
   ```
3. Guide the user to apply the schema:
   ```
   wrangler d1 execute nitonabbc-db --file=db/schema.sql --local
   ```
4. Ask whether the changes also need to be applied to production.
   - If yes, explain to use the `--remote` flag and ask for confirmation before running.

**Note**: Deleting `.wrangler/state/` removes all local test data. Always get user approval before proceeding.
