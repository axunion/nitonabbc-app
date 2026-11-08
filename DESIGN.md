---
version: alpha
name: God's Glory
description: >-
  Member PWA of Nitonabbc Church. Mobile-first light theme with frosted warm
  white glassmorphism and a Deep Gold accent; the admin area uses a flat
  neutral PC theme with the same accent.
colors:
  gray-50: "#faf9f7"
  gray-100: "#f3f1ed"
  gray-200: "#e8e5df"
  gray-300: "#d4d0c8"
  gray-400: "#a8a29e"
  gray-500: "#78716c"
  gray-600: "#57534e"
  gray-700: "#44403c"
  gray-800: "#292524"
  gray-900: "#1c1917"
  primary-50: "rgba(166, 124, 26, 0.08)"
  primary-100: "rgba(166, 124, 26, 0.15)"
  primary-200: "rgba(166, 124, 26, 0.25)"
  primary-300: "#c9a84c"
  primary-400: "#b8923a"
  primary-500: "#a67c1a"
  primary-600: "#a67c1a"
  primary-700: "#8c6815"
  primary-800: "#725410"
  primary-900: "#58400c"
  destructive-50: "rgba(220, 53, 53, 0.08)"
  destructive-100: "rgba(220, 53, 53, 0.15)"
  destructive-500: "#dc3535"
  destructive-600: "#c53030"
  destructive-700: "#9b2c2c"
  success-50: "rgba(46, 160, 67, 0.08)"
  success-100: "rgba(46, 160, 67, 0.15)"
  success-500: "#2ea043"
  success-600: "#22863a"
  success-700: "#1a7f37"
  bg: "#f8f5f0"
  text: "{colors.gray-900}"
  text-muted: "{colors.gray-500}"
  border: "{colors.gray-200}"
  border-subtle: "rgba(0, 0, 0, 0.06)"
  primary: "{colors.primary-600}"
  destructive: "{colors.destructive-600}"
  success: "{colors.success-600}"
color-rgb:
  primary-rgb: "166, 124, 26"
typography:
  login-title:
    fontFamily: "{font.sans}"
    fontSize: "{text.xl}"
    fontWeight: 600
    letterSpacing: "{tracking.tight}"
  page-title:
    fontFamily: "{font.sans}"
    fontSize: "{text.xl}"
    fontWeight: 600
    letterSpacing: "{tracking.tight}"
  view-title:
    fontFamily: "{font.sans}"
    fontSize: "{text.lg}"
    fontWeight: 600
    letterSpacing: "{tracking.tight}"
  section-label:
    fontFamily: "{font.sans}"
    fontSize: "{text.sm}"
    fontWeight: 600
  header-title:
    fontFamily: "{font.sans}"
    fontSize: "{text.base}"
    fontWeight: 600
  widget-label:
    fontFamily: "{font.sans}"
    fontSize: "{text.base}"
    fontWeight: 600
  body:
    fontFamily: "{font.sans}"
    fontSize: "{text.base}"
    fontWeight: 400
    lineHeight: "{leading.normal}"
  field-label:
    fontFamily: "{font.sans}"
    fontSize: "{text.sm}"
    fontWeight: 500
  muted:
    fontFamily: "{font.sans}"
    fontSize: "{text.sm}"
    fontWeight: 400
  caption:
    fontFamily: "{font.sans}"
    fontSize: "{text.xs}"
    fontWeight: 400
    letterSpacing: "{tracking.wide}"
  sidebar-label:
    fontFamily: "{font.sans}"
    fontSize: "{text.sm}"
    fontWeight: 500
text:
  2xs: 0.625rem
  xs: 0.75rem
  sm: 0.875rem
  base: 1rem
  lg: 1.25rem
  xl: 1.5rem
leading:
  tight: 1.25
  normal: 1.5
  relaxed: 1.75
font:
  sans: '"Inter", system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif'
  mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace'
  normal: 400
  medium: 500
  semibold: 600
  bold: 700
tracking:
  tight: -0.01em
  normal: 0
  wide: 0.01em
rounded:
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  "1": 0.25rem
  "2": 0.5rem
  "3": 0.75rem
  "4": 1rem
  "6": 1.5rem
  "8": 2rem
  "10": 2.5rem
  "12": 3rem
  "16": 4rem
shadow:
  sm: "0 1px 3px rgba(166, 124, 26, 0.06)"
  md: "0 4px 8px -1px rgba(166, 124, 26, 0.08), 0 2px 4px -2px rgba(166, 124, 26, 0.04)"
  lg: "0 10px 20px -3px rgba(166, 124, 26, 0.1), 0 4px 6px -4px rgba(166, 124, 26, 0.05)"
