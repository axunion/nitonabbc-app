---
name: refactor
description: 変更箇所のコード品質・再利用性・プロジェクト規約との整合性を分析し、改善を適用する。
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

現在の git diff（staged + unstaged）を分析し、変更箇所のコード品質を改善してください。以下の手順で進めること。

## 1. 変更の収集

`git diff HEAD` を実行し、変更されたファイルと行を特定する。

## 2. レビューチェックリスト

変更されたファイルごとに以下を確認する。

### 再利用・重複
- 共通ヘルパーに抽出すべき重複ロジックがないか
- `src/` や `server/` に同じことをする既存ユーティリティがないか

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

## 3. 修正の適用

問題を列挙するだけでなく、直接ファイルを編集して修正すること。

## 4. 検証

`pnpm check` を実行して lint/format の準拠を確認。エラーが残る場合は `pnpm check:write` → `pnpm check` の順で再実行。

## 5. 報告

変更内容と理由を簡潔に報告する。カテゴリ別（再利用、パターン、型、スタイル）にグループ化すること。
