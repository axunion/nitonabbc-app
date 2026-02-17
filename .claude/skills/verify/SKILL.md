---
name: verify
description: lint → build → test の一括検証。コミット前の確認に使用。
---

lint（Biome）、ビルド（tsc + Vite）、テスト（Vitest）を順番に実行し、結果を報告してください。

1. `pnpm check` を実行
   - エラーがあれば `pnpm check:write` で自動修正を試み、再度 `pnpm check` で確認
2. `pnpm build` を実行
3. `pnpm test` を実行

すべて成功した場合は簡潔に報告。失敗した場合はエラー内容と修正方針を提示してください。
