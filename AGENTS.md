# AGENTS.md

This file provides guidance to AI coding agents (Claude Code and others) when working with this repository.

## Project Overview

PWA for members (~30) of Nitonabbc Church. Solid.js + TypeScript, Vite build, pnpm.

- LINE authentication only, 2 roles (admin / member)
- Light theme + frost-white glassmorphism ("God's Glory" theme), mobile-first
- Japanese/English i18n
- External subdomain services embedded via iframe

## Approach

- **Change scope.** Change only what was requested. Don't "improve" adjacent code,
  comments, or formatting; match the existing style. Delete code your own change makes
  unused, never leave it commented out. Point out pre-existing dead code only; don't
  delete, split, or refactor it unless asked.
- **Implementation size.** Don't add unrequested features, abstractions, or
  configurability. Extract a helper only when it's used in 3+ places; otherwise inline
  it. Don't write error handling for cases that can't happen.
- **Uncertainty.** When more than one interpretation is possible, present the options
  instead of silently picking one.

## Language

Default to the user's language for everything interactive — chat replies, plan-mode
proposals, clarifying questions, and any other back-and-forth during the session.

Switch to English only for durable artifacts: things other people or tools will read
after the session ends — in-code comments, console/log/error output, AI-readable
instruction files, and reader-facing docs (README and the like). Scratch notes and other
throwaway dev artifacts stay in the user's language.

## Specification Documents

Specs live in `docs/`. Always read the relevant doc before implementing.
Add a new doc in `docs/` and link it from `spec.md` when adding features.

@docs/spec.md

## Safety: Deployment and Production Data

Production deployments and remote DB migrations run exclusively via GitHub Actions.
The npm scripts `deploy` and `db:migrate:remote` are **intentionally not defined** in
`package.json` to prevent accidental local execution.

**Never run the following from a local machine:**

- `wrangler deploy` — production deployments are triggered by push to `main` (or any branch for Preview)
- `wrangler d1 migrations apply ... --remote` — production DB migrations run via GitHub Actions only
- Any other `wrangler` command targeting production with `--remote`

**Allowed locally:**

- `pnpm db:migrate:local` — apply pending migrations to local D1
- `pnpm db:reset` — wipe local D1 and re-apply all migrations from scratch
- `pnpm db:seed` — insert sample data from `scripts/seed.sql`
- `pnpm db:fresh` — `db:reset` + `db:seed` in one step
- All other local dev operations: `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`, etc.

## Architecture

- **Routing**: `@solidjs/router`. Routes defined in `src/index.tsx`, root layout in `src/App.tsx` (auth gate + Toaster)
  - Member routes (`/`, `/settings`, `/bulletin/*`) nest under `MemberLayout` (TabBar)
  - Admin routes (`/admin/*`) nest under `AdminLayout` (sidebar, admin role guard)
  - TabBar behavior (mobile vs desktop, per-tab state restoration): see `docs/spec.md`
- **Auth context**: `useAuth()` from `src/store/AuthContext.tsx` — provides user info and `logout`

See `.claude/rules/` for detailed conventions per area (UI, CSS, API, testing).

## Environments

| Env | Description |
|-----|-------------|
| Local | `pnpm dev` starts Vite (HMR) + workerd together via `@cloudflare/vite-plugin`. Set `DEV_AUTH=true` in `.dev.vars` to skip LINE auth and auto-login as admin |
| Preview | Auto-deployed on non-`main` branch push |
| Production | Auto-deployed on `main` branch push |

KV / D1 bindings are isolated per environment. LINE Login callback URLs must be configured per environment.

## Database (Cloudflare D1 + Drizzle)

See `.claude/rules/api.md` for schema, access, and migration-command conventions (loads automatically when editing `server/`, `worker/`, or `drizzle/`). Use the `/db-migrate` skill for the guided schema-change workflow.

## Code Structure

- Name variables, functions, and files to communicate intent.
- One concern per file; split new code when a file exceeds ~300 lines. Don't split
  existing files unless asked.
- Extract a helper only when used in 3+ places; otherwise inline it.
- Delete dead code you create; never comment it out.

## Testing

- Write tests before or alongside implementation — they are your success criteria.
- Test observable outcomes and edge cases, not implementation details.
- Each test is fully self-contained; no shared mutable state between tests.

## Commits

Format — plain prose, no prefixes or labels (`feat:`, `fix:`, and the like):

```
<summary: imperative mood, ≤70 chars, no trailing period>

<motivation: one sentence, only when not evident from the diff>

- <change bullets: only for 2+ distinct changes>
```

- Never commit secrets (`*.key`, `*.pem`, `credentials*`).
- Never use `--no-verify`. Use `--amend` only when explicitly asked; default to a new
  commit.
