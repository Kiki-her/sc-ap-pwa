# Task 09: 間違えた問題一覧画面の実装

## 背景

過去に間違えた問題を一覧し、フィルタリング・復習できる画面。
弱点を把握し、集中的に復習するための機能。

## ゴール

間違えた問題がフィルタ・ソートでき、復習モードで再出題できる。

## 技術的な指示

### 1. 問題情報付き間違いフック `src/hooks/useMistakes.ts`

```typescript
export interface MistakeWithQuestion {
  mistake: MistakeEntry;
  question: Question;
}

export interface MistakesFilter {
  exam?: Exam;
  year?: number;
  subCategory?: SubCategory;
  sortBy: "count" | "date";  // 間違い回数順 / 最終日時順
  showArchived: boolean;
}

export function useMistakes(filter: MistakesFilter): {
  mistakes: MistakeWithQuestion[];
  isLoading: boolean;
  toggleArchive: (questionId: string) => Promise<void>;
  createReviewSession: () => Promise<string>;  // sessionId を返す
};
```

### 2. ページ `src/pages/MistakesPage.tsx`

```
┌─────────────────────────┐
│  ← 戻る   間違えた問題     │
├─────────────────────────┤
│  [AP] [SC] [全て]        │  ← 試験フィルタ
│  分野: [全て ▼]          │  ← 分野フィルタ（ドロップダウン）
│  並び: [回数順] [日時順]  │  ← ソート切替
│  □ アーカイブ済みも表示   │  ← トグル
├─────────────────────────┤
│  12問                    │  ← 該当件数
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │ SC-2024S-Q15       │  │
│  │ [セキュリティ] 3回   │  │  ← 分野タグ + 間違い回数
│  │ 最終: 2025/01/15   │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ AP-2023A-Q42       │  │
│  │ [ネットワーク] 2回   │  │
│  │ 最終: 2025/01/14   │  │
│  └───────────────────┘  │
│  ...                    │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │  この問題を復習する   │  │  ← フィルタ結果で新セッション
│  └───────────────────┘  │
└─────────────────────────┘
```

### 3. 問題詳細表示

リスト内の各アイテムをタップすると `QuestionDetailModal`（Task 08 で作成）を開く。

モーダル内に「理解した」ボタンを配置:
- タップで `toggleArchive(questionId)` を実行
- `archived: true` になった問題はリストから消える（アーカイブ表示トグルがOFFの場合）
- アーカイブ済みの問題に再度間違えると `archived` は自動的に `false` に戻る（Task 03 の upsertMistake で実装済み）

### 4. 復習セッション作成

「この問題を復習する」ボタン:
1. 現在のフィルタ条件で表示されている問題のIDリストを取得
2. シャッフル
3. `mode: "mistakes"` の新セッションを作成
4. `/quiz/:sessionId` に遷移

問題が0件の場合はボタンを非表示にする。

### 5. 空状態

間違えた問題が0件の場合:
「まだ間違えた問題はありません。学習を始めましょう！」のようなメッセージと「学習を始める」ボタンを表示。

## 参照すべきファイル

- `src/types/index.ts`
- `src/constants/categories.ts`
- `src/db/mistakes.ts`
- `src/utils/dataLoader.ts`
- `src/utils/shuffle.ts`
- `src/db/sessions.ts`
- `src/components/common/QuestionDetailModal.tsx`（Task 08 で作成）

## 完了条件

- [ ] 間違えた問題がリスト表示される
- [ ] 試験種別・分野・ソート順でフィルタリングできる
- [ ] アーカイブ済み表示切替トグルが動作する
- [ ] 問題タップで詳細モーダルが表示される
- [ ] モーダル内の「理解した」ボタンでアーカイブされリストから消える
- [ ] 「この問題を復習する」で出題画面に遷移し問題が解ける
- [ ] 問題0件の空状態が適切に表示される

## テスト方法

1. 出題画面で意図的に何問か間違える
2. `/mistakes` で間違えた問題が表示されることを確認
3. 各フィルタ・ソートを切り替えて動作確認
4. 問題タップ → モーダル表示 → 「理解した」 → リストから消えることを確認
5. 復習モードで出題画面に遷移し解答できることを確認
