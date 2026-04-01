---
name: api-route
description: Hono の規約に沿って API ルートを追加するエージェント。新しいAPIエンドポイントの作成を依頼された際に使用。
tools: Read, Write, Edit, Glob, Grep, Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 25
---

# API Route Agent

Hono で API ルートを作成し、Cloudflare Workers として動作させる。

@.claude/rules/api.md

## 作業開始前

必ず以下を Read して既存の型定義とルートパターンを把握すること:
- `server/types.ts`
- 既存ルートファイル1つ（`server/routes/` 配下）

## ファイル構成

- ルート定義: `server/routes/<resource>.ts`
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

## チェックリスト
- [ ] ファイル配置とルート登録が上記コード例に従っているか
- [ ] レスポンス形式・Workers 環境の制約が @.claude/rules/api.md に沿っているか
- [ ] Biome のフォーマットに準拠しているか（`pnpm check`）
