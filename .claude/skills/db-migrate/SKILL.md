---
name: db-migrate
description: >
  D1スキーマ変更時のローカルDBリセット・再適用手順を実行するスキル。
  「マイグレーション」「DBリセット」「スキーマ変更を反映して」「ローカルDBを作り直して」
  などの場面で使うこと。
allowed-tools: Bash Read
---

`db/schema.sql` の変更をローカル D1 に適用します。以下の手順を実行してください。

1. `db/schema.sql` を Read して変更内容を確認・表示する
2. `.wrangler/state/` が存在する場合、ユーザーにローカル DB のリセットが必要であることを伝え、以下のコマンドを自分で実行するよう案内する（セキュリティポリシーにより Claude は実行できない）:
   ```
   rm -rf .wrangler/state/
   ```
3. スキーマ適用コマンドを案内する:
   ```
   wrangler d1 execute nitonabbc-db --file=db/schema.sql --local
   ```
4. 本番への反映が必要かユーザーに確認する
   - 必要な場合は `--remote` フラグを使う旨を案内し、実行前に再確認を求める

**注意**: `.wrangler/state/` の削除はローカルの全テストデータが消えるため、必ずユーザーの承認を取ること。
