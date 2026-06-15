# 週報機能

## 1. 概要と背景

仁戸名聖書バプテスト教会の週報を、アプリ上で入力・整理・閲覧・PDF 出力できるようにする機能。
実際の週報（紙）は、礼拝プログラム・出席人数・曜日別祈りの課題・今週のみことば・誕生日・財務報告など、多彩なセクションで構成されている。

**セクションブロックモデル**として設計されており、週報はセクションの順序付きリストで表現する。

### 利用者

| ロール | できること |
|--------|-----------|
| メンバー | 週報の閲覧・入力（全セクション） |
| 管理者 | 上記 + テンプレート管理・教会プロフィール設定 |

---

## 2. 設計方針

- **セクションブロック**: 週報 = 型付きセクションの順序付きリスト。種別・表示/非表示を構成できる
- **構造と値の分離**: テンプレートが「どのセクションが何の順番であるか」を定義し、週報データは各セクションの値だけを保持する
- **デフォルト値**: テンプレートには教会の標準的な礼拝形式に合わせた初期値があらかじめ設定されており、管理者はそれを必要に応じて編集する
- **月次データも週次で管理**: 今月の歌・誕生日・祈りの課題曜日表などは週報の通常セクションとして扱い、直近週報からのコピーで差分編集する
- **複数サービス**: 朝礼拝・午後集会それぞれに `worship-program` セクションをテンプレートで複数配置する
- **PDF 出力は将来フェーズ**: 印刷レイアウトはその実装時に設計する

---

## 3. 教会プロフィール（将来フェーズ）

教会名・住所・牧師名・年間テーマ・連絡先など、週をまたいで変わらない情報は `settings` テーブルに `church_profile` キーで保存し、週報詳細画面のヘッダー部に表示する。週報ごとの上書きは行わない。編集は管理者のみ（パス: `/admin/church-profile`）。

フィールド: `name`, `pastors[]`, `address`, `phone`, `website`, `foundedDate`, `yearlyTheme`

---

## 4. 週報の構造モデル

### テンプレート（構造定義）

テンプレートはセクションの配列。順序 = 週報内での表示順。

```
BulletinTemplate.sections[]
  ├── { id, type, label, config }   例: id="morning", type="worship-program", label="午前礼拝"
  ├── { id, type, label, config }   例: id="afternoon", type="worship-program", label="午後集会"
  ├── { id, type, label, config }   例: id="news", type="announcements", label="報告・お知らせ"
  └── ...
```

`id` はテンプレート内で一意の安定キー。セクション種別ごとに `config` の形が異なる（§5 参照）。

### 週報データ（値）

週報は同じセクション配列を持ち、`id` でテンプレートと対応する。各セクションは `data` フィールドに値を保持。

```
BulletinDetail.sections[]
  ├── { id="morning", type, label, data: WorshipItem[] }
  ├── { id="afternoon", type, label, data: WorshipItem[] }
  └── ...
```

### 進捗カウント

`totalItems` / `filledItems` はサーバーがセクション種別ごとの規則で合算して返す。進捗対象外のセクション（出席数・財務など）は 0/0 として扱う。

---

## 5. セクション種別カタログ

すべてのセクションはテンプレートレベルで `visible: boolean`（既定 `true`）を持ち、非表示にできる。

### `service-meta` — サービス基本情報

司会・奏楽・開始時刻など、礼拝プログラムに紐づくメタ情報。`worship-program` の直前に置くことを想定。

> `assignments`（奉仕当番）と内容が重複するため、デフォルトテンプレートには含めない。型・API・UI は過去データとの互換のため維持する。

| テンプレート設定フィールド | 説明 |
|--------------------------|------|
| `fieldDefs[]` | `{ key, label, inputType }` の配列。`inputType` は `"text"` / `"member"` / `"time"` |

データ例: `{ fieldValues: { chair: "3", pianist: "7" } }` （`inputType: "member"` フィールドはメンバー ID 文字列）

進捗: `fieldDefs` の件数 / 入力済みの件数

---

### `worship-program` — 礼拝プログラム

