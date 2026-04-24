---
paths:
  - "src/pages/Bulletin*/**"
  - "src/components/Section*/**"
  - "server/routes/bulletin*.ts"
  - "src/types/bulletin.ts"
  - "src/utils/bulletin.ts"
  - "src/api/bulletin.ts"
---

# Bulletin Rules

週報のセクションブロックモデルに関する規約。

@docs/bulletin.md

## 型システム

- `SectionTemplate` / `SectionData` は判別共用体（`type` フィールドで narrow する）
- 未知の `type` は `UnknownSection` で受け取り、表示・編集ともにスキップする（前方互換）
- `AnySection = SectionData | UnknownSection` を使い、`unknown` のままにしない
- 新しいセクション種別を追加する場合は `src/types/bulletin.ts` の共用体に追加し、全ての dispatch 箇所に case を追加する

## Dispatcher パターン

セクション種別ごとの UI は 3 つの dispatcher を通じて提供する。新しい種別を追加する際は **全て** に対応する分岐を追加すること:

| ファイル | 役割 |
|---------|------|
| `src/pages/BulletinDetail/components/SectionView.tsx` | 閲覧 UI |
| `src/pages/BulletinForm/components/SectionEditor.tsx` | 入力 UI |
| `src/pages/BulletinTemplate/components/SectionRow.tsx` | テンプレート管理 UI |

## サーバー側の制約

- テンプレート保存時（`PUT /api/bulletin-template`）は必ず sanitize する:
  - `id` の重複を 400 で弾く
  - `type` が有効値であることを検証する（想定外の type は保存しない）
- 進捗算出（`countProgress`）は `server/routes/bulletin.ts` で管理。新しい種別を追加したら対応するカウントロジックを追加する

## セクション追加の手順（概略）

1. `src/types/bulletin.ts` に `<Name>SectionTemplate` / `<Name>SectionData` 型を追加し、共用体に追加
2. `SectionView` / `SectionEditor` / `SectionRow` の dispatcher に case 追加
3. server 側 sanitize と `countProgress` に対応ロジック追加
4. テスト（`server/routes/__tests__/bulletin.test.ts`）に新しい種別のケースを追加
5. `docs/bulletin.md` の §13 実装ステータスを更新

詳細なセクション種別の仕様（config / data 形式）は `@docs/bulletin.md` の §5 カタログを参照。
