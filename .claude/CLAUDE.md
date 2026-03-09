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
- `pnpm test` - テスト実行 (Vitest)
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
- `src/styles/` - グローバルスタイル (tokens.css, reset.css)
- `server/routes/` - Hono APIルート（1ファイル1リソース）
- `server/middleware/` - 共通ミドルウェア
- `server/types.ts` - `AppEnv`・`User`・`SessionData` などサーバー共通型
- `worker/index.ts` - Workerエントリポイント（Hono app を re-export）
- `db/schema.sql` - D1 テーブル定義
- `.dev.vars` - ローカル環境変数（git管理外）、`.dev.vars.example` を参照

## Key Conventions

- Biome デフォルト設定でlint/format (カスタム設定ファイルなし)
- TypeScript strict mode有効、未使用変数・パラメータはエラー
- ターゲット: ES2022 (アプリ) / ES2023 (ツーリング)
- コミットメッセージ、コード内コメント、consoleに表示するエラーメッセージは英語で記述