礼拝の進行順序と各項目の詳細。同一週報内に複数配置可能（朝礼拝・午後集会など）。

| テンプレート設定フィールド | 説明 |
|--------------------------|------|
| `items[]` | `TemplateItem[]`（後述） |

**`TemplateItem` の構造**

```
TemplateItem {
  type: string          // 識別キー（例: "hymn", "sermon"）
  label: string         // 表示名
  inputType?: InputType // "text" | "member" | "none"（fields と排他）
  fields?: TemplateField[]
  role?: string         // inputType="member" のとき、候補メンバーを絞り込む奉仕役割（例: "説教"）
}

TemplateField {
  key: string
  label: string
  inputType: InputType
  role?: string         // 同上
}
```

`role` が指定された `inputType: "member"` フィールドは、`serviceRoles` にその役割を持つメンバーのみが選択肢に表示される。`role` が未指定の場合は全アクティブメンバーが表示される。

**データ構造**

```
WorshipItem {
  type: string
  label: string
  details?: string                    // inputType: "text" / "member" のとき使用
  fieldValues?: Record<string, string> // compound fields モード
}
```

`inputType: "member"` フィールドの値（`details` または `fieldValues[key]`）はメンバーの `id` を文字列化したもの。

データ例:
```json
[
  { "type": "hymn", "label": "賛美歌", "details": "#179" },
  { "type": "sermon", "label": "説教", "fieldValues": { "title": "主の恵み", "preacher": "3", "scripture": "ヨハネ 3:16" } }
]
```

進捗: `inputType: "none"` 除外、compound は field 単位で集計

---

### `announcements` — 報告・お知らせ

自由テキストの告知リスト。任意の `heading`（例: "報告" / "お知らせ"）を各アイテムに付けられる。

| テンプレート設定フィールド | 説明 |
|--------------------------|------|
| `subHeadings[]` | 入力補完用のカテゴリラベル候補（任意） |

データ例: `[ { heading: "報告", content: "先週の礼拝に..." }, { heading: "お知らせ", content: "復活祭特別献金..." } ]`

進捗: アイテムが 1 件以上あれば 1/1

---

### `assignments` — 奉仕当番

役割と担当メンバーの対応。今週・次週など、別インスタンスを並べて使う。

| テンプレート設定フィールド | 説明 |
|--------------------------|------|
| `roles[]` | 役割名の配列（例: `["司会", "奏楽", "特賛", "受付"]`） |

役割ごとにメンバー選択 UI が表示される。役割名が `SERVICE_ROLES`（司会・奏楽・説教・受付）に含まれる場合は、その役割を `serviceRoles` に持つメンバーのみを選択肢に表示する。含まれない役割（特賛など）は全アクティブメンバーを表示する。

データは `Record<役割名, メンバーID文字列>`。

データ例: `{ "司会": "5", "奏楽": "7", "受付": "12" }`

進捗: `roles.length` のうち入力済みの件数

---

### `attendance` — 先週の出席人数

先週の集会ごとの出席者数。

| テンプレート設定フィールド | 説明 |
|--------------------------|------|
| `meetings[]` | `{ key, label }` の配列（例: `[{ key: "morning", label: "朝礼拝" }, ...]`） |

データ例: `{ morning: { adults: "30", children: "2" }, cs: { adults: "6" } }`

各アイテムは `adults`, `children`, `note` を持てる。進捗: 対象外

---

### `weekly-prayer` — 曜日別祈りの課題

日〜土の各曜日に複数の祈り課題を持てる。テンプレートにデフォルト課題文を設定可能。

| テンプレート設定フィールド | 説明 |
|--------------------------|------|
| `days[]` | `WeeklyPrayerDay[]`（後述） |

**`WeeklyPrayerDay` の構造**

```
WeeklyPrayerDay {
  key: string      // 曜日キー（例: "日", "月"）
  label: string    // 表示名（例: "日曜日"）
  defaults: string[] // デフォルト課題文（週報生成時に初期値としてコピー）
}
```

