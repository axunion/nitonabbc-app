---
name: section-type
description: Use proactively when adding a new bulletin section type (e.g., service-meta, attendance, weekly-prayer, upcoming-events, weekly-verse, monthly-song, birthdays, financial-summary, scripture-quotes, text-block). Handles all layers end-to-end.
tools: Read Write Edit Glob Grep Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 40
---

# Section Type Agent

Add a new bulletin section type covering type definitions, viewer, editor, template UI, server processing, tests, and documentation.

@.claude/rules/bulletin.md
@.claude/rules/frontend.md
@.claude/rules/api.md
@.claude/rules/testing.md

## Before starting

Read the following files to understand current implementation patterns:
- `docs/bulletin.md` §5 (spec for the section to add)
- `src/types/bulletin.ts` (existing union types)
- `src/pages/BulletinDetail/components/SectionView.tsx` (viewer dispatcher)
- `src/pages/BulletinForm/components/SectionEditor.tsx` (editor dispatcher)
- `src/pages/BulletinTemplate/components/SectionCard.tsx` (template UI dispatcher)
- `server/routes/bulletin.ts` (sanitize and `countProgress` implementation)
- `server/routes/__tests__/bulletin.test.ts` (existing test patterns)

## Steps

### 1. Type definitions (`src/types/bulletin.ts`)
- Add `<Name>SectionTemplate` type (`id`, `type`, `label`, `visible?`, `config`)
- Add `<Name>SectionData` type (`id`, `type`, `label`, `data`)
- Add both to the `SectionTemplate` / `SectionData` unions

### 2. Viewer (`src/pages/BulletinDetail/components/SectionView.tsx`)
- Add `props.section.type === "<type>"` branch to the dispatcher
- Implement a read-only display component in the same directory

### 3. Editor (`src/pages/BulletinForm/components/SectionEditor.tsx`)
- Add corresponding branch to the dispatcher
- Implement an input-only editor component in the same directory

### 4. Template UI (`src/pages/BulletinTemplate/components/SectionCard.tsx`)
- If the section has config fields, add a dispatcher branch for the config edit UI
- If no config (e.g. `weekly-prayer`, `weekly-verse`), the generic display is sufficient
- Add the section to `DEFAULT_TEMPLATE` in `server/routes/bulletinTemplateDefaults.ts` (sections cannot be added from the UI)

### 5. Server: sanitize (`server/routes/bulletin.ts`)
- Add the new type string to the `VALID_SECTION_TYPES` array

### 6. Server: progress counting (`server/routes/bulletin.ts` `countProgress`)
- Add counting logic per the "Progress" column in `docs/bulletin.md` §5
- If the section does not count toward progress, use `totalItems += 0`

### 7. Tests (`server/routes/__tests__/bulletin.test.ts`)
- Add tests for creating, fetching, and counting progress for the new section type

### 8. Documentation (`docs/bulletin.md`)
- Add the new type to the §5 catalog and the §8 default template listing

## Checklist
- [ ] Added to `src/types/bulletin.ts` unions
- [ ] Added branches to all three dispatchers: `SectionView`, `SectionEditor`, `SectionCard`
- [ ] Added to `VALID_SECTION_TYPES` in server sanitize
- [ ] Added progress counting logic to `countProgress` (or explicit 0 if not counted)
- [ ] Tests added and `pnpm test` passes
- [ ] `docs/bulletin.md` updated (§5 catalog, §8 default template)
- [ ] i18n keys added to `src/locales/ja.ts` and `src/locales/en.ts`
- [ ] Code passes Biome formatting (`pnpm check`)
