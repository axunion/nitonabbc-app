# UI ガイドライン

モバイルファースト PWA として、**iOS Human Interface Guidelines (HIG)** を主な参照基準とする。

## 基本方針

- **対象**: モバイル（スマートフォン）でのホーム画面追加（PWA）が主用途
- **テーマ**: ダークテーマ + グラスモーフィズム（visionOS/macOS 風）
- **幅制限**: 設けない（全幅表示）。コンテンツは `max-width` + `margin: auto` で中央寄せ
- **グリッド**: 8pt グリッドに基づく（`space-*` トークンは 4px 基準なので 2 の倍数を使う）

## テーマ・ビジュアルスタイル

### カラー

- **背景**: near-black (`#050507`) + メッシュグラデーション（青・紫・ティールのぼんやりとした光）
- **アクセント**: iOS System Blue (`#007AFF`)
- **テキスト**: 高コントラスト（メイン `#f0f0f6`、muted `#8888a0`）
- **セマンティックカラー**: iOS Dark mode 準拠（Red `#ff3b30`、Green `#28cd41`）

### グラスモーフィズム

カード・ヘッダー等の主要 UI 要素に適用。可読性を最優先し、控えめな透過度とする。

```css
/* 標準グラスカード */
background: var(--glass-bg);             /* rgba(255,255,255,0.06) */
backdrop-filter: var(--glass-blur) var(--glass-saturate);
-webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
border: var(--glass-border);             /* 1px solid rgba(255,255,255,0.08) */
border-radius: var(--radius-xl);
```

- **hover**: `var(--glass-bg-hover)` (`rgba(255,255,255,0.1)`) + `var(--glass-border-hover)`
- **ドロップダウン・ダイアログ**: 高不透明度の背景（`rgba(22,22,32,0.95)` / `rgba(30,30,42,0.9)`）で可読性を確保
- **入力フォーム**: `var(--input-bg)` (`rgba(255,255,255,0.05)`) + `var(--input-border)` (`rgba(255,255,255,0.1)`)

### シャドウ

ダーク背景ではドロップシャドウが目立ちにくいため、不透明度を高めに設定（`0.3`〜`0.5`）。

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
| ヘッダー操作アイコン | 28px |
| メニュー内アイコン | 16px |

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

## ドロップダウン・メニュー

- 高不透明度ガラス背景（`rgba(22,22,32,0.95)`）+ `backdrop-filter` + `shadow-lg`
- セパレーター（区切り線）は使わず余白で区切る
- 通常メニュー項目: `.menuItem` クラスを共通スタイルとして定義し再利用
- ハイライト: `rgba(255,255,255,0.08)` 背景
- 破壊的操作（ログアウト等）: `color-destructive` で赤表示

## ダッシュボード レイアウト

- **ウィジェット風カード** レイアウト（2カラム CSS Grid）
- グリッド全体を `max-width: 360px` + 中央寄せ
- **大ウィジェット**: `grid-column: span 2`（フル幅）。アイコン + タイトル + サブテキスト
- **小ウィジェット**: `aspect-ratio: 1`（正方形）。アイコン + ラベル
- ウィジェットはグラスカードスタイルを適用