データ: `Record<曜日キー, string[]>`（1 曜日に複数の課題文を保持）

データ例:
```json
{
  "日": ["牧師・伝道師の働き"],
  "月": ["兄弟姉妹の健康"],
  "火": ["求道者の救い"],
  "水": ["青年・子どもたちの信仰", "CS の奉仕者"],
  "木": ["日本の教会全体のリバイバル"],
  "金": ["世界宣教と宣教師"],
  "土": ["礼拝の準備・教会のリーダーシップ"]
}
```

進捗: 設定された曜日数のうち 1 件以上の課題文が入力されている曜日数

---

### `upcoming-events` — 今後の予定

日付・内容ペアのリスト。

テンプレート設定: なし

データ例: `[ { date: "2026-05-04〜06", description: "全国青年キャンプ" }, { date: "2026-05-10", description: "母の日合同礼拝" } ]`

進捗: 対象外

---

### `weekly-verse` — 今週のみことば

聖書箇所と本文。

テンプレート設定: なし

データ例: `{ reference: "ローマ人への手紙 8:28", text: "神を愛する人たち、すなわち..." }`

進捗: `text` が入力されていれば 1/1

---

### `monthly-song` — 今月の歌

今月の賛美歌タイトルと歌詞。

テンプレート設定: なし

データ例: `{ title: "暗闇 過ぎ去って", lyrics: "暗闇 過ぎ去って 夜明けが来る...\n（全6番）" }`

進捗: `title` が入力されていれば 1/1

---

### `birthdays` — 今月の誕生日

月内の誕生日リスト。

テンプレート設定: なし

データ例: `[ { day: "2日", name: "勇人兄" }, { day: "6日", name: "太秀師" } ]`

進捗: 対象外

---

### `financial-summary` — 財務報告（抜粋）

会堂献金積立残高など、定期的に掲載する財務情報。

| テンプレート設定フィールド | 説明 |
|--------------------------|------|
| `items[]` | `{ key, label, unit? }` の配列（例: `[{ key: "hall_fund", label: "会堂献金積立", unit: "円" }]`） |

データ例: `{ hall_fund: { amount: "2,963,176 + 12,800,000", note: "車購入貸出 530,200円" } }`

進捗: 対象外

---

### `scripture-quotes` — 引用聖句

礼拝中に使用した聖書箇所のリスト。

テンプレート設定: なし

データ例: `[ { reference: "ガラテヤ人への手紙 6:2", text: "互いの重荷を負い合いなさい。..." } ]`

進捗: 対象外

---

### `text-block` — 汎用テキスト

見出しと本文の自由記述。その他のコンテンツに使うフォールバック。

テンプレート設定: なし

データ例: `{ heading: "今月の歌について", body: "全6番からなる賛美歌です。" }`

進捗: 対象外

---

## 6. データモデル

型の実装は `src/types/bulletin.ts`（フロントエンド）および `server/db/types.ts`（サーバー）で行う。ここでは構造の概要のみ示す。

### テンプレート

| フィールド | 説明 |
|-----------|------|
| `sections[]` | `SectionTemplate` の配列。順序 = 表示順 |
| `sections[].id` | テンプレート内で一意の安定キー |
| `sections[].type` | セクション種別（§5 の type 文字列） |
| `sections[].label` | 見出し（例: "午前礼拝", "報告・お知らせ"） |
| `sections[].visible` | 表示/非表示フラグ（既定 `true`） |
| `sections[].config` | 種別固有の設定（§5 参照） |

settings テーブルのキー: `bulletin_template`

### 週報データ

| フィールド | 説明 |
|-----------|------|
| `id` | 自動採番 |
| `serviceDate` | 礼拝日 (YYYY-MM-DD) |
| `sections[]` | `SectionData` の配列（テンプレートと `id` で対応） |
| `sections[].data` | 種別固有の値（§5 参照） |
| `totalItems` | 進捗対象のフィールド総数（サーバー算出） |
| `filledItems` | 入力済みフィールド数（同上） |
| `createdBy` / `updatedBy` | ユーザー ID |
| `createdAt` / `updatedAt` | 日時 |

