---
paths:
  - "src/pages/Bulletin*/**"
  - "src/components/Section*/**"
  - "server/routes/bulletin*.ts"
  - "src/types/bulletin.ts"
  - "src/utils/bulletin.ts"
  - "src/api/bulletin.ts"
---

# Bulletin Rules

Conventions for the bulletin section block model.

@docs/bulletin.md

## Type system

- `SectionTemplate` / `SectionData` are discriminated unions (narrow via the `type` field)
- Unknown `type` values are received as `UnknownSection`; skip rendering and editing for forward compatibility
- Use `AnySection = SectionData | UnknownSection` — do not leave values as `unknown`
- When adding a new section type, add it to the unions in `src/types/bulletin.ts` and add a case to every dispatcher

## Dispatcher pattern

Section-type-specific UI is provided through three dispatchers. When adding a new type, add a branch to **all** of them:

| File | Role |
|------|------|
| `src/pages/BulletinDetail/components/SectionView.tsx` | Read-only UI |
| `src/pages/BulletinForm/components/SectionEditor.tsx` | Input UI |
| `src/pages/BulletinTemplate/components/SectionCard.tsx` | Template management UI |

## Server-side constraints

- Always sanitize on template save (`PUT /api/bulletin-template`):
  - Reject duplicate `id` values with 400
  - Validate that `type` is a known value (do not save unknown types)
- Progress counting (`countProgress`) is managed in `server/routes/bulletin.ts`. Add counting logic for every new type.

## Steps to add a section type (summary)

1. Add `<Name>SectionTemplate` / `<Name>SectionData` types to `src/types/bulletin.ts` unions
2. Add cases to the `SectionView` / `SectionEditor` / `SectionCard` dispatchers
3. Add sanitize and `countProgress` logic on the server side
4. Add test cases for the new type to `server/routes/__tests__/bulletin.test.ts`
5. Add the section to `DEFAULT_TEMPLATE` in `server/routes/bulletinTemplateDefaults.ts` and update the §5 catalog / §8 default listing in `docs/bulletin.md`

For detailed section type specs (config / data format), see the §5 catalog in `@docs/bulletin.md`.
