# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

仁戸名聖書バプテスト教会のメンバー（約30名）向けPWAアプリケーション。Solid.js + TypeScript、Viteビルド、pnpmパッケージマネージャー。

- LINE認証のみ、2ロール（管理者/メンバー）
- iOS風ダッシュボードUI、モバイルファースト
- 日本語・英語の多言語対応
- 外部サブドメインサービスはiframeで埋め込み

## Specification Documents

仕様は `docs/` に管理。実装時は必ず該当ドキュメントを参照すること。

- `docs/spec.md` - 全体方針（概要、権限モデル、ダッシュボード、管理画面、技術スタック）
- `docs/auth.md` - 認証（LINE Login、招待リンク方式、セッション管理）
- `docs/bulletin.md` - 週報機能（構成、入力、出力、画面）
- 機能追加時は `docs/` に個別ドキュメントを作成し、`spec.md` のテーブルにリンク

## Environments

| 環境 | 説明 |
|------|------|
| ローカル | `pnpm dev`。`DEV_AUTH=true` でLINE認証スキップ、管理者として自動ログイン |
| Preview | `main` 以外のブランチpushで自動デプロイ。検証・レビュー用 |
| Production | `main` ブランチpushで自動デプロイ。本番 |

- KV / D1 などのバインディングは環境ごとに分離
- LINE Login のコールバックURLは環境ごとに設定が必要

## Commands

- `pnpm dev` - 開発サーバー起動 (http://localhost:5173)
- `pnpm build` - TypeScriptビルド + Viteプロダクションビルド (`tsc -b && vite build`)
- `pnpm test` - テスト実行 (Vitest)
- `pnpm test:watch` - テストをwatchモードで実行
- `pnpm check` - Biomeによるlint/format チェック (`biome check ./src`)
- `pnpm check:write` - Biomeによるlint/format 自動修正
- `pnpm deploy` - Cloudflare Pagesへデプロイ (`wrangler pages deploy dist`)
- `pnpm preview:cf` - Cloudflare環境でのローカルプレビュー (`wrangler pages dev dist`)

## Architecture

- **エントリポイント**: `index.html` → `src/index.tsx` → `src/App.tsx`
- **パスエイリアス**: `@/` → `./src` (vite.config.ts で設定)
- **UI**: @kobalte/core (ヘッドレスUIプリミティブ) + CSS Modules（Tailwind不使用）
  - Kobalteの `class` prop に CSS Modules クラスを渡す
  - 状態スタイルは `data-*` 属性セレクタ (`[data-disabled]`, `[data-pressed]`, `[data-focus-visible]`)
- **CSS**: Lightning CSS でミニファイ。コンポーネント単位で `.module.css` ファイル
  - `src/index.css` → `src/styles/tokens.css` (デザイントークン) + `src/styles/reset.css` (リセット) を読み込み
  - デザイントークンは CSS Custom Properties で管理（ライトテーマのみ）
  - トークン: colors (gray/primary/destructive/success), focus ring, typography, spacing, radius, shadows, transitions, z-index
- **JSX**: Solid.js独自のJSXトランスフォーム (`jsxImportSource: solid-js`)
- **PWA**: vite-plugin-pwa (generateSwモード、Workbox自動生成)。静的アセットのprecache
- **デプロイ**: Cloudflare Pages + Workers Functions
- **APIサーバー**: Hono (`server/` ディレクトリ)。`functions/api/_middleware.ts` でPages Functionsにマウント
  - APIルートは `server/routes/` に配置し、`server/index.ts` で登録
  - エンドポイントは `/api/*` パス配下

## Directory Structure

- `src/components/<Name>/<Name>.tsx` - コンポーネント本体
- `src/components/<Name>/<Name>.module.css` - コンポーネントスタイル
- `src/components/<Name>/index.ts` - re-export
- `src/styles/` - グローバルスタイル (tokens.css, reset.css)
- `server/routes/` - Hono APIルート（1ファイル1リソース）
- `server/middleware/` - 共通ミドルウェア

## Custom Agents & Skills

- **`ui-component`** エージェント - Kobalte + CSS Modules の規約に沿ったUIコンポーネント作成
- **`api-route`** エージェント - Hono の規約に沿ったAPIルート追加
- **`/verify`** スキル - lint → build → test の一括検証

## Key Conventions

- Biome デフォルト設定でlint/format (カスタム設定ファイルなし)
- TypeScript strict mode有効、未使用変数・パラメータはエラー
- ターゲット: ES2022 (アプリ) / ES2023 (ツーリング)
- コミットメッセージ、コード内コメント、consoleに表示するエラーメッセージは英語で記述
