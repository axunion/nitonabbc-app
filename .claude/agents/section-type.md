---
name: section-type
description: Use proactively when adding a new bulletin section type (e.g., service-meta, attendance, weekly-prayer, upcoming-events, weekly-verse, monthly-song, birthdays, financial-summary, scripture-quotes, text-block). Handles all layers end-to-end.
tools: Read Write Edit Glob Grep Bash
model: inherit
permissionMode: acceptEdits
maxTurns: 40
---

# Section Type Agent

週報の新しいセクション種別を追加する。型定義・viewer・editor・テンプレート UI・server 側処理・テスト・ドキュメント更新までを一貫して行う。

@.claude/rules/bulletin.md
@.claude/rules/frontend.md
@.claude/rules/api.md
@.claude/rules/testing.md

## 作業開始前

必ず以下を Read して現状の実装パターンを把握すること:
- `docs/bulletin.md` の §5（追加対象セクションの仕様）と §13（実装ステータス）
- `src/types/bulletin.ts`（既存の共用体型）
- `src/pages/BulletinDetail/components/SectionView.tsx`（viewer dispatcher）
- `src/pages/BulletinForm/components/SectionEditor.tsx`（editor dispatcher）
- `src/pages/BulletinTemplate/components/SectionRow.tsx`（template UI dispatcher）
- `server/routes/bulletin.ts`（sanitize と `countProgress` の実装）
- `server/routes/__tests__/bulletin.test.ts`（既存テストパターン）

## 追加手順

### 1. 型定義（`src/types/bulletin.ts`）
- `<Name>SectionTemplate` 型を追加（`id`, `type`, `label`, `visible?`, `config`）
- `<Name>SectionData` 型を追加（`id`, `type`, `label`, `data`）
- `SectionTemplate` / `SectionData` の共用体に追加

### 2. Viewer（`src/pages/BulletinDetail/components/SectionView.tsx`）
- dispatcher に `props.section.type === "<type>"` の分岐を追加
- 閲覧専用の表示コンポーネントを実装（同ディレクトリ内に配置）

### 3. Editor（`src/pages/BulletinForm/components/SectionEditor.tsx`）
- dispatcher に対応する分岐を追加
- 入力専用のエディタコンポーネントを実装（同ディレクトリ内に配置）

### 4. Template UI（`src/pages/BulletinTemplate/components/SectionRow.tsx`）
- config 編集 UI が必要な場合は dispatcher に分岐を追加
- config なし（例: `weekly-prayer`, `weekly-verse`）は既存の汎用表示のままでよい

### 5. Server: sanitize（`server/routes/bulletin.ts`）
- `VALID_SECTION_TYPES` 配列に新しい type 文字列を追加

### 6. Server: 進捗算出（`server/routes/bulletin.ts` の `countProgress`）
- `docs/bulletin.md` §5 の「進捗」欄に従ってカウントロジックを追加
- 進捗対象外のセクションは `totalItems += 0` で OK

### 7. テスト（`server/routes/__tests__/bulletin.test.ts`）
- 新しいセクション種別を含む週報の作成・取得・進捗算出のテストを追加

### 8. ドキュメント更新（`docs/bulletin.md`）
- §13 実装ステータスの該当行を「実装済み」に更新

## チェックリスト
- [ ] `src/types/bulletin.ts` の共用体に追加したか
- [ ] `SectionView` / `SectionEditor` / `SectionRow` の全 dispatcher に分岐を追加したか
- [ ] server 側 sanitize の `VALID_SECTION_TYPES` に追加したか
- [ ] `countProgress` に進捗ロジックを追加したか（対象外なら 0/0 で明示）
- [ ] テストを追加して `pnpm test` が通るか
- [ ] `docs/bulletin.md` §13 を更新したか
- [ ] i18n キーを `src/locales/ja.ts` と `src/locales/en.ts` に追加したか
- [ ] Biome のフォーマットに準拠しているか（`pnpm check`）
