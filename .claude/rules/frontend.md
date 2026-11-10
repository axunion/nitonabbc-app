---
paths:
  - "src/**"
---

# Frontend Rules

## UI library

- Use **@kobalte/core** headless UI primitives (no Tailwind)
- Import individually from `@kobalte/core/<component>`
- Pass CSS Modules classes via the `class` prop
- Define state styles with `data-*` attribute selectors:
  - `[data-disabled]`, `[data-pressed]`, `[data-hover]`, `[data-focus-visible]`, `[data-expanded]`, `[data-checked]`

## CSS Modules

- File extension: `.module.css`, placed in the same directory as the component
- Always use CSS variables from `src/styles/tokens.css` (no hardcoded values):
  - Colors: `var(--color-*)`, focus: `var(--focus-ring)`, typography: `var(--type-*)` (HIG text styles), `var(--font-*)`, `var(--tracking-*)`
  - Spacing: `var(--space-*)`, border-radius: `var(--radius-*)`, shadows: `var(--shadow-*)`
  - Transitions: `var(--duration-*)`, `var(--ease-*)`, z-index: `var(--z-*)`
  - Layout: `var(--app-max-width)` (member layout cap below 900px), `var(--content-width)` (content column width)
  - Platform metrics: `var(--margin)`, `var(--control-height)`, `var(--control-height-sm)`, `var(--control-radius)`, `var(--field-radius)`, `var(--row-height)`, `var(--group-radius)`, `var(--bar-height)`, `var(--bar-button-size)` — iOS values below 900px, macOS values at ≥900px
- Below 900px the UI follows iOS 27, at ≥900px macOS 27 (member and admin pages alike). Prefer the platform tokens over per-component media queries; use a `@media (min-width: 900px)` block only for structural differences
- Apply a fadeIn animation to page containers
- Define shared styles in `src/styles/shared.module.css` and apply them via `composes` in each page (e.g. `composes: pairedCancel from "../../styles/shared.module.css";`)

### Admin theme (`/admin` pages)

- Admin pages (AdminLayout, Management, BulletinTemplate) use the flat neutral admin palette on the same platform metrics: `--admin-*` tokens from `src/styles/admin-tokens.css` plus shared patterns in `src/styles/admin.module.css` (e.g. `composes: card from "../../styles/admin.module.css";`)
- Never use `--glass-*` tokens, `backdrop-filter`, or the mesh gradient in admin CSS — surfaces are opaque white with 1px `--admin-border` and `--admin-shadow-*`
- Never composes from `src/styles/shared.module.css` in admin pages — use the admin equivalents in `admin.module.css` instead: `.pageContainer` (left-aligned, `--admin-content-max`), `.toolbar`, `.messageSuccess`, `.messageError`, `.dialogActions`
- Typography, spacing, platform metrics, radius steps, durations and z-index are shared with `tokens.css`

## Icons

- Use **lucide-solid**. Standard `stroke-width={1.5}`.
- Size per platform in CSS (see DESIGN.md Components → Icons): 24px for dashboard widgets and the iOS tab bar, 16px for macOS sidebar rows

## Action buttons & empty states

- Avoid using the header `rightAction`; place action buttons inside the page container instead
- Do not show empty-state text ("No items found" etc.). Use only an add/create button.

## i18n

- Use `@solid-primitives/i18n`
- Locale files: `src/locales/{ja,en}.ts`
- Keys use flatCase (e.g. `bulletinTitle`)
- Never hardcode UI text — always render through `t()`

## Directory structure

- `src/api/<resource>.ts` — centralize API fetch functions here; pages do not write fetch logic inline
- `src/pages/<Page>/hooks/use<PageName>.ts` — extract complex page-specific logic into `hooks/` within the page directory; there is no global `src/hooks/`
- `src/styles/shared.module.css` — page-level containers use `composes: pageContainer` (do not write it inline)

## Design details

See @DESIGN.md for design tokens and UI design specifics. Its YAML front matter mirrors `src/styles/tokens.css` and `src/styles/admin-tokens.css`; change both in the same commit (`src/styles/__tests__/designTokens.test.ts` enforces it).
