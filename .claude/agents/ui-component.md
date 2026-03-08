---
name: ui-component
description: Kobalte + CSS Modules の規約に沿ってUIコンポーネントを作成するエージェント。新しいコンポーネントの追加やスタイリングを依頼された際に使用。
tools: Read, Write, Edit, Glob, Grep, Bash
model: inherit
---

# UI Component Agent

Solid.js + @kobalte/core + CSS Modules でUIコンポーネントを作成する。

## 規約

### ファイル構成
- コンポーネント: `src/components/<ComponentName>/<ComponentName>.tsx`
- スタイル: `src/components/<ComponentName>/<ComponentName>.module.css`
- エクスポート: `src/components/<ComponentName>/index.ts` (re-export)

### Kobalte の使い方
- `@kobalte/core/<component>` から個別インポート（例: `@kobalte/core/button`）
- `class` prop に CSS Modules のクラスを渡す
- 状態スタイルは `data-*` 属性セレクタで定義:
  - `[data-disabled]` - 無効状態
  - `[data-pressed]` - 押下状態
  - `[data-hover]` - ホバー状態
  - `[data-focus-visible]` - キーボードフォーカス
  - `[data-expanded]` - 展開状態
  - `[data-checked]` - チェック状態

### CSS Modules スタイリング
- ファイル拡張子: `.module.css`
- **テーマ**: ライトテーマ + フロスト白グラスモーフィズム（"God's Glory" テーマ）
  - 背景: warm off-white、暖色メッシュグラデーション
  - アクセント: Deep Gold (`--color-primary`)
  - グラス: frosted white (`rgba(255,255,255,0.65)` + `blur(20px)`)
  - ハードコードの dark値（`rgba(255,255,255,0.08)` 等）は使わない。light用値（`rgba(0,0,0,0.05)` 等）を使用
- デザイントークン (`src/styles/tokens.css`) の CSS変数を必ず使用する:
  - 色: `var(--color-*)`, `var(--color-primary)`, `var(--color-destructive)` 等
  - フォーカス: `var(--focus-ring)` を `box-shadow` に適用（gold glow）
  - タイポグラフィ: `var(--text-*)`, `var(--font-*)`, `var(--leading-*)`
  - スペーシング: `var(--space-*)`
  - 角丸: `var(--radius-*)`
  - 影: `var(--shadow-*)` — カードには `--shadow-sm`、ウィジェットには `--shadow-md`
  - トランジション: `var(--duration-*)`, `var(--ease-*)`
  - z-index: `var(--z-*)`
- ハードコードした色・サイズは使わない
- ページコンテナには fadeIn アニメーションを適用する

### ナビゲーション
- ボトムタブバー: 教会(`/`) / 設定(`/settings`) の2タブ。子ページでも常時表示
- タブ切替時、各タブ内の最後のURLを記憶・復元する（iOS UITabBarController 相当）
- ページ階層:
  - 教会タブ: `/` → `/bulletin` → `/bulletin/:id`, `/bulletin/new`, `/bulletin/:id/edit`
  - 設定タブ: `/settings` → `/settings/admin` → `/settings/admin/bulletin-template`
- Header の `backTo` prop: 子ページでは親ページのパスを指定し、左に戻るボタン（`ChevronLeft`）を表示
- 戻るボタンはブラウザバックではなく、親ページへの `navigate()` を行う

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