glass:
  bg: "rgba(255, 253, 248, 0.6)"
  bg-hover: "rgba(255, 253, 248, 0.75)"
  bg-active: "rgba(255, 253, 248, 0.5)"
  bg-chrome: "rgba(255, 253, 248, 0.82)"
  border: "1px solid rgba(0, 0, 0, 0.08)"
  border-hover: "1px solid rgba(0, 0, 0, 0.14)"
  blur: "blur(20px)"
  saturate: "saturate(1.5)"
  shadow-sm: "inset 0 1px 0 0 rgba(255, 255, 255, 0.5), inset 1px 0 0 0 rgba(255, 255, 255, 0.25), 0 1px 3px rgba(166, 124, 26, 0.06)"
  shadow-md: "inset 0 1px 0 0 rgba(255, 255, 255, 0.5), inset 1px 0 0 0 rgba(255, 255, 255, 0.25), 0 4px 8px -1px rgba(166, 124, 26, 0.08), 0 2px 4px -2px rgba(166, 124, 26, 0.04)"
  shadow-lg: "inset 0 1px 0 0 rgba(255, 255, 255, 0.5), inset 1px 0 0 0 rgba(255, 255, 255, 0.25), 0 10px 20px -3px rgba(166, 124, 26, 0.1), 0 4px 6px -4px rgba(166, 124, 26, 0.05)"
input:
  bg: "rgba(255, 253, 248, 0.35)"
  border: "rgba(0, 0, 0, 0.15)"
  border-focus: "{colors.primary}"
mesh:
  gradient: "radial-gradient(ellipse at 20% 30%, rgba(218, 185, 107, 0.35), transparent 55%), radial-gradient(ellipse at 80% 15%, rgba(255, 190, 130, 0.25), transparent 50%), radial-gradient(ellipse at 60% 70%, rgba(200, 170, 120, 0.2), transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(180, 160, 140, 0.15), transparent 45%), radial-gradient(ellipse at 90% 90%, rgba(220, 200, 160, 0.18), transparent 50%), #f8f5f0"
focus:
  ring-color: "rgba(166, 124, 26, 0.5)"
  ring-offset: 2px
  ring: "0 0 0 var(--focus-ring-offset) var(--color-bg), 0 0 0 calc(var(--focus-ring-offset) + 2px) var(--focus-ring-color)"
duration:
  fast: 100ms
  normal: 200ms
  slow: 300ms
  x-slow: 400ms
ease:
  default: "cubic-bezier(0.4, 0, 0.2, 1)"
  in: "cubic-bezier(0.4, 0, 1, 1)"
  out: "cubic-bezier(0, 0, 0.2, 1)"
  ios-push: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
z:
  dropdown: 50
  sticky: 100
  overlay: 200
  modal: 300
  popover: 400
  toast: 500
layout:
  app-max-width: 448px
  content-width: 448px
  sidebar-width: 240px
desktop:
  content-width: 820px
icon:
  chevron-down: |-
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")
admin:
  background: "#fafafa"
  background-translucent: "rgba(250, 250, 250, 0.82)"
  foreground: "#18181b"
  card: "#ffffff"
  card-foreground: "#18181b"
  primary: "#a67c1a"
  primary-hover: "#8c6815"
  primary-foreground: "#ffffff"
  primary-soft: "rgba(166, 124, 26, 0.1)"
  primary-soft-foreground: "#8c6815"
  muted: "#f4f4f5"
  muted-foreground: "#71717a"
  accent: "#f4f4f5"
  accent-foreground: "#18181b"
  destructive: "#dc3535"
  destructive-hover: "#c53030"
  destructive-soft: "rgba(220, 53, 53, 0.08)"
  success: "#22863a"
  success-soft: "rgba(46, 160, 67, 0.12)"
  border: "#e4e4e7"
  input: "#d4d4d8"
  ring: "rgba(166, 124, 26, 0.45)"
  focus-ring: "0 0 0 2px var(--admin-background), 0 0 0 4px var(--admin-ring)"
  radius: 0.5rem
  shadow-sm: "0 1px 2px rgba(0, 0, 0, 0.05)"
  shadow-md: "0 1px 3px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04)"
  shadow-lg: "0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05)"
  icon-chevron-down: |-
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")
  content-max: 1100px
---

# God's Glory

## How this file relates to the code

The YAML front matter is a mirror of the CSS custom properties in
`src/styles/tokens.css` (member theme) and `src/styles/admin-tokens.css`
(admin theme). `src/styles/__tests__/designTokens.test.ts` fails whenever the
two diverge, and also runs the official DESIGN.md linter. Change a token in
both places in the same commit.

