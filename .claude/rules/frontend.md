---
paths:
  - "src/**"
---

# Frontend Rules

## UI ライブラリ

- **@kobalte/core** ヘッドレスUIプリミティブを使用（Tailwind 不使用）
- `@kobalte/core/<component>` から個別インポート
- `class` prop に CSS Modules クラスを渡す
- 状態スタイルは `data-*` 属性セレクタで定義:
  - `[data-disabled]`, `[data-pressed]`, `[data-hover]`, `[data-focus-visible]`, `[data-expanded]`, `[data-checked]`

## CSS Modules

- ファイル拡張子: `.module.css`、コンポーネントと同ディレクトリに配置
- デザイントークン (`src/styles/tokens.css`) の CSS 変数を必ず使用（ハードコード禁止）:
  - 色: `var(--color-*)`, フォーカス: `var(--focus-ring)`, タイポ: `var(--text-*)`, `var(--font-*)`
  - スペーシング: `var(--space-*)`, 角丸: `var(--radius-*)`, 影: `var(--shadow-*)`
  - トランジション: `var(--duration-*)`, `var(--ease-*)`, z-index: `var(--z-*)`
- ページコンテナには fadeIn アニメーションを適用

## アイコン

- **lucide-solid** を使用。`stroke-width={1.5}` を標準とする
- サイズ: ウィジェット大 28px / ウィジェット小 24px / タブバー・メニュー 20px

## アクションボタン・空状態

- ヘッダーの `rightAction` は基本的に使わず、ページ内コンテナにアクションボタンを配置する
- 空状態テキスト（「○○がありません」）は表示しない。追加/生成ボタンのみで統一

## デザイン詳細

UIデザインの詳細は @docs/ui-guidelines.md を参照すること。
