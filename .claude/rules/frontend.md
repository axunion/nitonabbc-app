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
  - 色: `var(--color-*)`, フォーカス: `var(--focus-ring)`, タイポ: `var(--text-*)`, `var(--font-*)`, `var(--tracking-*)`
  - スペーシング: `var(--space-*)`, 角丸: `var(--radius-*)`, 影: `var(--shadow-*)`
  - トランジション: `var(--duration-*)`, `var(--ease-*)`, z-index: `var(--z-*)`
- ページコンテナには fadeIn アニメーションを適用
- 複数ページで共通のスタイルは `src/styles/shared.module.css` に定義し、各ページで `composes` で適用する（例: `composes: pairedCancel from "../../styles/shared.module.css";`）

## アイコン

- **lucide-solid** を使用。`stroke-width={1.5}` を標準とする
- サイズ: ダッシュボード ウィジェット 24px / タブバー・メニュー 20px

## アクションボタン・空状態

- ヘッダーの `rightAction` は基本的に使わず、ページ内コンテナにアクションボタンを配置する
- 空状態テキスト（「○○がありません」）は表示しない。追加/生成ボタンのみで統一

## i18n

- `@solid-primitives/i18n` を使用
- ロケールファイル: `src/locales/{ja,en}.ts`
- キーは flatCase（例: `bulletinTitle`）
- UI テキストは直書きせず必ず `t()` 経由で出力する

## デザイン詳細

UIデザインの詳細は @docs/ui-guidelines.md を参照すること。
