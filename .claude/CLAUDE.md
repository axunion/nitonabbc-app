# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solid.js + TypeScript のSPAアプリケーション。Viteをビルドツール、pnpmをパッケージマネージャーとして使用。

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
- **CSS**: Lightning CSS でミニファイ。グローバルスタイルは `src/index.css`、コンポーネント単位で `.css` ファイル
- **JSX**: Solid.js独自のJSXトランスフォーム (`jsxImportSource: solid-js`)
- **PWA**: vite-plugin-pwa (generateSwモード、Workbox自動生成)。静的アセットのprecache
- **デプロイ**: Cloudflare Pages + Workers Functions
- **APIサーバー**: Hono (`server/` ディレクトリ)。`functions/api/_middleware.ts` でPages Functionsにマウント
  - APIルートは `server/routes/` に配置し、`server/index.ts` で登録
  - エンドポイントは `/api/*` パス配下

## Key Conventions

- Biome デフォルト設定でlint/format (カスタム設定ファイルなし)
- TypeScript strict mode有効、未使用変数・パラメータはエラー
- ターゲット: ES2022 (アプリ) / ES2023 (ツーリング)
