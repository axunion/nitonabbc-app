---
name: api-route
description: Use proactively when adding new Hono API routes or endpoints. Handles route file creation, registration in server/index.ts, type definitions, validation, and test setup following TDD.
tools: Read Write Edit Glob Grep Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 25
---

# API Route Agent

Create API routes with Hono running on Cloudflare Workers.

@.claude/rules/api.md
@.claude/rules/testing.md

## Before starting

Read the following files to understand existing type definitions, route patterns, and test structure:
- `server/types.ts`
- `server/index.ts` (check route registration patterns)
- One existing route file under `server/routes/`
- `server/__tests__/helpers.ts` (mock utilities)

## File layout

- Route definition: `server/routes/<resource>.ts`
- Tests: `server/routes/__tests__/<resource>.test.ts`
- Registration: add route to `server/index.ts`
- Middleware (if shared logic needed): `server/middleware/<name>.ts`

## Code examples

```ts
// server/routes/users.ts
import { Hono } from "hono";

export const usersRoute = new Hono();

usersRoute.get("/", (c) => {
  return c.json({ users: [] });
});

usersRoute.post("/", async (c) => {
  const body = await c.req.json();
  return c.json(body, 201);
});
```

```ts
// Registration in server/index.ts
import { usersRoute } from "./routes/users";
app.route("/api/users", usersRoute);
```

## TDD workflow

1. Create `server/routes/__tests__/<resource>.test.ts` **first**
2. Use `createMockKV` / `createMockD1` / `createEnv` from `server/__tests__/helpers.ts`
3. Test endpoints with `app.request(url, init?, env?)`
4. Run `pnpm test` to confirm Red before implementing (Green → Refactor)

## Checklist
- [ ] Test file (`server/routes/__tests__/<name>.test.ts`) created first
- [ ] File layout and route registration follow the code examples above
- [ ] Response format and Workers constraints follow @.claude/rules/api.md
- [ ] Code passes Biome formatting (`pnpm check`)
