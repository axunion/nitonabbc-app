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
  large-title:
    fontFamily: "{font.sans}"
    fontSize: "{type.large-title}"
    fontWeight: 700
    lineHeight: "{leading.tight}"
  title1:
    fontFamily: "{font.sans}"
    fontSize: "{type.title1}"
    fontWeight: 700
    lineHeight: "{leading.tight}"
  title2:
    fontFamily: "{font.sans}"
    fontSize: "{type.title2}"
    fontWeight: 700
    letterSpacing: "{tracking.tight}"
  title3:
    fontFamily: "{font.sans}"
    fontSize: "{type.title3}"
    fontWeight: 600
  headline:
    fontFamily: "{font.sans}"
    fontSize: "{type.headline}"
    fontWeight: 600
  body:
    fontFamily: "{font.sans}"
    fontSize: "{type.body}"
    fontWeight: 400
    lineHeight: "{leading.normal}"
  subhead:
    fontFamily: "{font.sans}"
    fontSize: "{type.subhead}"
    fontWeight: 500
  footnote:
    fontFamily: "{font.sans}"
    fontSize: "{type.footnote}"
    fontWeight: 400
  tab-label:
    fontFamily: "{font.sans}"
    fontSize: "{type.caption2}"
    fontWeight: 500
    letterSpacing: "{tracking.wide}"
leading:
  tight: 1.25
  normal: 1.5
  relaxed: 1.75
font:
  sans: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif'
  mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace'
  normal: 400
  medium: 500
  semibold: 600
  bold: 700
type:
  large-title: 2.125rem
  title1: 1.75rem
  title2: 1.375rem
  title3: 1.25rem
  headline: 1.0625rem
  body: 1.0625rem
  subhead: 0.9375rem
  footnote: 0.8125rem
  caption1: 0.75rem
  caption2: 0.6875rem
tracking:
  tight: -0.01em
  normal: 0
  wide: 0.01em
rounded:
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
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
  sidebar-inset: 8px
  sidebar-radius: 18px
  sidebar-row-height: 28px
  row-icon-size: 16px
  margin: 16px
  control-height: 44px
  control-height-sm: 34px
  control-radius: 9999px
  field-radius: 12px
  row-height: 44px
  group-radius: 26px
  bar-height: 44px
  bar-button-size: 44px
  bar-icon-size: 24px
  tab-bar-height: 62px
  tab-bar-offset: "max(var(--space-4), calc(env(safe-area-inset-bottom, 0px) - 8px))"
desktop:
  content-width: 820px
  type-large-title: 1.625rem
  type-title1: 1.375rem
  type-title2: 1.0625rem
  type-title3: 0.9375rem
  type-headline: 0.8125rem
  type-body: 0.8125rem
  type-subhead: 0.6875rem
  type-footnote: 0.625rem
  type-caption1: 0.625rem
  type-caption2: 0.625rem
  margin: 20px
  control-height: 28px
  control-height-sm: 22px
  control-radius: 8px
  field-radius: 8px
  row-height: 36px
  group-radius: 12px
  bar-height: 52px
  bar-button-size: 28px
  bar-icon-size: 18px
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
no prefix, and every other group (`type`, `font`, `glass`, `admin`, ...) →
`--<group>-*`. A value that is exactly `{group.key}` corresponds to
`var(--...)` in CSS. `desktop` holds the overrides inside
`@media (min-width: 900px)`: the macOS values of the platform tokens. `typography` has no CSS
counterpart: it names the usage combinations of the primitive tokens.

Components consume tokens through CSS Modules; never hardcode a value that a
token covers.

## Overview

A PWA used by about 30 church members, mostly installed to the home screen of a
smartphone. The app follows Apple's Human Interface Guidelines and looks
native on two platforms, split at a single breakpoint:

- **Below 900px: iOS 27.** Navigation bars with large titles, a floating
  Liquid Glass tab bar, inset grouped content, 44pt controls, Dynamic Type
  "Large" text sizes.
- **900px and up: macOS 27.** A floating inset sidebar (source list), a
  unified toolbar, 28pt controls, the macOS text styles (13pt body).

This applies to every page, member and admin alike. The breakpoint is a
literal `900px` in media queries (custom properties cannot be used in media
conditions). Platform differences live in tokens wherever possible: the
`:root` value is the iOS metric and the `desktop` override is the macOS
metric, so a component written with `--type-*`, `--control-*`,
`--group-radius`, `--margin` and friends adapts without its own media query.

