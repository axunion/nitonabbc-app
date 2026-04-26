# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

仁戸名聖書バプテスト教会のメンバー（約30名）向けPWAアプリケーション。Solid.js + TypeScript、Viteビルド、pnpmパッケージマネージャー。

- LINE認証のみ、2ロール（管理者/メンバー）
- ライトテーマ + フロスト白グラスモーフィズム（"God's Glory" テーマ）、モバイルファースト
- 日本語・英語の多言語対応
- 外部サブドメインサービスはiframeで埋め込み

## Specification Documents

仕様は `docs/` に管理。実装時は必ず該当ドキュメントを参照すること。
機能追加時は `docs/` に個別ドキュメントを作成し、`spec.md` のテーブルにリンク。

@docs/spec.md

## Environments

| 環境 | 説明 |
|------|------|
| ローカル | `pnpm dev` で `@cloudflare/vite-plugin` により Vite (HMR) + workerd (実API) を同時起動。`.dev.vars` に `DEV_AUTH=true` を設定すると LINE認証スキップで管理者として自動ログイン |
| Preview | `main` 以外のブランチpushで自動デプロイ。検証・レビュー用 |
| Production | `main` ブランチpushで自動デプロイ。本番 |

- KV / D1 などのバインディングは環境ごとに分離
- LINE Login のコールバックURLは環境ごとに設定が必要

## Commands

- `pnpm dev` - フルスタック開発：Vite + workerd を同時起動 (http://localhost:5173)
- `pnpm dev:api` - Wrangler Workers APIサーバーのみ起動
- `pnpm build` - TypeScriptビルド + Viteプロダクションビルド (`tsc -b && vite build`)
- `pnpm serve` - ビルド済み出力を workerd でローカル起動 (`vite preview`)
- `pnpm check` - Biomeによるlint/format チェック
- `pnpm check:write` - Biomeによるlint/format 自動修正
- `pnpm test` - テスト実行 (Vitest、対象: `server/**/*.test.ts` のみ)
- `pnpm test:watch` - テストをwatchモードで実行
- `pnpm deploy` - Cloudflare Workersへデプロイ

## Architecture

- **エントリポイント**: `index.html` → `src/index.tsx` → `src/App.tsx`
- **ルーティング**: `@solidjs/router`。`src/index.tsx` でルート定義、`src/App.tsx` がルートレイアウト
  - `/` → Dashboard, `/settings` → Settings, `/settings/admin` → Management（lazy load）
  - ナビゲーション: ボトムタブバー（教会 / 設定 の2タブ）+ ヘッダー（子ページでは戻るボタン付き）
  - タブ切替時、各タブ内の最後のURLを記憶・復元する（iOS UITabBarController 相当）
- **パスエイリアス**: `@/` → `./src` (vite.config.ts と tsconfig.app.json の両方に設定が必要)
- **認証コンテキスト**: `src/store/AuthContext.tsx` の `useAuth()` でユーザー情報・`logout` を取得
- **JSX**: Solid.js独自のJSXトランスフォーム (`jsxImportSource: solid-js`)
- **PWA**: vite-plugin-pwa (generateSwモード、Workbox自動生成)
- **デプロイ**: Cloudflare Workers + static assets (`@cloudflare/vite-plugin`)

UI・CSS・APIサーバー・テストの詳細規約は `.claude/rules/` のパススコープルールを参照。

## Directory Structure

- `src/components/<Name>/<Name>.tsx` - コンポーネント本体
- `src/components/<Name>/<Name>.module.css` - コンポーネントスタイル
- `src/components/<Name>/index.ts` - re-export
- `src/pages/<Name>/<Name>.tsx` - ページコンポーネント（ルートレベルの画面）
- `src/store/` - Solid.js ストア（`createResource` ベース）
- `src/styles/` - グローバルスタイル (tokens.css, reset.css) + 共通CSS Modulesクラス (shared.module.css)
- `server/routes/` - Hono APIルート（1ファイル1リソース）
- `server/middleware/` - 共通ミドルウェア
- `server/types.ts` - `AppEnv`・`User`・`SessionData` などサーバー共通型
- `worker/index.ts` - Workerエントリポイント（Hono app を re-export）
- `db/schema.sql` - D1 テーブル定義
- `.dev.vars` - ローカル環境変数（git管理外）、`.dev.vars.example` を参照

## Database (Cloudflare D1)

- **スキーマ定義**: `db/schema.sql` が唯一の正（マイグレーションツールは未導入）
- **ローカルデータ**: `.wrangler/state/v3/` 内の SQLite ファイルに永続化される（`pnpm dev` 再起動後も維持）
- **本番データ**: Cloudflare エッジ上の D1 インスタンス（ローカルとは完全に分離）

### スキーマ変更時の手順

`/db-migrate` スキルを使うと以下の手順をガイドしてくれる。

1. `db/schema.sql` を編集
2. ローカル DB をリセット: `rm -rf .wrangler/state/`（セキュリティポリシーによりユーザーが手動実行）
3. `pnpm dev` で再起動（空の DB が自動作成される）
4. 必要に応じてスキーマを適用: `wrangler d1 execute nitonabbc-db --file=db/schema.sql --local`

### 本番デプロイ時

- **初回**: `wrangler d1 execute nitonabbc-db --file=db/schema.sql --remote` で全テーブルを作成
- **運用開始後のスキーマ変更**: `CREATE TABLE IF NOT EXISTS` は既存テーブルに影響しないため、`ALTER TABLE` 等の差分 SQL を手動実行するか、マイグレーションツールを導入する

## Claude Code Automation

詳細規約は `.claude/rules/`、エージェント・スキルは `.claude/agents/` / `.claude/skills/` を参照。

### Agents（サブエージェント）

| エージェント | 起動タイミング |
|-------------|--------------|
| `api-route` | Hono APIルート・テストの新規追加時 |
| `section-type` | 週報セクション種別の新規追加時（全レイヤー対応） |
| `ui-component` | Solid.js UIコンポーネントの新規作成・スタイリング時 |
| `security-reviewer` | 認証・セッション・招待リンク・管理者ルートの変更時 |

### Skills（スラッシュコマンド）

| スキル | 用途 |
|--------|------|
| `/verify` | lint・ビルド・テストの一括確認。実装後・コミット前に必ず実行 |
| `/spec-update` | docs/spec.md と個別ドキュメントの同期 |
| `/refactor` | コード品質・規約・重複の修正 |
| `/db-migrate` | D1スキーマ変更時の手順ガイド |

### Hooks（自動実行）

- **PostToolUse（Edit/Write後）**: `pnpm check:write` を自動実行。手動での Biome 修正は不要
- **PreToolUse（Edit/Write前）**: `.dev.vars` への書き込みをブロック

## Key Conventions

- Biome デフォルト設定でlint/format (カスタム設定ファイルなし)
- TypeScript strict mode有効、未使用変数・パラメータはエラー
- ターゲット: ES2022 (アプリ) / ES2023 (ツーリング)
- コミットメッセージ、コード内コメント、consoleに表示するエラーメッセージは英語で記述
- コミットメッセージは英語・`Verb + description` 形式（例: `Add PWA install prompt to Settings page`）
  - 動詞: `Add` / `Fix` / `Redesign` / `Refactor` / `Update` / `Enhance` / `Remove` / `Implement` / `Optimize` / `Migrate`
  - 本文は必要な場合のみ、"what" より "why" を重視
  - `.dev.vars` など機密ファイルは絶対にコミットしない
