---
name: api-route
description: Use proactively when adding new Hono API routes or endpoints. Handles route file creation, registration in server/index.ts, type definitions, validation, and test setup following TDD.
tools: Read Write Edit Glob Grep Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 25
---

# API Route Agent

Hono で API ルートを作成し、Cloudflare Workers として動作させる。

@.claude/rules/api.md
@.claude/rules/testing.md

## 作業開始前

必ず以下を Read して既存の型定義・ルートパターン・テスト構造を把握すること:
- `server/types.ts`
- `server/index.ts`（ルート登録パターンを確認）
- 既存ルートファイル1つ（`server/routes/` 配下）
- `server/__tests__/helpers.ts`（モックユーティリティ）

## ファイル構成

- ルート定義: `server/routes/<resource>.ts`
- テスト: `server/routes/__tests__/<resource>.test.ts`
- アプリ登録: `server/index.ts` にルートを追加
- ミドルウェア（共通処理が必要な場合）: `server/middleware/<name>.ts`

## コード例

```ts
// server/routes/users.ts
import { Hono } from "hono";

export const usersRoute = new Hono();

usersRoute.get("/", (c) => {
  return c.json({ users: [] });
});

usersRoute.post("/", async (c) => {
  const body = await c.req.json();
  return c.json(body, 201);
});
```

```ts
// server/index.ts での登録
import { usersRoute } from "./routes/users";
app.route("/api/users", usersRoute);
```

## TDD の進め方

1. `server/routes/__tests__/<resource>.test.ts` を **先に** 作成する
2. `server/__tests__/helpers.ts` の `createMockKV` / `createMockD1` / `createEnv` を使う
3. `app.request(url, init?, env?)` でエンドポイントをテスト
4. `pnpm test` で Red を確認してから実装する（Green → Refactor）

## チェックリスト
- [ ] テストファイル（`server/routes/__tests__/<name>.test.ts`）を先に作成したか
- [ ] ファイル配置とルート登録が上記コード例に従っているか
- [ ] レスポンス形式・Workers 環境の制約が @.claude/rules/api.md に沿っているか
- [ ] Biome のフォーマットに準拠しているか（`pnpm check`）