Two palettes sit on top of the same metrics:

- **Member area** ("God's Glory"): frosted warm white glass over a warm mesh
  gradient, Deep Gold accent. Calm, bright, reverent.
- **Admin area** (`/admin/*`): flat neutral zinc surfaces with the same Deep
  Gold accent, for focused data entry.

**Sources.** Text styles, the 44pt minimum hit target, the capsule tab bar,
the circular chevron-only back button, glass only on the navigation layer and
the macOS control shapes are documented in the HIG and WWDC25 sessions. Apple
publishes almost no geometry, so tab bar height (62), grouped radius (26 iOS /
12 macOS), sidebar inset (8) and radius (18), sidebar row height (28), toolbar
height (52) and control heights (44 / 28) are approximations of the native
look. Retune them against real devices rather than treating them as spec.

## Colors

Colors are platform independent.

- **Background**: warm off-white `bg` under `mesh.gradient` (gold, peach and
  ivory light, applied to `body` with `background-attachment: fixed`).
- **Accent**: Deep Gold `primary` (`primary-600`, `#a67c1a`). Use `primary-700`
  for small text that needs extra contrast. `primary-50/100/200` are
  translucent tints for selected or soft backgrounds (tab lozenge, sidebar
  selection, icon wrappers). `color-rgb.primary-rgb` exists for
  `rgba(var(--color-primary-rgb), a)`.
- **Text**: warm stone palette. `text` (`gray-900`) for body, `text-muted`
  (`gray-500`) for secondary text.
- **Semantic**: `destructive` (warm red) and `success` (warm green), each with
  translucent `-50/-100` tints for message backgrounds.
- **Lines**: `border` for general borders, `border-subtle` for hairlines
  between repeated items inside one group.
- **Admin**: zinc neutrals (`admin.background`, `admin.card`,
  `admin.foreground`, `admin.muted-foreground`, `admin.border`) with
  `admin.primary` as the same Deep Gold.

## Typography

- **Family**: `font.sans` — San Francisco via `-apple-system` /
  `BlinkMacSystemFont` on Apple devices (the native look), Inter elsewhere,
  falling back to Hiragino Sans / Noto Sans JP for Japanese.
- **Scale**: the `type.*` tokens are the HIG text styles. iOS uses Dynamic
  Type "Large" (Large Title 34, Title 1 28, Title 2 22, Title 3 20, Headline
  and Body 17, Subhead 15, Footnote 13, Caption 12/11); macOS overrides them
  with its fixed styles (Large Title 26, Title 1 22, Title 2 17, Title 3 15,
  Headline and Body 13, Subheadline 11, Footnote and Captions 10). Callout is
  left out until something needs it.
- **Roles** (`typography`):
  - `large-title` — iOS large titles of tab roots (`Header`) and admin page
    titles.
  - `title1` — the login title. `title2` — the bulletin view title.
  - `title3` — the macOS toolbar title (`Header` at ≥900px).
  - `headline` — navigation bar titles, widget labels, list item titles,
    alert titles.
  - `body` — reading text, controls, inputs, list rows, sidebar rows. Inputs
    stay at Body so iOS Safari never zooms on focus (needs ≥16px).
  - `subhead` — field labels, secondary text, section headers.
  - `footnote` — captions, badges, table headers, toast and alert messages.
  - `tab-label` — iOS tab bar labels (Caption 2).
- Use `tracking.tight` on titles and `tracking.wide` on small Latin captions.

## Layout

- **Margins**: `margin` is the screen / window content margin (16 iOS, 20
  macOS). `space-*` tokens are a 4px base; prefer even steps.
- **Member layout**: below 900px the app is capped at `layout.app-max-width`
  (448px) and centered (`MemberLayout`). Content columns use
  `max-width: var(--content-width)` + `margin: auto` (448px, or the `desktop`
  override 820px at ≥900px, where the layout is uncapped).
- **Page container**: every member page composes `.pageContainer` from
  `src/styles/shared.module.css` (`margin` sides, fadeIn: `translateY(8px)` → 0
  over `duration.normal` with `ease.out`). Admin pages compose the
  left-aligned `.pageContainer` of `admin.module.css`, capped at
  `admin.content-max`.
