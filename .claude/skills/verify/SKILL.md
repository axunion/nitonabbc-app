---
name: verify
description: >
  Run lint, build, and tests together to verify code quality.
  Use after implementation or before committing: "does the build pass?", "check for errors", "run tests", "any lint errors?".
allowed-tools: Bash
---

Run lint (Biome), build (tsc + Vite), and tests (Vitest) in order and report the results.

1. Run `pnpm check`
   - If there are errors, try auto-fixing with `pnpm check:write`, then re-run `pnpm check`
2. Run `pnpm build`
3. Run `pnpm test`

Report concisely if everything passes. If something fails, show the error output and suggest a fix.
