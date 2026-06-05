# AGENTS.md

This file provides guidance to Claude Code when working with this repository.

> **Keep in sync**: `CLAUDE.md` and `AGENTS.md` must always have identical content. When editing this file, apply the same changes to `CLAUDE.md`.

## Project Overview

PWA for members (~30) of Nitonabbc Church. Solid.js + TypeScript, Vite build, pnpm.

- LINE authentication only, 2 roles (admin / member)
- Light theme + frost-white glassmorphism ("God's Glory" theme), mobile-first
- Japanese/English i18n
- External subdomain services embedded via iframe

## Language Policy

All files in this repository — including `CLAUDE.md`, `.claude/` configs, source code comments, commit messages, and dev console output — are written in **English**.

## Specification Documents

Specs live in `docs/`. Always read the relevant doc before implementing.
Add a new doc in `docs/` and link it from `spec.md` when adding features.

@docs/spec.md

## Environments

| Env | Description |
|-----|-------------|
| Local | `pnpm dev` starts Vite (HMR) + workerd together via `@cloudflare/vite-plugin`. Set `DEV_AUTH=true` in `.dev.vars` to skip LINE auth and auto-login as admin |
| Preview | Auto-deployed on non-`main` branch push |
| Production | Auto-deployed on `main` branch push |

KV / D1 bindings are isolated per environment. LINE Login callback URLs must be configured per environment.

## Commands

- `pnpm dev` — full-stack dev: Vite + workerd (http://localhost:5173)
- `pnpm build` — TypeScript + Vite production build
- `pnpm check` — Biome lint/format check
- `pnpm fix` — Biome lint/format auto-fix
- `pnpm test` — run tests (Vitest, `server/**/*.test.ts` only)
- `pnpm deploy` — deploy to Cloudflare Workers

## Architecture

- **Entry**: `index.html` → `src/index.tsx` → `src/App.tsx`
- **Routing**: `@solidjs/router`. Routes defined in `src/index.tsx`, layout in `src/App.tsx`
  - `/` → Dashboard, `/settings` → Settings, `/settings/admin` → Management (lazy)
  - Bottom tab bar (Church / Settings). Each tab remembers and restores its last URL (iOS UITabBarController equivalent)
- **Path alias**: `@/` → `./src` (configured in both `vite.config.ts` and `tsconfig.app.json`)
- **Auth context**: `useAuth()` from `src/store/AuthContext.tsx` — provides user info and `logout`
- **JSX**: Solid.js transform (`jsxImportSource: solid-js`)
- **PWA**: vite-plugin-pwa (generateSw mode, Workbox auto-generated)
- **Deploy**: Cloudflare Workers + static assets

See `.claude/rules/` for detailed conventions per area (UI, CSS, API, testing).

## Directory Structure

- `src/components/<Name>/` — component, CSS module, and `index.ts` re-export
- `src/pages/<Name>/` — page component (route-level screen), with `hooks/` for complex logic
- `src/api/<resource>.ts` — API fetch functions (pages do not write fetch logic inline)
- `src/store/` — Solid.js stores (`createResource`-based)
- `src/styles/` — global styles (`tokens.css`, `reset.css`, `shared.module.css`)
- `server/routes/` — Hono API routes (one file per resource)
- `server/middleware/` — shared middleware
- `server/db/schema.ts` — Drizzle schema (single source of truth)
- `server/db/types.ts` — shared bulletin section types
- `server/db/index.ts` — `createDb()` and `Db` type
- `server/types.ts` — `AppEnv`, `User`, `SessionData`, and other server-wide types
- `worker/index.ts` — Worker entry point (re-exports the Hono app)
- `drizzle/` — drizzle-kit generated migration SQL (committed)

## Database (Cloudflare D1 + Drizzle)

- Schema: `server/db/schema.ts` is the single source of truth
- Access DB via `c.get("db")` — never use `c.env.DB` directly in routes or middleware
- Migrations: `drizzle-kit generate` → `drizzle/` → `wrangler d1 migrations apply`
- Use `/db-migrate` skill for guided schema change workflow

## Code Quality

- **TDD**: write the test first (Red → Green → Refactor). See `.claude/rules/testing.md`
- **Simplicity**: write the simplest code that satisfies the requirement — no premature abstractions
- **Efficiency**: avoid redundant work; reuse existing utilities and patterns
- Biome default settings for lint/format (no custom config file)
- TypeScript strict mode; unused variables and parameters are errors
- Targets: ES2022 (app) / ES2023 (tooling)

## Claude Code Automation

Configs in `.claude/rules/`, agents in `.claude/agents/`, skills in `.claude/skills/`.

### Agents

| Agent | When to use |
|-------|-------------|
| `api-route` | Adding new Hono API routes or tests |
| `section-type` | Adding a new bulletin section type (all layers) |
| `ui-component` | Creating or styling Solid.js UI components |
| `security-reviewer` | Changing auth, sessions, invite links, or admin routes |

### Skills

| Skill | Purpose |
|-------|---------|
| `/spec-update` | Sync `docs/spec.md` and individual feature docs |
| `/refactor` | Fix code quality, convention, and duplication issues |
| `/db-migrate` | Guided workflow for D1 schema changes |

### Hooks

- **git pre-commit (lefthook)**: auto-runs `pnpm biome check --write` on staged files and re-stages fixes