### メンバーの奉仕役割

`users` テーブルの `service_roles` カラム（JSON 配列）にメンバーの奉仕役割を保存する。

```
serviceRoles: string[]  // 例: ["司会", "奏楽"]
```

定数 `SERVICE_ROLES = ["司会", "奏楽", "説教", "受付"] as const` が `server/db/types.ts` / `src/types/bulletin.ts` で共有定義されている。

担当者選択 UI は、フィールドの `role` プロパティを参照してメンバーを絞り込む:
- `role` 指定あり → `member.serviceRoles.includes(role)` で絞り込み
- `role` 指定なし → 全アクティブメンバーを表示

### 教会プロフィール

settings テーブルのキー: `church_profile`

フィールド: `name`, `pastors[]`, `address`, `phone`, `website`, `foundedDate`, `yearlyTheme`

---

## 7. DB スキーマ

### `bulletins` テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| service_date | TEXT UNIQUE | 礼拝日 (YYYY-MM-DD) |
| sections | TEXT (JSON) | `SectionData[]` |
| created_by | INTEGER FK | 作成者 (users.id) |
| updated_by | INTEGER FK | 最終更新者 (users.id) |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

スキーマの正は `server/db/schema.ts`（Drizzle）。

### `settings` テーブルの利用キー

| key | 内容 |
|-----|------|
| `bulletin_template` | テンプレート（`SectionTemplate[]`） |
| `church_profile` | 教会プロフィール |

---

## 8. API エンドポイント

### 週報 CRUD

認証済みメンバー全員が CRUD 可能。`/api/bulletin` 配下。

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/bulletin` | 一覧（service_date DESC）。`totalItems`, `filledItems` を含む |
| GET | `/api/bulletin/:id` | 詳細（sections JSON パース済み） |
| POST | `/api/bulletin` | 新規作成 → 201 |
| PUT | `/api/bulletin/:id` | 更新（sections 全体差し替え） |
| DELETE | `/api/bulletin/:id` | 削除 |

### 自動生成

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/bulletin/generate` | 次の日曜日の週報を生成 → 201 |

生成ロジック:
- テンプレートからセクション構造を生成
- `weekly-prayer` はテンプレートの `config.days[*].defaults` を初期値としてコピー
- 直近の週報が存在する場合、繰り返し性が高いセクション（`weekly-prayer`, `assignments`, `monthly-song`, `birthdays` など）は値をコピー
- `announcements`, `upcoming-events`, `weekly-verse` は空で初期化

### テンプレート管理

| Method | Path | 認可 | 説明 |
|--------|------|------|------|
| GET | `/api/bulletin-template` | 認証済み全員 | テンプレート取得。未設定時はデフォルト値 |
| PUT | `/api/bulletin-template` | 管理者のみ | テンプレート全体を置換保存 |
| DELETE | `/api/bulletin-template` | 管理者のみ | 保存済みテンプレートを削除し、デフォルトテンプレートを返す（200） |

デフォルトテンプレートは教会の標準的な週報構成（全 14 セクション: `worship-program` ×2・`announcements`・`assignments` ×2・`attendance`・`weekly-prayer`・`upcoming-events`・`weekly-verse`・`monthly-song`・`birthdays`・`financial-summary`・`scripture-quotes`・`text-block`）。`service-meta` は `assignments` と重複するためデフォルトには含めない。定義: `server/routes/bulletinTemplateDefaults.ts`

### 教会プロフィール（将来フェーズ）

| Method | Path | 認可 | 説明 |
|--------|------|------|------|
| GET | `/api/church-profile` | 認証済み全員 | 教会プロフィール取得 |
| PUT | `/api/church-profile` | 管理者のみ | 教会プロフィール保存 |