- **iOS navigation (<900px)**:
  - *Navigation bar* (`Header`, sticky, `bar-height` 44): transparent until
    its scroll container scrolls, then `glass.bg-chrome` layered twice
    (nearly opaque, like iOS 27 bars) + blur + a bottom
    `glass.border`. Child pages show a circular glass back button
    (`bar-button-size` 44, chevron only) and a centered `headline` title. Tab
    roots show a left-aligned `large-title` below the bar; the centered bar
    title fades in only once the large title has scrolled under the bar
    (measured on scroll). `Header` listens to the nearest
    `[data-scroll-container]` ancestor (MemberLayout's `.main`), falling back
    to `window`; a new layout must set that attribute on its scrolling element.
    Back navigates to the parent route, not browser history.
  - *Tab bar* (`TabBar`): a floating Liquid Glass capsule
    (`tab-bar-height` 62, `glass.shadow-lg`), centered, hugging its two tabs,
    `bottom: tab-bar-offset` (16px, or the safe area − 8px when larger). Each tab shows a 24px icon over a
    `tab-label`; the selected tab gets a `primary-100` capsule lozenge that
    slides between tabs and the accent color. Shown only on tab roots (`/`,
    `/settings`). `MemberLayout` pads `.main` by the bar height, offset and a
    gap.
  - *Admin* (`AdminLayout`): a navigation bar with a circular back button
    (to `/`) and a segmented control (`admin.muted` capsule track,
    `admin.primary-soft` selected segment) switching between the admin pages,
    followed by a compact row with the church name and the signed-in user.
- **macOS navigation (≥900px)**:
  - *Sidebar*: member `TabBar` and admin `AdminLayout` both become a floating
    inset source list: `layout.sidebar-width`, `sidebar-inset` from the
    window edges, `sidebar-radius` corners, 16px accent icons, `body` rows of
    `sidebar-row-height` with a rounded (`radius.lg`) selection highlight
    (`primary-50` with accent text for members, `admin.primary-soft` with
    `admin.primary` text for admins). The app name tops the
    list; the footer holds the admin shortcut (members) or Back (admin).
    Member sidebar is glass; admin sidebar is an opaque `admin.card`.
  - *Toolbar*: `Header` and the admin header are unified toolbars of
    `bar-height` 52 with a leading `title3` title; the back button becomes a
    28px circular glass toolbar button. No visible large title: the `h1`
    stays in the accessibility tree (visually hidden) because the toolbar
    title is `aria-hidden` on tab roots.
  - The bulletin views add a sticky table of contents column on the left of
    the content, styled like sidebar rows.
- **Dashboard**: 2-column grid of widget cards (`gap: space-3`). The bulletin
  widget spans 2 columns; others span 1.
- **Touch targets**: primary controls are `control-height` (44 on iOS, the
  HIG minimum hit target). `control-height-sm` (34 on iOS, the HIG small /
  medium button size) is only for secondary in-content buttons that sit next
  to larger targets (row actions, add/remove, install); don't use it for a
  page's main action.

## Elevation & Depth

Depth comes from translucency and blur, with warm gold-tinted shadows. Glass
belongs to the navigation layer (bars, sidebar, buttons in bars) and to
content groups that sit on the mesh gradient.

- **Glass surface**: `glass.bg` + `backdrop-filter: glass.blur glass.saturate`
  (always with the `-webkit-` prefix) + `glass.border`. Hover: `glass.bg-hover`
  + `glass.border-hover`. Active: `glass.bg-active`.
- **Chrome**: floating chrome (the iOS tab bar, the macOS sidebar) uses
  `glass.bg-chrome` once, so content shows through like Liquid Glass. Edge
  bars that content scrolls under (`.scrolledHeader`: scrolled navigation
  bars and toolbars, the iframe viewer header) layer `glass.bg-chrome` twice
  for a nearly opaque bar, so text behind them never collides with the
  title.
- **Shadows**: `shadow.sm/md/lg` are plain warm gold drop shadows.
  `glass.shadow-sm/md/lg` add inset white highlights and are used on glass:
  `lg` for the floating tab bar, `md` for groups, widgets and the sidebar,
  `sm` for the back button and small groups.
- **Inputs**: `input.bg` + 1px `input.border`, `input.border-focus` on focus.
- **Focus**: `focus.ring` (member) / `admin.focus-ring` (admin) as
  `box-shadow` on `:focus-visible`.
- **Stacking**: use the `z.*` scale only.
- **Admin**: no glass, no `backdrop-filter`, no mesh gradient. Opaque surfaces
  with `admin.shadow-sm/md/lg`.

## Shapes

Corners follow the platform and stay concentric (inner radius = outer radius
minus padding where shapes nest).

- **Groups and cards**: `group-radius` (26 iOS inset grouped / 12 macOS).
- **Controls**: `control-radius` — capsules on iOS, 8px rounded rectangles on
  macOS. Text fields and selects: `field-radius` (12 / 8).
- **Bars**: the iOS tab bar, segmented control and circular buttons use
  `radius.full`; the macOS sidebar uses `sidebar-radius`, its rows `radius.lg`.

## Components

- **Glass group** (`.glassCard` in `shared.module.css`): glass surface,
  `group-radius`, `glass.shadow-md`.
- **Back button**: circular glass button of `bar-button-size`,
  `colors.primary` chevron (24px iOS / 18px macOS), `glass.shadow-sm`; hover
  `glass.bg-hover`, active `scale(0.95)`.
- **Buttons** (`.pairedSubmit` / `.pairedCancel`, admin `.buttonPrimary` /
  `.buttonOutline`): `control-height`, `control-radius`, `body` labels; the
  prominent (filled accent) button uses semibold. Compact in-content buttons
  use `control-height-sm` (34 / 22).
- **Form input** (`.formInput`, admin `.input`): `control-height`,
  `field-radius`, `body` text.
- **Switch**: iOS 51×31 with a 27px thumb; macOS 38×22.
- **Template item rows** (bulletin template editor): on iOS the input-type
  select sits under the label and the ↑↓ reorder buttons fill both lines in
  a `control-height-sm` wide column (34×48); the remove button is a
  `control-height` square (44). macOS keeps a single line, where the same
  tokens give 22px reorder and 28px remove columns.
- **List rows**: at least `row-height` (44 iOS / 36 macOS), `space-4` side
  padding, `border-subtle` hairlines between rows of one group.
- **Dashboard widget**: glass group with `glass.shadow-md`, centered 24px
  icon in a 48px `primary-50` circle above a `headline` label.
  External-service widgets that open a new tab on desktop show a 12px
  `PictureInPicture2` badge in `gray-400` next to the label.
- **Alert** (`ConfirmDialog`): a 300px centered alert on admin surfaces with
  `group-radius`: `headline` title, `footnote` message, equal-width buttons
  side by side. Used on member and admin pages alike.
- **Toast**: admin surfaces with `group-radius`; an iOS banner that drops in
  at the top center below 900px, a top-right notification that slides in from
  the right at ≥900px.
- **Icons**: lucide-solid, `stroke-width={1.5}`, color from `currentColor`.
  The components size them per platform in CSS: tab bar 24px, macOS sidebar
  and list rows `row-icon-size` (16px), back button `bar-icon-size` (24 / 18px), dashboard widget 24px, external-link badge 12px. No
  background box, except the dashboard widget's circular wrapper.
- **Favicon / PWA icons**: gold-gradient cross on a beige-gradient rounded
  square. `favicon.svg` for browser tabs, `pwa-192x192.png` /
  `pwa-512x512.png` generated from it for the home screen.
- **Admin shared patterns** (`src/styles/admin.module.css`, via `composes:`):
  `.pageContainer`, `.pageTitle`, `.toolbar`, `.card`, `.input`, `.select`,
  `.buttonPrimary`, `.buttonOutline`, `.dialogContent`, `.messageSuccess`,
  `.messageError`, `.dialogActions`. The member list is a `<table>` with
  `admin.accent` row hover, collapsing to one row group per member below
  640px.

## Do's and Don'ts

- Do use tokens for every color, size, radius, shadow, duration and z-index,
  and prefer the platform tokens (`type-*`, `control-*`, `group-radius`,
  `margin`, ...) so iOS and macOS sizes follow automatically.
- Do write a `@media (min-width: 900px)` block only for structural macOS
  differences (sidebar instead of tab bar, toolbar title placement), not for
  sizes a token already switches.
- Do compose shared classes from `shared.module.css` (member) or
  `admin.module.css` (admin) instead of duplicating them.
- Do apply the fadeIn animation to page containers.
- Don't use `--glass-*`, `backdrop-filter` or the mesh gradient in admin CSS,
  and don't compose `shared.module.css` from admin pages.
- Don't show empty-state text such as "No items found"; show only the
  add/create action.
- Don't add background boxes behind icons.
