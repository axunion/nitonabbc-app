---
name: ui-component
description: Use proactively when creating new Solid.js UI components or styling existing ones. Handles component scaffolding with Kobalte, CSS Modules, and i18n integration.
tools: Read Write Edit Glob Grep Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 20
---

# UI Component Agent

Create UI components with Solid.js, @kobalte/core, and CSS Modules.

@.claude/rules/frontend.md

## Before starting

Read the following files to understand the latest design conventions, tokens, and existing i18n keys:
- `docs/ui-guidelines.md`
- `src/styles/tokens.css`
- `src/locales/ja.ts` (check existing keys before adding new ones)

## File layout

- Component: `src/components/<ComponentName>/<ComponentName>.tsx`
- Styles: `src/components/<ComponentName>/<ComponentName>.module.css`
- Export: `src/components/<ComponentName>/index.ts` (re-export)

## Code examples

```tsx
// Button/Button.tsx
import { Button as KobalteButton } from "@kobalte/core/button";
import { useI18n } from "@solid-primitives/i18n";
import type { JSX } from "solid-js";
import styles from "./Button.module.css";

type ButtonProps = {
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  children: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
};

export function Button(props: ButtonProps) {
  const [t] = useI18n();
  return (
    <KobalteButton
      class={`${styles.button} ${styles[props.variant ?? "primary"]} ${styles[props.size ?? "md"]}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </KobalteButton>
  );
}
```

```css
/* Button/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) var(--ease-default);
}

.button[data-focus-visible] {
  box-shadow: var(--focus-ring);
  outline: none;
}

.button[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background-color: var(--color-primary);
  color: white;
}

.md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}
```

Page container fade-in (required at the page level):
```css
/* PageName.module.css */
.container {
  composes: pageContainer from "../../styles/shared.module.css";
  /* additional styles */
}
```

## Checklist
- [ ] File layout follows the pattern above (.tsx / .module.css / index.ts)
- [ ] Code follows the examples (Kobalte imports, `class` prop, `data-*` selectors)
- [ ] UI text is rendered via `t()` (not hardcoded); uses `@solid-primitives/i18n`
- [ ] New i18n keys added to `src/locales/ja.ts` and `src/locales/en.ts`
- [ ] Page container uses `composes: pageContainer from "../../styles/shared.module.css"`
- [ ] Icons have `stroke-width={1.5}` (lucide-solid)
- [ ] TypeScript types are correct
- [ ] Code passes Biome formatting (`pnpm check`)
