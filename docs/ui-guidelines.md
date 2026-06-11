# UI ガイドライン

モバイルファースト PWA として、**iOS Human Interface Guidelines (HIG)** を主な参照基準とする。

## 基本方針

- **対象**: モバイル（スマートフォン）でのホーム画面追加（PWA）が主用途
- **テーマ**: ライトテーマ + フロスト白グラスモーフィズム（"God's Glory" テーマ）
- **幅制限**: 設けない（全幅表示）。コンテンツは `max-width` + `margin: auto` で中央寄せ
- **グリッド**: 8pt グリッドに基づく（`space-*` トークンは 4px 基準なので 2 の倍数を使う）

## テーマ・ビジュアルスタイル

### カラー

- **背景**: warm off-white (`#f8f5f0`) + 暖色メッシュグラデーション（ゴールド・ピーチ・アイボリーの光）
- **アクセント**: Deep Gold (`#a67c1a`)。小テキスト用は primary-700 (`#8c6815`)。WCAG AA ~4.6:1 on white
- **テキスト**: warm stone palette（メイン `#1c1917`、muted `#78716c`）
- **セマンティックカラー**: Warm Red (`#c53030`)、Warm Green (`#22863a`)
- **グレースケール**: warm stone palette (`--color-gray-50: #faf9f7` 〜 `--color-gray-900: #1c1917`)

### グラスモーフィズム

カード・ヘッダー等の主要 UI 要素に適用。フロスト白ガラス。

```css
/* 標準グラスカード */
background: var(--glass-bg);             /* rgba(255, 253, 248, 0.6) */
backdrop-filter: var(--glass-blur) var(--glass-saturate);
-webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
border: var(--glass-border);             /* 1px solid rgba(0,0,0,0.08) */
border-radius: var(--radius-xl);
```

- **hover**: `var(--glass-bg-hover)` (`rgba(255, 253, 248, 0.75)`) + `var(--glass-border-hover)` (`1px solid rgba(0,0,0,0.14)`)
- **active**: `var(--glass-bg-active)` (`rgba(255, 253, 248, 0.5)`)
- **chrome（TabBar・Header）**: `var(--glass-bg-chrome)` (`rgba(255, 253, 248, 0.82)`)
- **ダイアログ**: 高不透明度白背景（`rgba(255,255,255,0.95)`）で可読性を確保（トークン未定義、ハードコード）
- **入力フォーム**: `var(--input-bg)` (`rgba(255, 253, 248, 0.65)`) + `var(--input-border)` (`rgba(0,0,0,0.12)`)

### プライマリカラー グラストークン

フローティングボタン・閉じるボタンなど、プライマリ色を持つガラス系 UI 要素に使用:

| トークン | 値 | 用途 |
|---------|-----|------|
| `--color-primary-glass` | `rgba(166,124,26,0.38)` | 通常 |
| `--color-primary-glass-hover` | `rgba(166,124,26,0.52)` | hover |
| `--color-primary-glass-active` | `rgba(166,124,26,0.62)` | active |
| `--color-primary-glass-border` | `rgba(166,124,26,0.2)` | ボーダー |

### シャドウ

2 系統のシャドウトークンを使い分ける:

| 系統 | トークン | 特徴 |
|------|---------|------|
| 標準 | `--shadow-sm/md/lg` | ウォームゴールドドロップシャドウのみ |
| グラス | `--glass-shadow-sm/md/lg` | 上記 + inset の白ハイライト（ガラス感を強調） |

ガラスカード（ウィジェット・戻るボタン等）には `--glass-shadow-*` を使用する。ダッシュボードウィジェットは `--glass-shadow-md` を適用。

### ページ遷移アニメーション

