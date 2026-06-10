# Admin Layout Redesign — Implementation Plan Brief

## Background

Currently, the user-facing app and admin pages share a single layout:
`App.tsx` renders `<TabBar>` globally, and admin pages (`/settings/members`, `/settings/bulletin-template`) live inside the same mobile-first shell.

As admin functionality grows, this becomes impractical. Admin work is done by 1–2 people on PC, while the rest of the 30-member congregation uses the app on mobile.

## Decision

**Same app, same domain, same auth — split layout by route prefix.**

- `/admin/*` → `AdminLayout` (PC-oriented sidebar, no TabBar)
- All other routes → current layout (mobile TabBar stays unchanged)

Auth requires no changes. LINE Login uses a standard browser OAuth redirect; on PC it shows a QR code that the admin scans with their phone. Session and KV remain as-is.

## Route Changes

| Current path | New path |
|---|---|
| `/settings/members` | `/admin/members` |
| `/settings/bulletin-template` | `/admin/bulletin-template` |

The Settings page links to these pages. Those `navigate()` calls must be updated.

## Files to Create or Modify

### Modify: `src/App.tsx`

Detect route prefix to switch layout:

```tsx
// pseudocode
const location = useLocation();
const isAdmin = () => location.pathname.startsWith("/admin");

return (
  <Show when={isAdmin()} fallback={<UserLayout>{props.children}</UserLayout>}>
    <AdminLayout>{props.children}</AdminLayout>
  </Show>
);
```

`AdminLayout` must also enforce admin role — redirect to `/` if `user().role !== "admin"`.

### Modify: `src/index.tsx`

Change route paths:

```tsx
// Before
<Route path="/settings/members" component={Management} />
<Route path="/settings/bulletin-template" component={BulletinTemplate} />

// After
<Route path="/admin/members" component={Management} />
<Route path="/admin/bulletin-template" component={BulletinTemplate} />
```

### Modify: `src/pages/Settings/Settings.tsx`

Update the two `navigate()` calls in the admin section:

```tsx
// Before
navigate("/settings/members")
navigate("/settings/bulletin-template")

// After
navigate("/admin/members")
navigate("/admin/bulletin-template")
```

### Create: `src/components/AdminLayout/`

New component. Design requirements:
- PC-oriented, wider than mobile shell (no `--app-max-width` constraint or a larger value)
- Sidebar navigation with links: Members (`/admin/members`), Bulletin Template (`/admin/bulletin-template`)
- No `<TabBar>`
- Header area showing app name and logged-in user name
- Logout button accessible from sidebar
- Same "God's Glory" theme (glassmorphism, Deep Gold accent) for visual consistency
- Admin role guard: if `user().role !== "admin"`, redirect to `/`

### Modify: Back navigation in admin pages

`Management` and `BulletinTemplate` pages may have back navigation pointing to `/settings`. Review and remove or redirect as appropriate, since `/admin/*` pages no longer have a settings parent.

## Implementation Order (suggested for plan mode)

1. Create `AdminLayout` component (shell only, no content yet)
2. Update `App.tsx` to branch on `/admin` prefix
3. Update routes in `src/index.tsx`
4. Update `Settings.tsx` navigate targets
5. Fix back navigation in `Management` and `BulletinTemplate`
6. Add i18n keys for any new AdminLayout UI text
7. Verify: user routes unaffected, admin routes render new layout, non-admin redirect works

## Constraints

- Do not change API routes or middleware — `adminMiddleware` already handles authorization
- Do not change the LINE auth flow
- Mobile users never see `/admin/*` routes (Settings page only shows the links to admins)
- Keep both layouts in the same Vite build / same Cloudflare Worker deployment