### メンバー一覧

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/members` | アクティブメンバー `{ id, name, serviceRoles: string[] }[]` |

### バリデーション

- `serviceDate` 必須、`YYYY-MM-DD` 形式 → 400
- 重複 `serviceDate` → 409 Conflict
- `sections` 省略可（デフォルト: `[]`）
- テンプレートの各 `type` が有効値であること → 400
- テンプレートの `id` 重複 → 400

---

## 9. 画面構成（Web）

### BulletinList — 週次管理ダッシュボード

- 「次の日曜日の週報を作成」ボタン
- 週報一覧（service_date DESC）、各行に進捗バー（`filledItems / totalItems`）
- 未入力項目の概要表示

### BulletinDetail — 詳細表示

- 教会プロフィール（`church_profile`）をヘッダーに表示（将来フェーズ）
- セクションを定義順に縦スクロールで表示
- セクション種別ごとに専用の閲覧コンポーネント（出席は表組み、曜日別祈りは曜日ごとの課題リストなど）
- 入力未完了の場合に「入力する」CTA を表示（`totalItems > 0 && filledItems < totalItems` で判定）
- `assignments` の担当者表示: メンバー ID をメンバー名に解決して表示

### BulletinForm — 入力/編集

- セクションごとに専用エディタ UI。フォームでは値の入力のみ
- `worship-program`: 進行項目ごとの入力フォーム。`inputType: "member"` フィールドはメンバーセレクタを表示。フィールドの `role` 指定がある場合（例: 説教者 → 役割 "説教"）は該当役割を持つメンバーのみ表示
- `service-meta`: member セレクタ / テキスト入力
- `assignments`: 役割ごとにメンバー選択 UI。`SERVICE_ROLES` に含まれる役割（司会/奏楽/説教/受付）は対応する `serviceRoles` を持つメンバーのみ表示。それ以外（特賛など）は全メンバー表示
- `attendance`: 集会ごとの大人/子供数入力（セクション名は「先週の出席人数」）
- `weekly-prayer`: 曜日ごとに課題文を複数追加/削除可能
- `monthly-song`: タイトル入力 + 歌詞テキストエリア
- `upcoming-events`: 日付 + 内容のペア追加/削除

### BulletinTemplate — テンプレート管理（管理者のみ）

テンプレートの全セクションを縦に並べて一覧表示し、各セクションのラベルと設定をインラインで編集する。

- 全セクションを常時表示（アコーディオンなし）
- 各セクションのラベルを直接編集できる
- 各セクションの表示/非表示を切り替えられる
- config が必要なセクション（`worship-program`・`assignments`・`attendance`・`service-meta`・`financial-summary`・`announcements`・`weekly-prayer`）は、セクション内にインラインでエディタを表示する
  - `weekly-prayer` は曜日別のデフォルト課題文をリスト形式で追加/削除/編集できる
- テンプレートにはデフォルト値があらかじめ設定されており、管理者は変更が必要な箇所だけを編集する
- 「デフォルトに戻す」ボタンでテンプレート全体を初期構成に戻せる（確認ダイアログ付き）
- PC ではセクション一覧の目次（サイドナビ）と画面下部固定の保存バーを表示する

### ChurchProfile — 教会プロフィール（管理者のみ、将来フェーズ）

- 教会名・牧師名・住所・連絡先・年間テーマなどの編集
- 保存後は全週報のヘッダーに即時反映

---

## 10. PDF 出力（将来フェーズ）

- 出力形式: A4 縦、印刷用 PDF
- `visible: true` のセクションのみ、テンプレートの定義順に流し込む
- ページブレークはセクション境界を優先
- 教会プロフィールを 1 ページ目ヘッダーに掲載
- 実装時に別プランで設計する

---

## 11. ルーティング

| パス | ページ | 説明 |
|------|--------|------|
| `/bulletin` | BulletinList | 週報一覧 |
| `/bulletin/new` | BulletinForm | 新規作成 |
| `/bulletin/:id` | BulletinDetail | 詳細表示 |
| `/bulletin/:id/edit` | BulletinForm | 編集 |
| `/admin/bulletin-template` | BulletinTemplate | テンプレート管理（管理者のみ） |
| `/admin/church-profile` | ChurchProfile | 教会プロフィール（管理者のみ、将来フェーズ） |
