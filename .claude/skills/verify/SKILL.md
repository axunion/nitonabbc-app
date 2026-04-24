---
name: verify
description: >
  lint・ビルド・テストを一括検証するスキル。実装後・コミット前の品質確認に必ず使うこと。
  「ビルド通る？」「エラーないか確認して」「チェックして」「テスト走らせて」「lint エラーある？」
  など検証を求める場面はもちろん、コード変更が完了した後は積極的にこのスキルを呼び出すこと。
allowed-tools: Bash
---

lint（Biome）、ビルド（tsc + Vite）、テスト（Vitest）を順番に実行し、結果を報告してください。

1. `pnpm check` を実行
   - エラーがあれば `pnpm check:write` で自動修正を試み、再度 `pnpm check` で確認
2. `pnpm build` を実行
3. `pnpm test` を実行

すべて成功した場合は簡潔に報告。失敗した場合はエラー内容と修正方針を提示してください。
