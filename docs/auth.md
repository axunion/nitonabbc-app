# 認証

## 方針

- LINE Login を唯一の認証手段とする
- 約30名の小規模運用のため、シンプルな構成を優先

## フロー

1. ユーザーがアプリにアクセス
2. 未認証の場合、LINEログイン画面へリダイレクト
3. LINE認証完了後、アプリにコールバック
4. サーバー側でアクセストークンを検証し、セッションを発行
5. 以降はセッションで認証状態を維持

## ユーザー登録

### 招待リンク方式

1. 管理者が名簿にメンバー名を事前登録する
2. 名簿の各メンバーに対して一意の招待リンクが自動生成される
3. 管理者が管理画面から招待リンク一覧をコピーし、メンバーに共有する（LINEグループ等）
4. メンバーが自分の招待リンクをタップ → LINE認証 → 名簿レコードとLINEアカウントが紐付く
5. 紐付け済みのメンバーは以降通常のLINEログインでアクセス可能

- 招待リンクは一度使用されたら無効になる（1回限り）
- 誤って他人のリンクを使った場合は、管理者が紐付けを解除して再発行できる
- 名簿に登録されていない人はアプリを利用できない

### ロール管理

- デフォルトロールは「メンバー」
- 管理者がロール（管理者/メンバー）を手動で変更

## セッション管理

- サーバー側セッション（Cloudflare KV）
- セッションIDをHttpOnly Cookie（`secure: true`, `sameSite: Lax`, `path: /`, `maxAge: 30日`）で管理
- セッション有効期限: **30日**（セッション発行時に固定 TTL を設定。スライディング延長なし）
- 以下の場合にリクエストが 401 になる:
  - 管理者がユーザーを無効化した場合（KV セッションは残存するが、`authMiddleware` が DB の `is_active = 0` を検出して 401 を返す）
  - ユーザー自身がログアウトした場合（KV セッションを削除）
  - セッション発行から30日が経過した場合（KV の TTL 切れ）

> KV のキー構造: `session:{uuid}` → `{ userId, lineUserId, role }` JSON
>
> OAuth state 管理: `oauth_state:{uuid}` → 通常ログインは `"1"`、招待フローは `{ inviteToken }` JSON（TTL 600 秒）。`inviteToken` の有無で招待フローを識別する。
>
> さらに state はフロー開始時に HttpOnly Cookie（`oauth_state`、TTL 600 秒）にも保存され、callback で KV と Cookie の両方を照合する（照合後に削除）。フローを開始したブラウザ以外からの callback（ログインCSRF・セッション固定）を拒否するため。

## ページの公開範囲

- 全ページ認証必須（ログイン画面・招待ページを除く）
- 未認証の場合は SPA 側（`App.tsx`）でログイン画面を表示する（サーバーリダイレクトではない）
  - `/api/auth/me` が 401 を返した場合にログイン画面を描画
  - ログインボタンクリックで `/api/auth/login` へ遷移し、LINE 認証後に `/` へリダイレクト

## ローカル開発

- 環境変数 `DEV_AUTH=true` の場合、LINE認証をスキップ
- ダミーの管理者ユーザーで自動ログインされる
- 本番・プレビュー環境ではこの環境変数を設定しない

## 環境構成

| 環境 | デプロイ条件 | 用途 |
|------|------------|------|
| Production | `main` ブランチへのpush | 本番 |
| Preview | その他のブランチへのpush | 検証・レビュー |

- KV / D1 などのバインディングは環境ごとに分離
- LINE Login のコールバックURLは環境ごとに設定が必要

## LINE Login 設定

- LINE Developers Console でチャネル作成が必要
- コールバックURL: `https://<domain>/api/auth/callback`
- 取得するプロフィール情報: ユーザーID、表示名、プロフィール画像

## API エンドポイント

| メソッド | パス | 説明 | 実装 |
|---------|------|------|------|
| GET | `/api/auth/login` | LINEログインURLへリダイレクト | ✅ |
| GET | `/api/auth/callback` | LINEからのコールバック処理 | ✅ |
| POST | `/api/auth/logout` | ログアウト（セッション破棄） | ✅ |
| GET | `/api/auth/me` | 現在のユーザー情報を取得 | ✅ |
| GET | `/api/invite/:token` | 招待トークンを検証し、LINE認証へリダイレクト | ✅ |

### callback エラーリダイレクト

`/api/auth/callback` は失敗時にトップページへリダイレクトしクエリパラメータでエラー種別を通知する。

| `?error=` 値 | 状況 |
|-------------|------|
| `invalid_invite` | 招待トークンが存在しない / 使用済み |
| `line_already_linked` | その LINE アカウントは別メンバーに紐付き済み |
| `not_registered` | 名簿に存在しない LINE アカウント（招待なし直接ログイン） |

## 実装ファイル

| ファイル | 役割 |
|---------|------|
| `server/types.ts` | `AppEnv`, `User`, `SessionData` 型定義 |
| `server/middleware/auth.ts` | セッション検証ミドルウェア（`DEV_AUTH` バイパス・`is_active` チェック含む） |
| `server/routes/auth.ts` | 認証エンドポイント実装（callback で招待フロー分岐含む） |
| `server/routes/invite.ts` | 招待トークン検証・LINE認証リダイレクト |
| `src/store/auth.ts` | `/api/auth/me` を `createResource` で取得する認証ストア |
| `src/store/AuthContext.tsx` | `AuthProvider` と `useAuth()` フック（コンポーネントが利用） |
| `src/pages/Login/` | ログイン画面（LINE ボタン） |
| `server/db/schema.ts` | D1 users テーブル定義（Drizzle スキーマ）（`invite_token NOT NULL UNIQUE`, `invite_used`, `is_active` 含む） |
| `wrangler.jsonc` | D1（`DB`）・KV（`SESSION_KV`）バインディング設定 |

### ローカル開発用ダミーユーザー

`DEV_AUTH=true` 時に `authMiddleware` が自動生成するダミーユーザーの固定値:
- `line_user_id`: `"dev_line_user_id"`
- `name`: `"Dev Admin"`
- `role`: `"admin"`