Each YAML group maps to a CSS prefix: `colors` → `--color-*`, `rounded` →
`--radius-*`, `spacing` → `--space-*`, `color-rgb` → `--color-*`, `layout` →
no prefix, and every other group (`text`, `font`, `glass`, `admin`, ...) →
`--<group>-*`. A value that is
exactly `{group.key}` corresponds to `var(--...)` in CSS. `desktop` holds the
overrides inside `@media (min-width: 900px)`. `typography` has no CSS
counterpart: it names the usage combinations of the primitive tokens.

Components consume tokens through CSS Modules; never hardcode a value that a
token covers.

## Overview

A PWA used by about 30 church members, mostly installed to the home screen of a
smartphone. Apple's iOS Human Interface Guidelines are the primary reference,
with iOS Liquid Glass as the reference for navigation chrome.

- **Member area** ("God's Glory"): light theme, frosted warm white glass over a
  warm mesh gradient, Deep Gold accent. Calm, bright, reverent.
- **Admin area** (`/admin/*`): flat neutral PC theme (shadcn/ui-like, no
  library), opaque white surfaces with thin borders and the same Deep Gold
  accent. Optimized for desktop work, not atmosphere.
- Mobile first. The member desktop breakpoint is `900px` (a literal in media
  queries, since custom properties cannot be used in media conditions).

## Colors

- **Background**: warm off-white `bg` under `mesh.gradient` (gold, peach and
  ivory light, applied to `body` with `background-attachment: fixed`).
- **Accent**: Deep Gold `primary` (`primary-600`, `#a67c1a`). Use `primary-700`
  for small text that needs extra contrast. `primary-50/100/200` are
  translucent tints for selected or soft backgrounds (tab indicator, icon
  wrappers). `color-rgb.primary-rgb` exists for `rgba(var(--color-primary-rgb), a)`.
- **Text**: warm stone palette. `text` (`gray-900`) for body, `text-muted`
  (`gray-500`) for secondary text.
- **Semantic**: `destructive` (warm red) and `success` (warm green), each with
  translucent `-50/-100` tints for message backgrounds.
- **Lines**: `border` for general borders, `border-subtle` for hairlines
  between repeated items inside one card.
- **Admin**: zinc neutrals (`admin.background`, `admin.card`,
  `admin.foreground`, `admin.muted-foreground`, `admin.border`) with
  `admin.primary` as the same Deep Gold.

## Typography

- **Family**: `font.sans` — Inter (Google Fonts, weights 400/500/600) for Latin
  and digits, falling back to Hiragino Sans / Noto Sans JP for Japanese.
- **Scale**: `text.2xs` (10px) → `text.xl` (24px). Use `tracking.tight` on
  `lg`/`xl` titles and `tracking.wide` on `xs`/`2xs` Latin text.
- Usage styles are defined in `typography`: page titles (`page-title`, the
  `.pageTitle` shared class), the login title and the `ConfirmDialog` title
  use `xl`; view titles (bulletin view, Management dialogs) use `lg`; header
  titles and widget labels use semibold `base`; bulletin section labels use
  semibold `sm`; field labels and desktop sidebar labels use medium `sm`;
  captions use `xs`. `text.2xs` is currently unused.

## Layout

- **Grid**: 8pt grid. `space-*` tokens are on a 4px base; prefer even steps.
  `space-4` (16px) is the base unit: screen side margin `space-4`, grid gap
  `space-3`, section spacing `space-6`.
- **Width**: below 900px the whole member layout is capped at
  `layout.app-max-width` (448px) and centered (`MemberLayout`). Content
  columns use `max-width: var(--content-width)` + `margin: auto` (448px, or
  the `desktop` override 820px at ≥900px, where the layout is uncapped).
- **Page container**: every member page composes `.pageContainer` from
  `src/styles/shared.module.css` (16px padding, centered column, fadeIn:
  `translateY(8px)` → 0 over `duration.normal` with `ease.out`).
- **Navigation**:
  - *Mobile (<900px)*: a floating pill tab bar,
    `bottom: calc(env(safe-area-inset-bottom) + 12px)`, centered,
    `width: min(calc(100vw - 48px), 140px)`, icons only (20px), 44px tall tabs,
    a sliding `primary-100` indicator behind the active tab. Shown only on tab
    root pages (`/`, `/settings`), hidden on child pages.
  - *Desktop (≥900px)*: the same component becomes a left sidebar of
    `layout.sidebar-width` with brand block, labeled rows (44px, `text.sm`
    medium) and an admin shortcut in the footer for admins. Always visible.
  - Each tab remembers its last URL and restores it; re-tapping the active tab
    returns to its root.
