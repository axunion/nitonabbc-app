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

## 作業開始前

必ず以下を Read して既存の型定義とルートパターンを把握すること:
- `server/types.ts`
- 既存ルートファイル1つ（`server/routes/` 配下）

## 規約

### ファイル構成
- ルート定義: `server/routes/<resource>.ts`
- アプリ登録: `server/index.ts` にルートを追加
- ミドルウェア（共通処理が必要な場合）: `server/middleware/<name>.ts`

### Hono ルートの書き方
- 1ファイル1リソース（RESTful に整理）
- `new Hono()` でルーターを作成し、named export する
- `server/index.ts` で `.route()` を使って登録
- Node.js API 使用不可（`fs`, `path` 等）、環境変数は `c.env` 経由

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

### レスポンス規約
- 成功: `c.json(data)` または `c.json(data, statusCode)`
- エラー: `c.json({ error: "message" }, statusCode)`
- 空レスポンス: `c.body(null, 204)`

## チェックリスト
- [ ] ルートファイルが `server/routes/` に配置されているか
- [ ] `server/index.ts` にルート登録されているか
- [ ] エンドポイントパスが `/api/*` 配下になるか
- [ ] レスポンス形式が規約に沿っているか
- [ ] Node.js 固有の API を使っていないか
- [ ] Biome のフォーマットに準拠しているか（`pnpm check`）
