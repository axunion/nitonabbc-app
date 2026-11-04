# CLAUDE.md

## Project Overview

PWA for members (~30) of Nitonabbc Church. Solid.js + TypeScript, Vite build, pnpm.

- LINE authentication only, 2 roles (admin / member)
- Light theme + frost-white glassmorphism ("God's Glory" theme), mobile-first
- Japanese/English i18n
- External subdomain services embedded via iframe

## Specification Documents

Specs live in `docs/`. Always read the relevant doc before implementing.
Add a new doc in `docs/` and link it from `spec.md` when adding features.

@docs/spec.md

## Safety: Deployment and Production Data

Production deployments and remote DB migrations run exclusively via GitHub Actions.
The npm scripts `deploy` and `db:migrate:remote` are **intentionally not defined** in
`package.json` to prevent accidental local execution.

**Never run the following from a local machine:**

- `wrangler deploy` — production deployments run via manual dispatch of `deploy.yml` on `main` (any other branch deploys Preview)
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
| Preview | Deployed via manual dispatch of `deploy.yml` (non-`main` branch) — auto-deploy on push is currently disabled pending production readiness |
| Production | Deployed via manual dispatch of `deploy.yml` (`main` branch) — auto-deploy on push is currently disabled pending production readiness |

KV / D1 bindings are isolated per environment. LINE Login callback URLs must be configured per environment.

## Database (Cloudflare D1 + Drizzle)

See `.claude/rules/api.md` for schema, access, and migration-command conventions (loads automatically when editing `server/`, `worker/`, or `drizzle/`). Use the `/db-migrate` skill for the guided schema-change workflow.

## Code Structure

One concern per file; split new code when a file exceeds ~300 lines. Don't split
existing files unless asked.

## Subagents

Investigation, review, and verification run through dedicated read-only/test-only
subagents. The main conversation always writes the code itself, at every tier below and
across every turn of a `/goal` run — see the rationale at the end of this section.

- **Trivial** (typo, one-line config tweak): implement directly, no agents.
- **Non-trivial but contained** (a self-contained change in one area): implement
  directly. Optionally run the built-in `Explore` agent first to confirm an existing
  convention, or `researcher` when the change leans on Kobalte, drizzle-orm, or the LINE
  Login API. Afterward, run `reviewer` and `tester` in parallel automatically, without
  asking first — both are read-only/test-only, so the cost is low and they exist
  specifically to catch blind spots in reviewing your own work. If the change touches
  LINE auth, sessions, invite tokens, or admin routes, also run `security-reviewer`
  alongside them.
- **Large, ambiguous, or substantially touching a risk area** (LINE auth/session/invite
  flow, or the bulletin section type system and its three dispatchers — see
  `.claude/rules/bulletin.md`): propose that the user drive it with the built-in `/goal`
  command, with a completion condition that explicitly requires `reviewer` and `tester`
  (and `security-reviewer` where relevant) to pass — e.g. "implement X; done when
  reviewer and tester report no issues," not just "implement X." Once set, each turn:
  research (`Explore` + `researcher` in parallel) → implement here → `reviewer` +
  `tester` (+ `security-reviewer` if applicable) in parallel, repeating until the
  evaluator confirms the condition holds.

No write agent exists at any tier: implementation is exactly the kind of work — multiple
phases sharing significant context (planning, implementation, testing) with iterative
refinement — that belongs in the main conversation. A write agent would also need nearly
every tool, hand back a working tree rather than a useful summary, and forget its own
code between fix passes.

**Visual-verification gate** (a separate axis from the tiers above, keyed to whether the
change touches rendered UI, not to how risky the change is):

- No rendered surface touched: skip, no browser needed.
- A small, isolated, single-property tweak: a quick manual glance at the running app is
  enough.
- Layout that can vary by viewport, a change spanning multiple components sharing
  styles, or chasing a reported visual bug: run `inspector`. It needs no confirmation to
  run, but it isn't automatic for every UI change either — invoking it is a judgment
  call against these three cases, not a default step.

**Agents** (`.claude/agents/`):

| Agent | Role |
|---|---|
| `researcher` | Looks up external, non-codebase knowledge — Kobalte, drizzle-orm, and the LINE Login API — before implementation. Uses `WebSearch`/`WebFetch` against each library's own docs; no MCP server is configured for this agent (`.mcp.json` is intentionally not used project-wide). |
| `reviewer` | Reviews a pending diff for general correctness and adherence to `.claude/rules/*.md`. |
| `tester` | Runs `node_modules/.bin/vitest run` and `pnpm check`. |
| `security-reviewer` | Existing, narrower-scoped agent for LINE auth, sessions, invite tokens, and admin routes — kept alongside `reviewer` rather than merged into it. |
| `inspector` | Drives a disposable Playwright/Chromium instance to screenshot and check for layout overflow. |

## Claude Code Automation

Configs in `.claude/rules/`, agents in `.claude/agents/`, skills in `.claude/skills/`.
