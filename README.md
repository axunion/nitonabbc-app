# nitonabbc-app

Member PWA for Nitonabbc Church (~30 members). LINE login only, two roles (admin / member), Japanese/English i18n.

- **Frontend**: Solid.js + TypeScript, Vite, @kobalte/core + CSS Modules
- **Backend**: Hono on Cloudflare Workers, D1 (database), KV (sessions)
- **Docs**: specifications live in [`docs/spec.md`](docs/spec.md); agent/contributor rules in [`CLAUDE.md`](CLAUDE.md)

## Setup

```bash
pnpm install
cp .dev.vars.example .dev.vars   # set DEV_AUTH=true to skip LINE auth locally
pnpm db:fresh                    # create local D1 schema + seed sample data
pnpm dev                         # Vite + workerd at http://localhost:5173
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (Vite HMR + workerd) |
| `pnpm build` | Type-check and build for production |
| `pnpm check` | Biome lint/format + TypeScript check |
| `pnpm test` | Run server tests (Vitest) |
| `pnpm db:generate` | Generate a Drizzle migration from `server/db/schema.ts` |
| `pnpm db:migrate:local` | Apply pending migrations to local D1 |
| `pnpm db:fresh` | Wipe local D1, re-apply migrations, seed sample data |

## Deployment

Production and Preview deployments run via GitHub Actions on push (`main` → Production, other branches → Preview). Never run `wrangler deploy` or remote D1 migrations locally — see the Safety section in `CLAUDE.md`.
