# 管理画面

## 概要

管理者がメンバーの追加・編集・無効化・招待リンク管理を行うページ。
設定ページ (`/settings`) 内のリンクから `/admin/members` にアクセスできる（管理者のみ表示）。
管理画面はタブバーの外側にあり、PC 向けサイドバーレイアウト（`AdminLayout`）で表示する。

## 機能

### メンバー一覧

- 全メンバーをデータテーブル形式で一覧表示
- 列構成: 名前（無効バッジ含む）、ロール、LINE 連携状態、アクション
- 無効化されたメンバーは行をグレーアウト表示 + 名前セルに「無効」バッジ
- アクティブなメンバーのみアクション列にボタンを表示

### メンバー追加

- 「追加」ボタンからダイアログを開く
- 入力項目: 名前（必須）、ロール（メンバー / 管理者、デフォルト: メンバー）
- 招待トークンは自動生成（`crypto.randomUUID()`）

### メンバー編集

- 各カードの「編集」ボタンからダイアログを開く
- 名前とロールを変更可能

### メンバー無効化（ソフトデリート）

- 各カードの「無効化」ボタン（確認ダイアログあり）
- `is_active = 0` に更新（物理削除ではない）
- 自分自身は無効化できない

### 再招待

- LINE 連携済みメンバーの「再招待」ボタン（確認ダイアログあり）
- `line_user_id` を NULL にリセット、新しい招待トークンを発行、`invite_used = 0` にリセット
- 用途: 誤って他人のリンクでログインした場合の復旧

### 招待リンクコピー

- 未使用の招待トークンを持つメンバーに「招待リンク」ボタンを表示
- クリップボードに `{origin}/api/invite/{token}` をコピー

## 認可

- API レベル: `authMiddleware` → `adminMiddleware` の2段階
  - `authMiddleware`: セッション検証（未認証なら 401）
  - `adminMiddleware`: ロール検証（member なら 403）
- UI レベル: `useAuth()` で取得したユーザーのロールが admin でない場合、`/` にリダイレクト

## API エンドポイント

| メソッド | パス | 説明 | 実装 |
|---------|------|------|------|
| GET | `/api/admin/members` | 全メンバー一覧を取得 | ✅ |
| POST | `/api/admin/members` | メンバーを新規作成 | ✅ |
| PUT | `/api/admin/members/:id` | メンバー情報を更新 | ✅ |
| DELETE | `/api/admin/members/:id` | メンバーを無効化 | ✅ |
| POST | `/api/admin/members/:id/reinvite` | LINE 連携解除 + 新トークン発行 | ✅ |

### レスポンス形式（メンバー）

```json
{
  "id": 1,
  "name": "山田太郎",
  "role": "member",
  "lineUserId": "U1234" | null,
  "inviteToken": "uuid-string",
  "inviteUsed": true,
  "isActive": true,
  "createdAt": "2025-01-01 00:00:00",
  "updatedAt": "2025-01-01 00:00:00"
}
```

### エラーレスポンス

| ステータス | 条件 |
|-----------|------|
| 400 | 名前が未入力、不正なロール値、自分自身の無効化 |
| 401 | 未認証 |
| 403 | 管理者以外 |
| 404 | 指定 ID のメンバーが存在しない |

## 実装ファイル

| ファイル | 役割 |
|---------|------|
| `server/middleware/admin.ts` | 管理者ロール検証ミドルウェア |
| `server/routes/admin.ts` | 管理 API エンドポイント（5ルート） |
| `server/routes/members.ts` | アクティブメンバー一覧 API（`GET /api/members`、認証済み全員） |
| `src/store/AuthContext.tsx` | 認証コンテキスト（`useAuth()` フック） |
| `src/components/AdminLayout/AdminLayout.tsx` | 管理者専用レイアウト（サイドバー + 管理者ロールガード） |
| `src/components/MemberLayout/MemberLayout.tsx` | メンバー向けレイアウト（TabBar を内包） |
| `src/components/ConfirmDialog/ConfirmDialog.tsx` | 確認ダイアログ（Kobalte Dialog ベース、非同期確認対応） |
| `src/components/Toast/` | トースト通知（`showToast()` 命令型 API） |
| `src/pages/Management/Management.tsx` | メンバー管理 UI（データテーブル・CRUD） |
| `src/pages/Management/Management.module.css` | メンバー管理スタイル |

## ルーティング

`@solidjs/router` を使用。ルートは `src/index.tsx` に定義されており、`App` がルートレイアウト（認証ゲート・Toaster）として機能する。

`/admin` プレフィックスのルートは `AdminLayout` 内にネストされ、`AdminLayout` が管理者ロールを検証する。非管理者は `/` へリダイレクトする。

| パス | コンポーネント | 説明 |
|------|--------------|------|
| `/admin` | リダイレクト | `/admin/members` へ自動転送 |
| `/admin/members` | `Management` | メンバー管理（lazy load） |
| `/admin/bulletin-template` | `BulletinTemplate` | 週報テンプレート設定（lazy load） |
