---
name: refactor
description: プロジェクト全体または指定範囲のコードを分析し、品質・規約・パターンの問題を修正する。
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

引数なしの場合は `src/`・`server/`・`worker/` 全体、引数ありの場合は指定されたディレクトリ/ファイルのみを対象とする。

## 1. 対象の決定

- 引数なし → `src/`・`server/`・`worker/` 配下の全ファイルを分析
- 引数あり → 指定されたパスのみ対象

## 2. レビューチェックリスト

### 重複・デッドコード
- 共通ヘルパーに抽出すべき重複ロジックがないか
- 使われていない関数・コンポーネント・エクスポートがないか
- `src/` や `server/` に同じ役割の既存ユーティリティがないか

### Solid.js パターン（`src/**` 対象）
- リアクティビティ: props の分割代入をしない、シグナルは JSX/effect 内でアクセス（即時評価しない）
- リソース: 非同期データには `createResource` を使用（`useEffect` + `setState` パターンは不可）
- コンポーネントは `src/components/<Name>/<Name>.tsx` の構造に従う

### Hono / Workers パターン（`server/**` 対象）
- ルートは `server/routes/` に1ファイル1リソースの規約に従う
- Node.js API（`fs`, `path` 等）は使用不可 — Workers 環境のみ
- 外部キー参照先のレコードが存在すること（特に DEV_AUTH モード）

### TypeScript
- `any` 型は不可 — 適切な型または `unknown` + 型絞り込みを使用
- 未使用の import・変数・パラメータを削除
- strict mode との整合性

### CSS Modules（`*.module.css` 対象）
- `src/styles/tokens.css` のデザイントークン（CSS カスタムプロパティ）を使用し、ハードコード値は避ける
- クラス名は camelCase
- 複数ページで共通のスタイルは `src/styles/shared.module.css` へ抽出

## 3. 修正の適用

問題を列挙するだけでなく、直接ファイルを編集して修正すること。

## 4. 検証

以下の順で検証を実施する:

1. `pnpm check` — lint/format 確認。エラーがあれば `pnpm check:write` → `pnpm check` の順で再実行
2. `pnpm build` — TypeScript コンパイル + Vite ビルドが通ることを確認
3. `pnpm test` — テストが通ることを確認

## 5. 報告

変更内容と理由をカテゴリ別にグループ化して報告する:
- **重複・デッドコード**
- **Solid.js パターン**
- **Hono / Workers パターン**
- **TypeScript**
- **CSS Modules**
