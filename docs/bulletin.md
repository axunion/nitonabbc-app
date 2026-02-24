# 週報機能

## 背景

現在は紙で手作りして礼拝時に配布している。これをアプリで入力・生成・閲覧できるようにする。

## 入力

- **担当者**: メンバーなら誰でも入力可能
- **タイミング**: 随時（情報が決まり次第入力していく）

## 週報の構成

### 1. 礼拝プログラム

礼拝の流れはほぼ固定。毎週変わるのは各項目の詳細（賛美歌番号、聖書箇所、担当者名など）。

固定の流れの例:
- 前奏
- 賛美歌（曲名・番号）
- 祈り（担当者）
- 聖書朗読（箇所）
- 説教（タイトル、説教者）
- 献金
- 頌栄
- 祝祷
- 後奏

> プログラムのテンプレート（項目の順序・構成）は管理者が設定可能とする。

### 2. お知らせ・予定

今週・来週のイベントや連絡事項。自由テキストで複数件入力。

### 3. 奉仕当番

受付、音響、掃除など、その週の奉仕担当者一覧。

## 出力

| 形式 | 説明 |
|------|------|
| アプリ内閲覧 | メンバーがアプリを開いて今週の週報を確認 |
| 印刷用PDF | A4片面 or 両面。教会で印刷して配布用 |

## 画面構成

- **週報一覧**: 過去の週報も含めたリスト
- **週報詳細**: 選択した週の週報を表示
- **週報入力/編集**: メンバーなら誰でも入力・編集可能
- **PDF出力**: 印刷用PDFのダウンロード

## データモデル

### DB テーブル (`bulletins`)

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| service_date | TEXT UNIQUE | 礼拝日 (YYYY-MM-DD)。1日曜1件 |
| worship | TEXT (JSON) | 礼拝プログラム `Array<{ type, label, details? }>` |
| announcements | TEXT (JSON) | お知らせ `Array<{ content }>` |
| assignments | TEXT (JSON) | 奉仕当番 `Record<role, person>` |
| created_by | INTEGER FK | 作成者 (users.id) |
| updated_by | INTEGER FK | 最終更新者 (users.id) |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

## API エンドポイント

認証済みメンバー全員が CRUD 可能。`/api/bulletin` 配下。

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/bulletin` | 一覧（service_date DESC） |
| GET | `/api/bulletin/:id` | 詳細（JSON パース済み） |
| POST | `/api/bulletin` | 新規作成 → 201 |
| PUT | `/api/bulletin/:id` | 更新（部分更新可） |
| DELETE | `/api/bulletin/:id` | 削除 |

### バリデーション

- `serviceDate` 必須、`YYYY-MM-DD` 形式 → 400
- 重複 `serviceDate` → 409 Conflict
- JSON フィールドは省略可（デフォルト値使用）

## ルーティング

| パス | ページ | 説明 |
|------|--------|------|
| `/bulletin` | BulletinList | 週報一覧 |
| `/bulletin/new` | BulletinForm | 新規作成 |
| `/bulletin/:id` | BulletinDetail | 詳細表示 |
| `/bulletin/:id/edit` | BulletinForm | 編集 |

## 実装ステータス

| 項目 | ステータス |
|------|-----------|
| DB スキーマ | 実装済み |
| CRUD API + テスト | 実装済み |
| 一覧・詳細・入力フォーム UI | 実装済み |
| ダッシュボード連携 | 実装済み |
| テンプレート管理（管理者） | 未実装 |
| PDF 出力 | 未実装 |
