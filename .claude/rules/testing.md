---
paths:
  - "server/**/*.test.ts"
  - "server/__tests__/**"
  - "vitest.config.ts"
---

# Testing Rules (TDD)

APIルートを中心にTDDで開発する。

## テスト対象の方針

**バックエンド（`server/`）のみをテスト対象とする。これは意図的な設計判断。**

- ビジネスロジックの大半はサーバー側にある
- フロントエンドは小規模（約30名）で管理者が常駐しており、目視確認で十分カバーできる
- Solid.js hooksのテストはランタイム依存が強く、費用対効果が低い
- フロントの純粋ユーティリティ（`src/utils/`）もバックエンドテストで間接的にカバーされる

## テスト構成

- **テストランナー**: Vitest（設定: `vitest.config.ts`）
- **対象**: `server/**/*.test.ts`（APIルート・ミドルウェア）のみ
- **環境**: Node.js（`@cloudflare/vitest-pool-workers` は不使用、D1/KV はモック）

## テストファイルの配置

```
server/
  __tests__/helpers.ts          # KV/D1 モックユーティリティ（共通）
  routes/__tests__/<name>.test.ts  # 各ルートのテスト
  middleware/__tests__/<name>.test.ts
```

## モックユーティリティ (`server/__tests__/helpers.ts`)

- `createMockKV(initial?)` - KVNamespace のモック（in-memory Map）
- `createMockD1(rows?)` - D1Database のモック（固定 rows を返す）
- `createEnv(overrides?)` - Bindings を組み立てる。テストごとに必要なモックだけ上書き

## Hono のテスト方法

`app.request(url, init?, env?)` を使う。第3引数に `createEnv()` を渡して Bindings を注入する。

```typescript
const env = createEnv({ SESSION_KV: createMockKV({ "session:sid": "..." }) });
const res = await app.request("http://localhost/api/auth/me",
  { headers: { Cookie: "session_id=sid" } },
  env,
);
```

## TDD の進め方

1. **テストを先に書く** - 期待する動作をテストで記述する
2. **テストを失敗させる（Red）** - `pnpm test` で失敗を確認
3. **実装する（Green）** - テストがパスする最小限のコードを書く
4. **リファクタリング** - テストを維持しながらコードを整理

## 外部 fetch のモック

LINE API など外部 HTTP 呼び出しは `vi.spyOn(global, "fetch")` でモックする。
`afterEach(() => vi.restoreAllMocks())` を忘れずに。
