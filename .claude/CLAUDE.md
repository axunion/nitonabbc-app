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

- `docs/spec.md` - 全体方針（概要、権限モデル、ダッシュボード、管理画面、技術スタック）
- `docs/auth.md` - 認証（LINE Login、招待リンク方式、セッション管理）
- `docs/admin.md` - 管理画面（メンバー管理、招待リンク、認可）
- `docs/bulletin.md` - 週報機能（構成、入力、出力、画面）
- `docs/ui-guidelines.md` - UIデザイン方針（iOS HIG 準拠、アイコン・スペーシング・タイポグラフィ）
- 機能追加時は `docs/` に個別ドキュメントを作成し、`spec.md` のテーブルにリンク

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

- **ルーティング**: `@solidjs/router` を使用。`src/index.tsx` でルート定義、`src/App.tsx` がルートレイアウト
  - `/` → Dashboard, `/admin` → Management, `/more` → Account/Settings（lazy load）
  - ナビゲーション: ボトムタブバー（教会 / アカウント の2タブ）+ シンプルなヘッダー
  - 認証コンテキスト: `src/store/AuthContext.tsx` の `useAuth()` でユーザー情報・`logout` を取得
- **エントリポイント**: `index.html` → `src/index.tsx` → `src/App.tsx`
- **パスエイリアス**: `@/` → `./src` (vite.config.ts と tsconfig.app.json の両方に設定が必要)
- **UI**: @kobalte/core (ヘッドレスUIプリミティブ) + CSS Modules（Tailwind不使用）
  - Kobalteの `class` prop に CSS Modules クラスを渡す
  - 状態スタイルは `data-*` 属性セレクタ (`[data-disabled]`, `[data-pressed]`, `[data-focus-visible]`)
- **アイコン**: lucide-solid を使用。`stroke-width={1.5}` を標準とする。詳細は `docs/ui-guidelines.md`
- **CSS**: Lightning CSS でミニファイ。コンポーネント単位で `.module.css` ファイル
  - `src/index.css` → `src/styles/tokens.css` (デザイントークン) + `src/styles/reset.css` (リセット) を読み込み
  - デザイントークンは CSS Custom Properties で管理（ライトテーマ + フロスト白グラスモーフィズム）
  - トークン: colors (warm stone gray/deep gold primary/destructive/success), glass effect (frosted white), input, mesh gradient (warm stained glass), focus ring (gold), typography, spacing, radius, shadows (light), transitions, z-index
- **JSX**: Solid.js独自のJSXトランスフォーム (`jsxImportSource: solid-js`)
- **PWA**: vite-plugin-pwa (generateSwモード、Workbox自動生成)。静的アセットのprecache
- **デプロイ**: Cloudflare Workers + static assets (`@cloudflare/vite-plugin`)
- **データ**: Cloudflare D1（ユーザーDB、バインディング名 `DB`）、Cloudflare KV（セッション + OAuth state、バインディング名 `SESSION_KV`）
  - セッション: `session:{uuid}` → `{ userId, lineUserId, role }` JSON
  - OAuth state: `oauth_state:{uuid}` → `"1"`（通常ログイン）または `{ inviteToken: "..." }` JSON（招待フロー）
- **APIサーバー**: Hono (`server/` ディレクトリ)。`worker/index.ts` でWorkerエントリポイントとしてexport
  - `server/types.ts` の `AppEnv` 型で Bindings と Variables を一元管理
  - APIルートは `server/routes/` に配置し、`server/index.ts` で登録
  - エンドポイントは `/api/*` パス配下
  - サーバー側の型チェックは `tsconfig.server.json`（`@cloudflare/workers-types` を使用）

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

## Testing (TDD)

APIルートを中心にTDDで開発する。

### テスト構成

- **テストランナー**: Vitest（設定: `vitest.config.ts`）
- **対象**: `server/**/*.test.ts`（APIルート・ミドルウェア）
- **環境**: Node.js（`@cloudflare/vitest-pool-workers` は不使用、D1/KV はモック）

### テストファイルの配置

```
server/
  __tests__/helpers.ts          # KV/D1 モックユーティリティ（共通）
  routes/__tests__/<name>.test.ts  # 各ルートのテスト
  middleware/__tests__/<name>.test.ts
```

### モックユーティリティ (`server/__tests__/helpers.ts`)

- `createMockKV(initial?)` - KVNamespace のモック（in-memory Map）
- `createMockD1(rows?)` - D1Database のモック（固定 rows を返す）
- `createEnv(overrides?)` - Bindings を組み立てる。テストごとに必要なモックだけ上書き

### Hono のテスト方法

`app.request(url, init?, env?)` を使う。第3引数に `createEnv()` を渡して Bindings を注入する。

```typescript
const env = createEnv({ SESSION_KV: createMockKV({ "session:sid": "..." }) });
const res = await app.request("http://localhost/api/auth/me",
  { headers: { Cookie: "session_id=sid" } },
  env,
);
```

### TDD の進め方

1. **テストを先に書く** - 新しいAPIエンドポイントを実装する前に、期待する動作をテストで記述する
2. **テストを失敗させる（Red）** - `pnpm test` で失敗することを確認する
3. **実装する（Green）** - テストがパスする最小限のコードを書く
4. **リファクタリング（Refactor）** - テストを維持しながらコードを整理する

### 外部 fetch のモック

LINE API など外部 HTTP 呼び出しは `vi.spyOn(global, "fetch")` でモックする。
`afterEach(() => vi.restoreAllMocks())` を忘れずに。

## Custom Agents & Skills

- **`ui-component`** エージェント - Kobalte + CSS Modules の規約に沿ったUIコンポーネント作成
- **`api-route`** エージェント - Hono の規約に沿ったAPIルート追加
- **`/verify`** スキル - lint → build → test の一括検証

## Key Conventions

- Biome デフォルト設定でlint/format (カスタム設定ファイルなし)
- TypeScript strict mode有効、未使用変数・パラメータはエラー
- ターゲット: ES2022 (アプリ) / ES2023 (ツーリング)
- コミットメッセージ、コード内コメント、consoleに表示するエラーメッセージは英語で記述
