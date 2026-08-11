---
name: new-feature
description: >
  Scaffold a brand-new feature end-to-end across all layers (schema, migration,
  API + tests, fetch layer, page, i18n, docs). Use when the user wants to add a
  whole new feature area (e.g. attendance, giving records, prayer requests,
  calendar, member directory) rather than extend an existing one.
allowed-tools: Bash Read Edit Write Glob Grep
disable-model-invocation: true
---

Scaffold a new feature as a vertical slice, one layer at a time. Each step
delegates to the existing rule/skill that already owns that layer's
conventions — do not re-explain those conventions here.

## 0. Scope the feature

Confirm with the user: feature name, the DB fields it needs, and whether it
needs a new page/route or only an API. Stop and ask if any of these is unclear.

## 1. Spec

Create `docs/<feature-name>.md` and link it from `docs/spec.md`'s feature table.
Follow `/spec-update`'s document structure (Overview / Data model / API / UI /
Implementation status / Notes).

## 2. Database

Edit `server/db/schema.ts` to add the new table(s)/column(s).
Follow `/db-migrate` to generate and apply the migration:
`pnpm db:generate` → (reset if breaking) → `pnpm db:migrate:local`.

## 3. API (TDD)

Create `server/routes/__tests__/<resource>.test.ts` **before** the route.
Follow `@.claude/rules/api.md` and `@.claude/rules/testing.md` for structure,
response conventions, and test helpers. Register the route in `server/index.ts`.
Run `node_modules/.bin/vitest run` to confirm Red → Green.

## 4. Fetch layer

Add `src/api/<resource>.ts`. Pages must not write fetch logic inline
(see `@.claude/rules/frontend.md`).

## 5. Page

Create `src/pages/<Page>/`, extracting complex logic into `hooks/` within the
page directory. Follow `@.claude/rules/frontend.md` for CSS Modules, tokens,
and the `pageContainer` composes pattern. Register the route in
`src/index.tsx` under the appropriate layout (`MemberLayout` or
`AdminLayout`) — without this the page is unreachable.

## 6. i18n

Add a new top-level namespace to both `src/locales/ja.ts` and
`src/locales/en.ts` (e.g. `attendance: { title: "...", present: "..." }`),
with leaf keys in flatCase. `en.ts` is typed against `Dictionary = typeof ja`
(`src/locales/index.ts`), so a key added to one file and forgotten in the
other is a TypeScript error, not a silent gap. Never hardcode UI text.

## 7. Entry point (if applicable)

If the feature needs a dashboard entry point, add a widget per the dashboard
layout in `docs/spec.md` (2-column grid, span per item count).

## 8. Verify

Run `pnpm check && node_modules/.bin/vitest run`.
