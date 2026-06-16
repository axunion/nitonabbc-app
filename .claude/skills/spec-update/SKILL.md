---
name: spec-update
description: >
  Sync docs/spec.md and individual feature documents when documentation is added or updated.
  Use for requests like "update the spec", "add to the docs", "reflect in spec.md", or "update implementation status".
allowed-tools: Read Edit Write Glob Grep
---

Keep feature documents up to date.

Existing docs under `docs/` (`admin.md`, `auth.md`, `bulletin.md`) are written
in Japanese with organic, feature-specific headers — not the literal English
section names below. Match that established style (Japanese prose, headers
that fit the feature) rather than the section list verbatim; the list is a
checklist of what to cover, not literal heading text to copy.

## Steps

### Creating a new feature document

1. Create `docs/<feature-name>.md` covering:
   1. **Overview** — purpose and target users
   2. **Data model** — DB table definitions and field descriptions
   3. **API** — endpoint list, request/response format
   4. **UI** — screen layout, components, interaction flow
   5. **Implementation status** — current status of each feature item
   6. **Notes** — constraints, known limitations, future extension points

2. Add a link to the feature table in `docs/spec.md`:
   ```
   | Feature name | [feature-name.md](./feature-name.md) | Status |
   ```

### Updating an existing document

1. Edit `docs/<feature-name>.md` according to the changes
2. If implementation status changed, update the corresponding row
3. Update the status column in `docs/spec.md` if needed

## Checklist
- [ ] Document covers the topics above, in the existing docs' Japanese/organic style
- [ ] Link added or updated in the `docs/spec.md` feature table
- [ ] Implementation status accurately reflects the current state
