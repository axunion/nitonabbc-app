---
name: ui-component
description: Use proactively when creating new Solid.js UI components or styling existing ones. Handles component scaffolding with Kobalte, CSS Modules, and i18n integration.
tools: Read Write Edit Glob Grep Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 20
---

# UI Component Agent

Solid.js + @kobalte/core + CSS Modules でUIコンポーネントを作成する。

@.claude/rules/frontend.md

## 作業開始前

必ず以下を Read して最新のデザイン規約・トークン・既存 i18n キーを把握すること:
- `docs/ui-guidelines.md`
- `src/styles/tokens.css`
- `src/locales/ja.ts`（既存キーを確認してから新しいキーを追加する）

## ファイル構成

- コンポーネント: `src/components/<ComponentName>/<ComponentName>.tsx`
- スタイル: `src/components/<ComponentName>/<ComponentName>.module.css`
- エクスポート: `src/components/<ComponentName>/index.ts` (re-export)

## コード例

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

ページコンテナのフェードイン（ページレベルで必ず使う）:
```css
/* PageName.module.css */
.container {
  composes: pageContainer from "../../styles/shared.module.css";
  /* 追加スタイル */
}
```

## チェックリスト
- [ ] ファイル構成が上記パターンに従っているか（.tsx / .module.css / index.ts）
- [ ] コード例のパターン（Kobalte import、class prop、data-* セレクタ）に従っているか
- [ ] UI テキストは直書きせず `t()` 経由で出力しているか（`@solid-primitives/i18n`）
- [ ] `src/locales/ja.ts` と `src/locales/en.ts` に新しいキーを追加したか
- [ ] ページコンテナは `composes: pageContainer from "../../styles/shared.module.css"` を使っているか
- [ ] アイコンは `stroke-width={1.5}` を設定しているか（lucide-solid）
- [ ] TypeScript の型が適切か
- [ ] Biome のフォーマットに準拠しているか（`pnpm check`）