- **Header**: each page places its own `<Header>` (sticky, min-height 52px).
  Transparent until its scroll container is scrolled, then `glass.bg-chrome`
  + blur + a bottom `glass.border`. It listens to the nearest
  `[data-scroll-container]` ancestor (MemberLayout's `.main`), falling back
  to `window`; a new layout must set that attribute on its scrolling element. Tab roots show a centered title; child pages add a
  back button on the left that navigates to the parent route (not browser
  history). Put page actions inside the page container rather than in the
  header's `rightAction`.
- **Dashboard**: 2-column grid of widget cards (`gap: space-3`). The bulletin
  widget spans 2 columns; others span 1.
- **Admin**: left-aligned full-width content capped at `admin.content-max`,
  with a toolbar (title left, primary action right) at the top of each page.
- **Touch targets**: at least 44×44pt; extend small controls with padding.

## Elevation & Depth

Depth comes from translucency and blur, with warm gold-tinted shadows.

- **Glass surface**: `glass.bg` + `backdrop-filter: glass.blur glass.saturate`
  (always with the `-webkit-` prefix) + `glass.border`. Hover: `glass.bg-hover`
  + `glass.border-hover`. Active: `glass.bg-active`. Chrome (tab bar, scrolled
  header): `glass.bg-chrome`.
- **Shadows**: `shadow.sm/md/lg` are plain warm gold drop shadows.
  `glass.shadow-sm/md/lg` add inset white highlights and are used on glass
  elements: `md` for cards, dashboard widgets and the mobile tab bar, `sm` for
  the back button.
- **Inputs**: `input.bg` + 1px `input.border`, `input.border-focus` on focus.
- **Focus**: `focus.ring` (member) / `admin.focus-ring` (admin) as
  `box-shadow` on `:focus-visible`.
- **Stacking**: use the `z.*` scale only.
- **Admin**: no glass, no `backdrop-filter`, no mesh gradient. Opaque surfaces
  with `admin.shadow-sm/md/lg`.

## Shapes

- Cards and widgets: `rounded.xl`. Inputs and desktop sidebar rows:
  `rounded.md`. Pills, circular buttons and the mobile tab bar:
  `rounded.full`. Admin surfaces: `admin.radius`.

## Components

- **Glass card** (`.glassCard` in `shared.module.css`): glass surface,
  `rounded.xl`, `glass.shadow-md`.
- **Back button**: iOS Liquid Glass style 36px circle; glass surface,
  `rounded.full`, `colors.primary` icon (`ChevronLeft`, 24px, stroke 1.5),
  `glass.shadow-sm`; hover `glass.bg-hover`, active `scale(0.95)`.
- **Tab bar**: see Layout → Navigation. Inactive `gray-400`, hover `gray-600`,
  active `colors.primary`.
- **Dashboard widget**: glass card with `glass.shadow-md`, centered 24px icon
  in a 48px `primary-50` circle above a `widget-label`. External-service
  widgets that open a new tab on desktop show a 12px `PictureInPicture2` badge
  next to the label.
- **Form input** (`.formInput`): 44px tall, `rounded.md`, input tokens,
  `text.base`.
- **Dialogs**: `ConfirmDialog` uses the admin flat theme
  (`admin.module.css` `.dialogOverlay` / `.dialogContent`) on member and admin
  pages alike.
- **Icons**: lucide-solid, `stroke-width={1.5}`, color from `currentColor`.
  Sizes: dashboard widget 24px, tab bar and menus 20px, external-link badge
  12px. No background box, except the dashboard widget's circular wrapper.
- **Favicon / PWA icons**: gold-gradient cross on a beige-gradient rounded
  square. `favicon.svg` for browser tabs, `pwa-192x192.png` /
  `pwa-512x512.png` generated from it for the home screen.
- **Admin shared patterns** (`src/styles/admin.module.css`, via `composes:`):
  `.pageContainer`, `.toolbar`, `.card`, `.input`, `.buttonPrimary`,
  `.buttonOutline`, `.dialogContent`, `.messageSuccess`, `.messageError`,
  `.dialogActions`. Member list is a `<table>` with `admin.accent` row hover.

## Do's and Don'ts

- Do use tokens for every color, size, radius, shadow, duration and z-index.
- Do compose shared classes from `shared.module.css` (member) or
  `admin.module.css` (admin) instead of duplicating them.
- Do apply the fadeIn animation to page containers.
- Don't use `--glass-*`, `backdrop-filter` or the mesh gradient in admin CSS,
  and don't compose `shared.module.css` from admin pages.
- Don't show empty-state text such as "No items found"; show only the
  add/create action.
- Don't add background boxes behind icons.
