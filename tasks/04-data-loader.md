# Task 04: 過去問JSONの読み込みとフィルタリング

## 背景

`public/data/` に配置されたJSON過去問データを読み込み、フィルタリング・シャッフルして出題する仕組みを作る。

## ゴール

データ読み込み・フィルタリング・シャッフルのユーティリティとカスタムフックが実装され、テストがパスする。

## 技術的な指示

### 1. データローダー `src/utils/dataLoader.ts`

```typescript
import type { Question } from "../types";

let cachedQuestions: Question[] | null = null;

/**
 * public/data/index.json を読み、全JSONファイルをfetchして統合。
 * 2回目以降はキャッシュを返す。
 */
export async function loadAllQuestions(): Promise<Question[]>;

/**
 * キャッシュをクリア（テスト用）
 */
export function clearCache(): void;
```

`public/data/index.json` の `files` 配列に基づいて各JSONファイルをfetchする。
全ファイルを `Promise.all` で並列取得し、結合して1つの配列にする。
日付型のフィールドはないので、パース後にそのまま使える。

### 2. シャッフル `src/utils/shuffle.ts`

```typescript
/**
 * Fisher-Yates シャッフル（元の配列は変更しない）
 */
export function shuffle<T>(array: T[]): T[];
```

### 3. フィルタ `src/utils/questionFilter.ts`

```typescript
import type { Question, Exam, Season, SubCategory } from "../types";

export interface QuestionFilter {
  exam?: Exam;
  year?: number;
  season?: Season;
  subCategory?: SubCategory;
  questionIds?: string[];  // 間違い問題の復習時にID指定
}

/**
 * 条件に合う問題をフィルタリングして返す
 */
export function filterQuestions(questions: Question[], filter: QuestionFilter): Question[];

/**
 * フィルタ条件に合致する問題数を返す（設定画面でリアルタイム表示用）
 */
export function countFilteredQuestions(questions: Question[], filter: QuestionFilter): number;
```

### 4. カスタムフック `src/hooks/useQuestions.ts`

```typescript
import { useState, useEffect } from "react";
import type { Question } from "../types";
import { loadAllQuestions } from "../utils/dataLoader";

/**
 * 全問題データを読み込むフック
 * ローディング状態とエラーも返す
 */
export function useQuestions(): {
  questions: Question[];
  isLoading: boolean;
  error: Error | null;
};
```

### 5. テスト

`src/utils/__tests__/shuffle.test.ts`:
- 要素数が変わらないこと
- 元の配列が変更されないこと
- 全要素が含まれること（ソートして比較）
- 十分な回数実行して、毎回同じ順序にならないこと

`src/utils/__tests__/questionFilter.test.ts`:
- モックの Question 配列を用意
- exam フィルタ、year フィルタ、subCategory フィルタそれぞれ単体テスト
- 複数条件の組み合わせテスト
- 空結果のケース
- questionIds 指定のテスト

テスト用のモック問題データ:

```typescript
// src/utils/__tests__/mockQuestions.ts
import type { Question } from "../../types";

export const mockQuestions: Question[] = [
  {
    id: "AP-2024A-Q01",
    exam: "AP",
    year: 2024,
    season: "秋",
    questionNumber: 1,
    majorCategory: "テクノロジ系",
    subCategory: "セキュリティ",
    questionText: "テスト問題1",
    choices: { ア: "選択肢ア", イ: "選択肢イ", ウ: "選択肢ウ", エ: "選択肢エ" },
    correctAnswer: "ア",
    explanation: "テスト解説1",
  },
  // ... AP/SC, 異なる年度・分野のモックを最低10問用意
];
```

## 参照すべきファイル

- `src/types/index.ts`
- `src/constants/categories.ts`
- `public/data/index.json`（Task 02 で作成）

## 完了条件

- [ ] `src/utils/dataLoader.ts` が実装され、全問題を統合して返す
- [ ] `src/utils/shuffle.ts` が実装されている
- [ ] `src/utils/questionFilter.ts` が実装されている
- [ ] `src/hooks/useQuestions.ts` が実装されている
- [ ] 全テストがパスする

## テスト方法

```bash
npm run test -- --run src/utils/
```
