# Task 05: ホーム画面の実装

## 背景

アプリ起動時に最初に表示される画面。学習の進捗が一目でわかり、すぐに学習を始められる導線を提供する。

## ゴール

ホーム画面に統計情報と各機能への導線が表示され、正しく遷移できる。

## 技術的な指示

### 1. 統計フック `src/hooks/useHomeStats.ts`

```typescript
export interface HomeStats {
  totalQuestions: number;      // アプリ内の全問題数
  answeredQuestions: number;   // 解答したユニーク問題数
  totalAnswers: number;        // 総解答回数
  correctRate: number;         // 正答率（0〜1）
  hasIncompleteSession: boolean; // 未完了セッションの有無
  incompleteSessionId?: string;  // 未完了セッションのID
}

export function useHomeStats(): {
  stats: HomeStats | null;
  isLoading: boolean;
};
```

DBから集計する:
- `totalQuestions`: `loadAllQuestions()` の結果の length
- `answeredQuestions`: `getAnsweredQuestionIds()` の結果の length
- `totalAnswers`: `getAllAnswerRecords()` の length
- `correctRate`: 全 AnswerRecord のうち isCorrect === true の割合
- `hasIncompleteSession` / `incompleteSessionId`: `getIncompleteSession()` の結果

### 2. ページ `src/pages/HomePage.tsx`

レイアウト:

```
┌─────────────────────────┐
│     SC過去問トレーニング     │  ← アプリタイトル
├─────────────────────────┤
│  解答済: 150 / 1155問     │  ← 進捗
│  正答率: 72.3%           │
│  ████████░░  (13%)       │  ← プログレスバー
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │  ▶ 続きから (15/25) │  │  ← 未完了セッションがある場合のみ表示
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  📝 学習を始める     │  │  → /settings
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  ❌ 間違えた問題     │  │  → /mistakes
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  📊 学習履歴        │  │  → /stats
│  └───────────────────┘  │
└─────────────────────────┘
```

※ 絵文字はアイコン的な表現の参考。実装では Tailwind のスタイリングで表現する。

### 3. コンポーネント

- `src/components/common/ProgressBar.tsx` — 汎用プログレスバー（パーセンテージ表示付き）
- `src/components/common/MenuButton.tsx` — ホーム画面のメニューボタン（アイコン + テキスト + 矢印）

### 4. スタイリング方針

- スマホ全幅を使用（max-width: 640px 程度でセンタリング）
- ボタンは `min-height: 56px` でタッチしやすく
- 統計エリアは背景色を分けて視覚的に区別
- ローディング中はスケルトンUI

## 参照すべきファイル

- `src/types/index.ts`
- `src/db/answerRecords.ts`, `src/db/sessions.ts`
- `src/hooks/useQuestions.ts`

## 完了条件

- [ ] ホーム画面に統計情報（解答済み数、正答率、プログレスバー）が表示される
- [ ] 「学習を始める」→ `/settings` に遷移する
- [ ] 「間違えた問題」→ `/mistakes` に遷移する
- [ ] 「学習履歴」→ `/stats` に遷移する
- [ ] 未完了セッションがある場合「続きから」ボタンが表示され、タップで `/quiz/:sessionId` に遷移する
- [ ] 未完了セッションがない場合「続きから」ボタンは非表示
- [ ] データ0件の初期状態でもクラッシュしない（正答率は「--」等で表示）

## テスト方法

ブラウザで `/` にアクセスし、各要素の表示と遷移を手動確認。
初期状態（DB空）、データあり状態の両方で確認。
