---
name: refactor
description: >
  Analyze and fix code quality, convention, and pattern issues across the project or a specified scope.
  Use for requests like "clean up the code", "fix duplicates", "improve quality", or "refactor".
allowed-tools: Bash Read Edit Write Glob Grep
---

Target `src/`, `server/`, and `worker/` when called without arguments; target only the specified directory or file when an argument is provided.

## 1. Determine scope

- No argument → analyze all files under `src/`, `server/`, `worker/`
- Argument provided → target the specified path only

## 2. Review checklist

See the following rules for conventions:

@.claude/rules/frontend.md
@.claude/rules/api.md
@.claude/rules/testing.md

### Duplication & dead code (refactor-specific)
- Is there duplicated logic that should be extracted into a shared helper?
- Are there unused functions, components, or exports?
- Does `src/` or `server/` already have a utility that serves the same purpose?

### TypeScript
- No `any` — use proper types or `unknown` with type narrowing
- Remove unused imports, variables, and parameters
- Ensure compatibility with strict mode

## 3. Apply fixes

Do not just list issues — edit the files directly to fix them.

## 4. Verify

Run `pnpm check && node_modules/.bin/vitest run` to confirm lint and tests pass.

## 5. Report

Group changes by category:
- **Duplication & dead code**
- **Solid.js patterns**
- **Hono / Workers patterns**
- **TypeScript**
- **CSS Modules**
- **Tests**