各ページの container に fadeIn アニメーションを適用:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.container { animation: fadeIn var(--duration-normal) var(--ease-out); }
```

## ナビゲーション

### デザイン参照

iOS 26 (Liquid Glass) のナビゲーションパターンを参照基準とする。

### ボトムタブバー (`TabBar`)

- 画面下部にフローティング表示（ピル形状）、2タブ構成（教会 / 設定）
- `<button>` で実装（`<A>` ではない）。タブクリック時の挙動を制御するため
- 子ページでも常に表示する
- `env(safe-area-inset-bottom)` でノッチ対応（`bottom: calc(env(safe-area-inset-bottom) + 12px)`）
- 幅: `min(calc(100vw - 32px), 448px)`、中央揃え
- フロスト白グラスモーフィズム背景（`--glass-bg-chrome` + backdrop-filter）、`--radius-full` で全丸
- アクティブタブ: `--color-primary`（Deep Gold）
- タブ切替時、各タブ内の最後のURL（ページ）を記憶・復元する
- 同じタブを再タップするとルートに戻る

### ヘッダー (`Header`)

各ページが自身の `<Header>` を配置する（App.tsx には含めない）。

- **デフォルト（未スクロール時）**: 背景透明。コンテンツとシームレスに繋がる
- **スクロール時**: フロスト白背景 + 下部ボーダーが出現（`window.scrollY > 0` で切替）
- **タブルートページ**: 中央にタイトル（教会名等）、右にオプションアクション
- **子ページ**: 左に戻るボタン、中央にページタイトル、右にオプションアクション
- 戻るボタンは親ページへのナビゲーション（ブラウザバックではない）
- Props: `title?: string`, `rightAction?: JSX.Element`, `backTo?: string`

### 戻るボタン

iOS 26 Liquid Glass 風の円形ガラスボタン。

```css
width: 36px;
height: 36px;
border: var(--glass-border);
border-radius: var(--radius-full);
background: var(--glass-bg);
backdrop-filter: var(--glass-blur) var(--glass-saturate);
color: var(--color-primary);
box-shadow: var(--shadow-sm);
```

- `ChevronLeft` アイコン（24px, stroke-width 1.5）
- hover: `var(--glass-bg-hover)`
- active: `scale(0.95)` でタップフィードバック

## アイコン

### ライブラリ

**lucide-solid** を使用する。

```tsx
import { FileText } from "lucide-solid";
<FileText size={28} stroke-width={1.5} />
```

- `stroke-width={1.5}` を標準とする（デフォルト 2 より細く、スマートな印象）
- アイコン自体に背景ボックスは付けない（色は `currentColor` で親の CSS `color` から継承）
- ダッシュボードウィジェット内のアイコンは `var(--color-primary-50)` 背景の円形ラッパーで囲む

### サイズ

| 用途 | サイズ |
|------|--------|
| ダッシュボード ウィジェット | 24px |
| タブバーアイコン | 20px |
| メニュー内アイコン | 20px |

## タッチターゲット

- 最小サイズ: **44 × 44pt**（iOS HIG 準拠）
- ボタンが小さい場合は `padding` で補う（見た目より当たり判定を広く）

## スペーシング

8pt グリッドに基づき、`space-4`（16px）を基本単位とする。

| 用途 | トークン | 値 |
|------|---------|-----|
| 画面左右マージン | `space-4` | 16px |
| グリッド gap | `space-3` | 12px |
| セクション間 | `space-6` | 24px |

## タイポグラフィ

### フォント

- **Latin / 数字**: Inter (Google Fonts, weight 400/500/600)
- **日本語**: システムフォントへフォールバック (Hiragino Sans / Noto Sans JP)
- `--font-sans: "Inter", system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif`

### フォントサイズスケール

| トークン | 値 | 用途 |
|----------|-----|------|
| `text-2xs` | 0.625rem (10px) | TabBar ラベル |
| `text-xs` | 0.75rem (12px) | バッジ、進捗テキスト |
| `text-sm` | 0.875rem (14px) | サブテキスト、ミュート |
| `text-base` | 1rem (16px) | 本文、ヘッダータイトル |
| `text-lg` | 1.25rem (20px) | セクションタイトル、ダイアログタイトル |
| `text-xl` | 1.5rem (24px) | Login タイトル |

### Letter-spacing

| トークン | 値 | 用途 |
|----------|-----|------|
| `tracking-tight` | -0.01em | `text-lg` / `text-xl` のタイトル要素 |
| `tracking-normal` | 0 | `text-base` 本文（デフォルト） |
| `tracking-wide` | 0.01em | `text-xs` / `text-2xs` のラテン文字小テキスト |

### 用途別スタイル

| 用途 | サイズ | 備考 |
|------|--------|------|
| ヘッダータイトル | `text-base` + `font-semibold` | |
| ページ/ダイアログタイトル | `text-lg` + `font-semibold` | `tracking-tight` |
| Login タイトル | `text-xl` + `font-semibold` | `tracking-tight` |
| 本文 | `text-base` | |
| ウィジェットラベル | `text-base` + `font-semibold` | |
| サブテキスト・ミュート | `text-sm` + `color-text-muted` | |
| TabBar ラベル | `text-2xs` + `font-medium` | `tracking-wide` |

## ダッシュボード レイアウト

- **ウィジェット風カード** レイアウト（2カラム CSS Grid）
- グリッド全体を `max-width: var(--app-max-width)` + 中央寄せ（TabBar と幅を揃えるため共通トークンを使用）
- ウィジェットのスタイル: アイコン（24px, 48px 円形ラッパー）+ ラベルのみ、中央寄せ
- ウィジェットはグラスカードスタイル + `--shadow-md` を適用
- 各ウィジェットの `grid-column` span はアイテム数に応じて調整する

## 管理画面テーマ（`/admin`）

管理画面は PC 操作が前提のため、モバイルの "God's Glory" テーマとは別の **フラットなニュートラルテーマ**（shadcn/ui 風、ライブラリ不使用）を使用する。

- **トークン**: `src/styles/admin-tokens.css` の `--admin-*`（`:root` 定義。名前空間が分かれているためモバイルトークンと共存し、Kobalte の Portal 内でも解決される）
- **共有パターン**: `src/styles/admin.module.css`（`.card`, `.input`, `.buttonPrimary`, `.buttonOutline`, `.dialogContent` 等を `composes:` で利用）
- **カラー**: 背景 `#fafafa` / カード `#ffffff` + 1px `#e4e4e7` ボーダー / テキスト `#18181b` / muted `#71717a`（zinc 系ニュートラル）。アクセントは Deep Gold (`--admin-primary: #a67c1a`) を継続
- **グラスモーフィズム不使用**: `--glass-*` トークン・`backdrop-filter`・メッシュグラデーションは管理画面では使わない。サーフェスは不透明白 + 細ボーダー + 控えめなニュートラルシャドウ（`--admin-shadow-*`）
- typography / spacing / radius ステップ / duration / z-index はデバイス非依存のため `tokens.css` のものを共用する

## Favicon / PWA アイコン

- **favicon.svg**: ベージュグラデーション背景にゴールドグラデーション十字架（角丸四角形）
- **pwa-192x192.png / pwa-512x512.png**: SVG から生成した PNG 版
- ブラウザタブには SVG、PWA ホーム画面には PNG を使用
