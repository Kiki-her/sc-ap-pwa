# Task 08: セッション結果画面の実装

## 背景

1セッション分の学習が終了した後に表示される結果画面。正答率と分野別の内訳、間違えた問題のリストを表示する。

## ゴール

セッション終了後にサマリと間違い問題リストが表示され、復習モードへの導線がある。

## 技術的な指示

### 1. 結果集計フック `src/hooks/useSessionResult.ts`

```typescript
export interface CategoryResult {
  subCategory: SubCategory;
  total: number;
  correct: number;
  rate: number;
}

export interface SessionResult {
  session: Session;
  totalQuestions: number;
  correctCount: number;
  correctRate: number;
  categoryResults: CategoryResult[];
  mistakeQuestionIds: string[];  // 間違えた問題のID
}

export function useSessionResult(sessionId: string): {
  result: SessionResult | null;
  isLoading: boolean;
};
```

### 2. ページ `src/pages/ResultPage.tsx`

```
┌─────────────────────────┐
│         結果              │
├─────────────────────────┤
│                         │
│      18 / 25 問正解      │  ← 大きく表示
│       正答率 72%         │
│    ◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯✗✗✗✗✗✗✗│  ← ドットインジケータ（任意）
│                         │
├─────────────────────────┤
│  分野別正答率             │
│  セキュリティ    ████░ 80% │
│  ネットワーク    ███░░ 60% │
│  データベース    ██░░░ 40% │
│  ...                    │
├─────────────────────────┤
│  間違えた問題 (7問)       │
│  ┌───────────────────┐  │
│  │ Q5 [ネットワーク]    │  │  ← タップで問題詳細
│  │ Q12 [セキュリティ]   │  │
│  │ ...                 │  │
│  └───────────────────┘  │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │  間違えた問題を復習   │  │  ← 間違い問題で新セッション
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  ホームに戻る        │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 3. 復習セッション作成

「間違えた問題を復習」ボタンの処理:
1. `mistakeQuestionIds` から問題を取得
2. シャッフル
3. `mode: "mistakes"` の新しいセッションを作成
4. `/quiz/:newSessionId` に遷移

### 4. 問題詳細モーダル

間違えた問題をタップしたときに表示する:
- 問題文
- 4つの選択肢（正解にマーク）
- 自分が選んだ選択肢
- 解説

モーダルまたはボトムシートで実装。

### 5. コンポーネント

- `src/components/stats/CategoryBar.tsx` — 分野別正答率の横棒グラフ1行分
- `src/components/common/QuestionDetailModal.tsx` — 問題詳細モーダル（MistakesPageでも再利用）

## 参照すべきファイル

- `src/types/index.ts`
- `src/db/answerRecords.ts`, `src/db/sessions.ts`
- `src/utils/dataLoader.ts`
- `src/utils/shuffle.ts`

## 完了条件

- [ ] セッション終了後に正答数・正答率が表示される
- [ ] 分野別正答率が横棒グラフで表示される
- [ ] 間違えた問題がリスト表示される
- [ ] 間違えた問題をタップすると詳細（問題文・選択肢・解説）が表示される
- [ ] 「間違えた問題を復習」で新セッションが作成され出題画面に遷移する
- [ ] 間違えた問題が0問の場合「復習」ボタンは非表示、全問正解のメッセージを表示
- [ ] 「ホームに戻る」で `/` に遷移

## テスト方法

セッションを1つ完了させた後、結果画面の表示内容を手動確認。
全問正解のケース、全問不正解のケース、混合のケースで確認。
復習ボタンで出題画面に遷移し問題が解けることを確認。
