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

## Custom Agents & Commands

- **`ui-component`** エージェント - Kobalte + CSS Modules の規約に沿ったUIコンポーネント作成
- **`api-route`** エージェント - Hono の規約に沿ったAPIルート追加
- **`/project:verify`** コマンド - lint → build → test の一括検証

## Key Conventions

- Biome デフォルト設定でlint/format (カスタム設定ファイルなし)
- TypeScript strict mode有効、未使用変数・パラメータはエラー
- ターゲット: ES2022 (アプリ) / ES2023 (ツーリング)
