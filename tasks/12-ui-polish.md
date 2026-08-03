# Task 12: スマホUI最適化

## 背景

全画面が実装された状態で、スマホでの使い勝手を最適化する仕上げ作業。

## ゴール

スマホの各画面サイズで快適に操作でき、ダークモードにも対応する。

## 技術的な指示

### 1. レスポンシブ対応

基本方針:
- モバイルファースト: デフォルトが375px（iPhone SE）
- 最大幅: `max-w-lg`（512px）でセンタリング（タブレット/PC時）
- 全ページ共通のレイアウトラッパー:

```typescript
// src/components/common/PageLayout.tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-lg px-4 py-4">
        {children}
      </div>
    </div>
  );
}
```

### 2. タッチターゲットサイズ

- 全てのタップ可能要素: 最低 `min-h-[44px] min-w-[44px]`
- 選択肢ボタン: `min-h-[56px]` + `p-4` で余裕を持たせる
- リストアイテム: `py-3` 以上の上下パディング

### 3. ダークモード

Tailwind の `dark:` プレフィックスで対応。OSの設定に自動追従:

```css
/* src/index.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

```typescript
// ダークモード自動検出（OSの設定に追従）
// index.html の <script> に追加
document.documentElement.classList.toggle(
  "dark",
  window.matchMedia("(prefers-color-scheme: dark)").matches
);
```

色の方針:
- 背景: `bg-gray-50 dark:bg-gray-900`
- カード: `bg-white dark:bg-gray-800`
- テキスト: `text-gray-900 dark:text-gray-100`
- サブテキスト: `text-gray-500 dark:text-gray-400`
- 正解: `bg-green-100 dark:bg-green-900/30`
- 不正解: `bg-red-100 dark:bg-red-900/30`
- ボーダー: `border-gray-200 dark:border-gray-700`

### 4. フォントサイズ

- 問題文: `text-base`（16px）— 読みやすさ優先
- 選択肢: `text-base`
- 解説: `text-sm`（14px）
- 見出し: `text-lg` 〜 `text-xl`
- 統計の数値: `text-3xl font-bold`

### 5. 画面遷移

React Router での遷移に軽量なアニメーションをつける（任意）:

簡易的な方法として、ページコンポーネントに CSS アニメーションを適用:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: fadeIn 0.2s ease-out;
}
```

重い場合はアニメーションなしでもよい。パフォーマンス優先。

### 6. ローディング状態

各ページのデータ読み込み中に表示するスケルトンUI:

```typescript
// src/components/common/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
  );
}
```

### 7. 長い問題文の処理

- 問題文が長い場合、選択肢が画面外に出る可能性がある
- 選択肢エリアを常に画面下部に表示するか、スクロールで到達できるようにする
- QuizPage のレイアウト: 問題文エリアはスクロール可能、選択肢エリアは問題文の下に配置（スティッキーにはしない。スクロールして選択肢に到達する自然なUI）

### 8. 全画面チェックリスト

各画面で以下を確認:
- iPhone SE (375px) で崩れない
- iPhone 15 Pro Max (430px) で無駄な余白が出ない
- テキストが切れない（overflow 処理）
- ボタンがタップしやすい
- ダークモードで全要素が見える（コントラスト確保）
- ローディング状態が表示される

## 参照すべきファイル

- `src/pages/*.tsx` — 全ページコンポーネント
- `src/components/**/*.tsx` — 全コンポーネント
- `src/index.css`

## 完了条件

- [ ] 全画面が iPhone SE (375px) で崩れず操作できる
- [ ] 全画面が iPhone 15 Pro Max (430px) で適切に表示される
- [ ] ダークモード切替で全画面の配色が正しく切り替わる
- [ ] 全タップ可能要素が 44x44px 以上
- [ ] 選択肢ボタンが十分な大きさで誤タップしにくい
- [ ] ローディング状態でスケルトンUIが表示される
- [ ] 長い問題文でもスクロールして選択肢に到達できる

## テスト方法

1. Chrome DevTools のレスポンシブモードで各デバイスサイズを確認
2. OS のダークモード設定を切り替えて表示確認
3. スマホ実機で全画面を操作して使い勝手を確認
4. 問題文が長い問題をわざと表示してスクロール挙動を確認
