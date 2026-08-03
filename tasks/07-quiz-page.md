# Task 07: 出題画面の実装

## 背景

アプリの中核画面。1問ずつ問題を表示し、選択肢をタップして解答、正誤判定と解説表示を行う。

## ゴール

セッション内の問題を1問ずつ解答でき、記録が保存され、中断・再開ができる。

## 技術的な指示

### 1. ページ `src/pages/QuizPage.tsx`

URLパラメータ `sessionId` を受け取り、セッション情報をDBから読み込む。

#### 解答前の状態:

```
┌─────────────────────────┐
│  ← 終了    3 / 25        │  ← ヘッダー（進捗）
│  ████████░░░░░░ (12%)    │  ← プログレスバー
├─────────────────────────┤
│                         │
│  問3                     │
│  [セキュリティ] [SC 2024春] │  ← 分野タグ + 出典
│                         │
│  DNSSECで実現できるものは  │
│  どれか。                 │
│                         │
│  [図がある場合は画像表示]   │
│                         │
│  ┌───────────────────┐  │
│  │ ア: DNSキャッシュ...  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ イ: DNS応答の正当性... │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ウ: DNSクエリの暗号... │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ エ: DNS通信の秘匿...  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

#### 解答後の状態:

```
┌─────────────────────────┐
│  ← 終了    3 / 25        │
│  ████████░░░░░░ (12%)    │
├─────────────────────────┤
│  問3                     │
│  [セキュリティ] [SC 2024春] │
│                         │
│  DNSSECで実現できるものは  │
│  どれか。                 │
│                         │
│  ┌───────────────────┐  │
│  │ ア: DNSキャッシュ...  │  │ ← 通常色
│  └───────────────────┘  │
│  ┌─── ✅ 正解 ─────────┐ │
│  │ イ: DNS応答の正当性... │  │ ← 緑ハイライト
│  └───────────────────┘  │
│  ┌─── ✗ ──────────────┐  │
│  │ ウ: DNSクエリの暗号... │  │ ← 赤ハイライト（選択した不正解）
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ エ: DNS通信の秘匿...  │  │ ← 通常色
│  └───────────────────┘  │
│                         │
│  ▼ 解説                  │
│  DNSSECは、DNS応答に      │
│  デジタル署名を付与する... │
│                         │
│  ┌───────────────────┐  │
│  │     次の問題 →        │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 2. 出題ロジックフック `src/hooks/useQuiz.ts`

```typescript
export interface QuizState {
  session: Session | null;
  currentQuestion: Question | null;
  selectedAnswer: ChoiceKey | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  isLastQuestion: boolean;
  isLoading: boolean;
}

export interface QuizActions {
  submitAnswer: (choice: ChoiceKey) => Promise<void>;
  goToNext: () => Promise<void>;
  quitQuiz: () => void;
}

export function useQuiz(sessionId: string): QuizState & QuizActions;
```

`submitAnswer` の処理:
1. 正誤判定
2. `addAnswerRecord()` でDB保存
3. 不正解なら `upsertMistake()` で間違い記録更新
4. `updateSession()` で `correctCount` を更新

`goToNext` の処理:
1. `currentIndex + 1` に更新
2. `updateSession()` で `currentIndex` を更新
3. 最終問題なら `completedAt` をセットして `/result/:sessionId` に navigate

### 3. コンポーネント

- `src/components/quiz/QuestionCard.tsx` — 問題文表示（画像含む）
- `src/components/quiz/ChoiceButton.tsx` — 選択肢ボタン（未回答/正解/不正解/通常の4状態）
- `src/components/quiz/ExplanationPanel.tsx` — 解説パネル（折りたたみ可）
- `src/components/quiz/QuizHeader.tsx` — ヘッダー（進捗バー + 終了ボタン）

### 4. ChoiceButton の状態

```typescript
type ChoiceState = "default" | "selected-correct" | "selected-wrong" | "correct" | "disabled";
```

- `default`: 未回答時の通常状態
- `selected-correct`: 選択した選択肢が正解
- `selected-wrong`: 選択した選択肢が不正解
- `correct`: 選択しなかったが正解の選択肢（不正解時に正解を示す）
- `disabled`: 解答済みでタップ不可

### 5. 中断・再開

- セッションの `currentIndex` はDBに保存されているので、ブラウザを閉じても再開可能
- ホーム画面の「続きから」ボタンでこの画面に遷移する
- 「← 終了」ボタンをタップすると確認ダイアログを表示し、OKならホームに戻る（セッションはDB上に未完了で残る）

## 参照すべきファイル

- `src/types/index.ts`
- `src/db/sessions.ts`, `src/db/answerRecords.ts`, `src/db/mistakes.ts`
- `src/utils/dataLoader.ts`
- `src/hooks/useQuestions.ts`

## 完了条件

- [ ] セッションIDに基づいて問題が1問ずつ表示される
- [ ] 選択肢タップで正誤判定される
- [ ] 正解は緑、不正解は赤でハイライトされ、不正解時は正解も表示される
- [ ] 解説が表示される
- [ ] 「次の問題」で次に進む
- [ ] 最終問題の後に結果画面に自動遷移する
- [ ] 解答記録がDBに保存される（DevToolsで確認）
- [ ] 不正解時にMistakeEntryが保存・更新される
- [ ] 途中で「← 終了」してホームに戻り、「続きから」で再開すると中断箇所から再開する
- [ ] プログレスバーが正しく進む
- [ ] 問題文中の画像がある場合に表示される

## テスト方法

1. `/settings` でセッション作成 → 出題画面に遷移
2. 数問解答して正誤・解説を確認
3. DevTools > Application > IndexedDB で answerRecords, sessions, mistakes を確認
4. 途中でブラウザタブを閉じ、ホーム画面から「続きから」で再開を確認
5. 最終問題まで解答して結果画面遷移を確認
