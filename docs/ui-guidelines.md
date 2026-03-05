# UI ガイドライン

モバイルファースト PWA として、**iOS Human Interface Guidelines (HIG)** を主な参照基準とする。

## 基本方針

- **対象**: モバイル（スマートフォン）でのホーム画面追加（PWA）が主用途
- **テーマ**: ライトテーマ + フロスト白グラスモーフィズム（"God's Glory" テーマ）
- **幅制限**: 設けない（全幅表示）。コンテンツは `max-width` + `margin: auto` で中央寄せ
- **グリッド**: 8pt グリッドに基づく（`space-*` トークンは 4px 基準なので 2 の倍数を使う）

## テーマ・ビジュアルスタイル

### カラー

- **背景**: warm off-white (`#faf8f5`) + 暖色メッシュグラデーション（ゴールド・ピーチ・アイボリーの光）
- **アクセント**: Deep Gold (`#a67c1a`)。小テキスト用は primary-700 (`#8c6815`)。WCAG AA ~4.6:1 on white
- **テキスト**: warm stone palette（メイン `#1c1917`、muted `#78716c`）
- **セマンティックカラー**: Warm Red (`#c53030`)、Warm Green (`#22863a`)
- **グレースケール**: warm stone palette (`--color-gray-50: #faf9f7` 〜 `--color-gray-900: #1c1917`)

### グラスモーフィズム

カード・ヘッダー等の主要 UI 要素に適用。フロスト白ガラス。

```css
/* 標準グラスカード */
background: var(--glass-bg);             /* rgba(255,255,255,0.65) */
backdrop-filter: var(--glass-blur) var(--glass-saturate);
-webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
border: var(--glass-border);             /* 1px solid rgba(0,0,0,0.06) */
border-radius: var(--radius-xl);
```

- **hover**: `var(--glass-bg-hover)` (`rgba(255,255,255,0.8)`) + `var(--glass-border-hover)` (`rgba(0,0,0,0.1)`)
- **ダイアログ**: 高不透明度白背景（`rgba(255,255,255,0.95)`）で可読性を確保
- **入力フォーム**: `var(--input-bg)` (`rgba(255,255,255,0.7)`) + `var(--input-border)` (`rgba(0,0,0,0.12)`)

### シャドウ

ライト背景ではソフトなドロップシャドウ（不透明度 `0.05`〜`0.08`）。カードには `--shadow-sm`、ウィジェットには `--shadow-md` を適用。

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

### ボトムタブバー (`TabBar`)

- 画面下部固定、2タブ構成（教会 / アカウント）
- `env(safe-area-inset-bottom)` でノッチ対応
- フロスト白背景（`rgba(255,255,255,0.85)` + backdrop-filter）
- アクティブタブ: `--color-primary`（Deep Gold）

### ヘッダー (`Header`)

- シンプルなタイトルバー（中央: 教会名 / 右: オプションアクション）
- フロスト白背景、下部ボーダー
- Props: `title?: string`, `rightAction?: JSX.Element`

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
| ダッシュボード ウィジェット（大） | 28px |
| ダッシュボード ウィジェット（小） | 24px |
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

| 用途 | サイズ |
|------|--------|
| ページタイトル | `text-sm` + `font-semibold` |
| 本文 | `text-base` |
| ウィジェットラベル | `text-base` + `font-semibold` |
| サブテキスト・ミュート | `text-sm` + `color-text-muted` |

## ダッシュボード レイアウト

- **ウィジェット風カード** レイアウト（2カラム CSS Grid）
- グリッド全体を `max-width: 360px` + 中央寄せ
- **大ウィジェット**: `grid-column: span 2`（フル幅）。アイコン + タイトル + サブテキスト
- **小ウィジェット**: `aspect-ratio: 1`（正方形）。アイコン + ラベル
- ウィジェットはグラスカードスタイル + `--shadow-md` を適用

## Favicon / PWA アイコン

- **favicon.svg**: ベージュグラデーション背景にゴールドグラデーション十字架（角丸四角形）
- **pwa-192x192.png / pwa-512x512.png**: SVG から生成した PNG 版
- ブラウザタブには SVG、PWA ホーム画面には PNG を使用
