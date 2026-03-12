# 週報機能

## 背景

現在は紙で手作りして礼拝時に配布している。これをアプリで入力・生成・閲覧できるようにする。

## 入力

- **担当者**: メンバーなら誰でも入力可能
- **タイミング**: 随時（情報が決まり次第入力していく）
- **担当割り当て**: 管理者が各項目にメンバーを割り当て可能（UIレベルの制限、他メンバーも編集可）

## 週報の構成

### 1. 礼拝プログラム

礼拝の流れはほぼ固定。毎週変わるのは各項目の詳細（賛美歌番号、聖書箇所、担当者名など）。

固定の流れの例:
- 前奏
- 賛美歌（曲名・番号）
- 祈り（担当者）
- 聖書朗読（箇所）
- 説教（タイトル、説教者、聖書箇所）
- 献金
- 頌栄
- 祝祷
- 後奏

> プログラムのテンプレート（項目の順序・構成・入力フィールド種別）は管理者が設定可能とする。

### 2. お知らせ・予定

今週・来週のイベントや連絡事項。自由テキストで複数件入力。

### 3. 奉仕当番

受付、音響、掃除など、その週の奉仕担当者一覧。

## 出力

| 形式 | 説明 |
|------|------|
| アプリ内閲覧 | メンバーがアプリを開いて今週の週報を確認 |
| 印刷用PDF | A4片面 or 両面。教会で印刷して配布用 |

## データモデル

### テンプレート型

```typescript
type InputType = "text" | "number" | "member" | "scripture" | "none";

type TemplateField = {
  key: string;        // e.g. "title", "person"
  label: string;      // e.g. "曲名", "担当者"
  inputType: InputType;
};

type TemplateItem = {
  type: string;       // 識別子 (e.g. "hymn", "sermon")
  label: string;      // 表示名 (e.g. "賛美歌", "説教")
  inputType?: InputType;      // 単一フィールド（デフォルト: "text"）
  fields?: TemplateField[];   // 複合フィールド（fields がある場合 inputType は無視）
};
```

- `"text"`: 自由テキスト入力
- `"number"`: 数値入力（賛美歌番号など）
- `"member"`: メンバー選択ドロップダウン
- `"scripture"`: 聖書箇所用テキスト（プレースホルダーが異なる）
- `"none"`: 前奏・後奏のように入力不要な項目
- `fields`: 説教→タイトル+説教者+聖書箇所のように1項目を複数サブフィールドに分割

### WorshipItem 型

```typescript
type WorshipItem = {
  type: string;
  label: string;
  details?: string;                      // 単一フィールド（後方互換）
  fieldValues?: Record<string, string>;  // 複合フィールドの値
  assigneeId?: number | null;            // 担当メンバーの user ID
};
```

**後方互換**: 既存データは `details` のみで動作し続ける。DBスキーマ変更は不要（JSON列）。

### DB テーブル (`bulletins`)

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| service_date | TEXT UNIQUE | 礼拝日 (YYYY-MM-DD)。1日曜1件 |
| worship | TEXT (JSON) | 礼拝プログラム `Array<WorshipItem>` |
| announcements | TEXT (JSON) | お知らせ `Array<{ content }>` |
| assignments | TEXT (JSON) | 奉仕当番 `Record<role, person>` |
| created_by | INTEGER FK | 作成者 (users.id) |
| updated_by | INTEGER FK | 最終更新者 (users.id) |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

### 担当割り当てモデル

- 割り当ては `worship` JSON 内の各項目に `assigneeId` で保存（別テーブル不要）
- 権限制限は **UI レベルのみ**（30名の教会、信頼ベースで十分）
- 担当者以外も編集可能だが、UIでは担当項目のみハイライト表示

## 画面構成

### BulletinList — 週次管理ダッシュボード

- 「次の日曜日の週報を作成」ボタン（ワンタップ生成）
- 直近の週報を大きく表示 + 入力進捗バー
- 未入力項目の一覧表示
- 過去の週報はアーカイブリスト

### BulletinForm — 入力/編集

- テンプレートの `inputType` に応じたフィールドレンダリング
- 複合フィールドのサブフィールド表示
- メンバー割り当てドロップダウン（管理者向け）
- 担当項目のハイライト表示

### BulletinDetail — 詳細表示

- 複合フィールドの構造化表示
- 担当者名表示
- 自分の未入力項目への「入力する」CTA

### BulletinTemplate — テンプレート管理（管理者のみ）

- 各項目に `inputType` セレクター追加
- 複合フィールドモードの切替・サブフィールド管理

## API エンドポイント

### 週報 CRUD

認証済みメンバー全員が CRUD 可能。`/api/bulletin` 配下。

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/bulletin` | 一覧（service_date DESC）。`totalItems`, `filledItems` を含む |
| GET | `/api/bulletin/:id` | 詳細（JSON パース済み） |
| POST | `/api/bulletin` | 新規作成 → 201 |
| PUT | `/api/bulletin/:id` | 更新（部分更新可） |
| DELETE | `/api/bulletin/:id` | 削除 |

### 自動生成

| Method | Path | 認可 | 説明 |
|--------|------|------|------|
| POST | `/api/bulletin/generate` | 認証済み全員 | 次の日曜日の週報をテンプレートから自動生成 → 201 |

### メンバー一覧

| Method | Path | 認可 | 説明 |
|--------|------|------|------|
| GET | `/api/members` | 認証済み全員 | アクティブメンバー一覧 `{id, name}[]` |

### テンプレート管理

| Method | Path | 認可 | 説明 |
|--------|------|------|------|
| GET | `/api/bulletin-template` | 認証済み全員 | テンプレート取得。未設定時はデフォルト値 |
| PUT | `/api/bulletin-template` | 管理者のみ | テンプレート全体を置換保存 |

テンプレートデータ形式: `Array<TemplateItem>`。DB の `settings` テーブルに `worship_template` キーで JSON 格納。

### バリデーション

- `serviceDate` 必須、`YYYY-MM-DD` 形式 → 400
- 重複 `serviceDate` → 409 Conflict
- JSON フィールドは省略可（デフォルト値使用）

## ルーティング

| パス | ページ | 説明 |
|------|--------|------|
| `/bulletin` | BulletinList | 週報一覧（週次管理ダッシュボード） |
| `/bulletin/new` | BulletinForm | 新規作成 |
| `/bulletin/:id` | BulletinDetail | 詳細表示 |
| `/bulletin/:id/edit` | BulletinForm | 編集 |
| `/admin/bulletin-template` | BulletinTemplate | テンプレート管理（管理者のみ） |

## 実装ステータス

| 項目 | ステータス |
|------|-----------|
| DB スキーマ | 実装済み |
| CRUD API + テスト | 実装済み |
| 一覧・詳細・入力フォーム UI | 実装済み |
| ダッシュボード連携 | 実装済み |
| テンプレート管理（管理者） | 実装済み |
| テンプレート拡張（inputType/fields） | 実装済み |
| メンバー一覧 API | 実装済み |
| 自動生成 API | 実装済み |
| フォームリワーク（型対応入力・割り当て） | 実装済み |
| 週次管理ダッシュボード UI | 実装済み |
| 詳細ページ更新（複合フィールド・担当者） | 実装済み |
| PDF 出力 | 未実装 |
