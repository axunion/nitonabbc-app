---
paths:
  - "server/**"
  - "worker/**"
---

# API Rules

## Hono サーバー構成

- ルート定義: `server/routes/<resource>.ts`（1ファイル1リソース）
- ルート登録: `server/index.ts` で `.route("/api/<resource>", resourceRoute)` で追加
- ミドルウェア: `server/middleware/<name>.ts`
- 型定義: `server/types.ts` の `AppEnv` で Bindings と Variables を一元管理
- Worker エントリ: `worker/index.ts` で Hono app を re-export
- 型チェック: `tsconfig.server.json`（`@cloudflare/workers-types` 使用）

## レスポンス規約

- 成功: `c.json(data)` または `c.json(data, statusCode)`
- エラー: `c.json({ error: "message" }, statusCode)`
- 空レスポンス: `c.body(null, 204)`

## Cloudflare Workers 環境

- Node.js API 使用不可（`fs`, `path` 等）
- 環境変数・Bindings は `c.env` 経由でアクセス
- D1 バインディング: `DB`、KV バインディング: `SESSION_KV`
- セッション: `session:{uuid}` → `{ userId, lineUserId, role }` JSON
- OAuth state: `oauth_state:{uuid}` → `"1"` or `{ inviteToken: "..." }` JSON
