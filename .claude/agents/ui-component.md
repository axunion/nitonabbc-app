---
name: ui-component
description: Kobalte + CSS Modules の規約に沿ってUIコンポーネントを作成するエージェント。新しいコンポーネントの追加やスタイリングを依頼された際に使用。
tools: Read, Write, Edit, Glob, Grep, Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 20
---

# UI Component Agent

Solid.js + @kobalte/core + CSS Modules でUIコンポーネントを作成する。

## 作業開始前

必ず以下を Read して最新のデザイン規約とトークンを把握すること:
- `docs/ui-guidelines.md`
- `src/styles/tokens.css`

## 規約

### ファイル構成
- コンポーネント: `src/components/<ComponentName>/<ComponentName>.tsx`
- スタイル: `src/components/<ComponentName>/<ComponentName>.module.css`
- エクスポート: `src/components/<ComponentName>/index.ts` (re-export)

### Kobalte の使い方
- `@kobalte/core/<component>` から個別インポート
- `class` prop に CSS Modules のクラスを渡す
- 状態スタイルは `data-*` 属性セレクタで定義:
  - `[data-disabled]`, `[data-pressed]`, `[data-hover]`, `[data-focus-visible]`, `[data-expanded]`, `[data-checked]`

### CSS Modules スタイリング
- ファイル拡張子: `.module.css`
- デザイントークンの CSS 変数を必ず使用する（ハードコード値禁止）
- ページコンテナには fadeIn アニメーションを適用する

### TypeScript
- Props は明示的に型定義する
- Kobalte の Props 型を拡張する場合は intersection type を使用

### コード例

```tsx
// Button/Button.tsx
import { Button as KobalteButton } from "@kobalte/core/button";
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

## チェックリスト
- [ ] Kobalte プリミティブを使用しているか
- [ ] CSS Modules でスタイリングしているか
- [ ] デザイントークンのCSS変数を使用しているか（ハードコード値なし）
- [ ] `[data-focus-visible]` でフォーカススタイルを定義しているか
- [ ] `[data-disabled]` で無効状態を定義しているか
- [ ] TypeScript の型が適切か
- [ ] Biome のフォーマットに準拠しているか（`pnpm check`）
