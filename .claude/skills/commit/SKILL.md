---
name: commit
description: >
  変更内容を確認してコミットを作成するスキル。「コミットして」「変更を保存して」「コミットメッセージ書いて」「git commit して」など、コミット作成を求める場面で必ず使用する。
allowed-tools: Bash
---

以下の手順でコミットを作成してください。

## 1. 現状確認

以下を並行して実行する:

- `git status` — 変更ファイルの一覧
- `git diff` — ステージ済み・未ステージの差分
- `git log --oneline -5` — 直近のコミット（メッセージのスタイルを参考にする）

## 2. コミットメッセージの作成

以下の規約に従う:

- **言語**: 必ず英語で記述する
- **形式**: `Verb + description`（命令形・現在形）
  - 例: `Add PWA install prompt to Settings page`
  - 例: `Fix DEV_AUTH foreign key violation`
  - 例: `Redesign TabBar as floating pill`
- **動詞の選択**:
  - `Add` — 新機能・新ファイルの追加
  - `Fix` — バグ修正
  - `Redesign` / `Refactor` — 動作変更なしの改善・再設計
  - `Update` / `Enhance` — 既存機能の拡張
  - `Remove` — 機能・コードの削除
  - `Implement` — 大きな機能の初期実装
  - `Optimize` — パフォーマンス・設定の最適化
  - `Migrate` — 技術移行
- **先頭大文字**: 動詞は大文字で始める（例: `Add`, `Fix`）
- **本文**: 必要な場合のみ。"what" より "why" を重視

## 3. ステージングとコミット

1. 関連ファイルを個別に `git add <file>` でステージング（`git add -A` は機密ファイル混入リスクがあるため避ける）
2. 以下の形式でコミット:

```bash
git commit -m "Add user profile page with avatar upload"
```

## 4. 確認

`git status` でコミットが成功したことを確認する。

## 注意事項

- `.dev.vars`・`.env` などの機密ファイルは絶対にコミットしない
- ユーザーから明示的に指示されない限り `git push` はしない
- pre-commit hook が失敗した場合は原因を修正してから新しいコミットを作成する（`--amend` や `--no-verify` は使わない）
