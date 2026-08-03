# Task 06: 出題設定画面の実装

## 背景

学習開始前に、出題モード・フィルタ条件・問題数を選択する画面。
選択した条件でセッションを作成し、出題画面に遷移する。

## ゴール

3つのモード（全シャッフル/年度別/分野別）で条件を設定し、セッションを作成して出題画面に遷移できる。

## 技術的な指示

### 1. ページ `src/pages/QuizSettingsPage.tsx`

レイアウト:

```
┌─────────────────────────┐
│  ← 戻る    出題設定       │
├─────────────────────────┤
│  [全シャッフル] [年度別] [分野別] │  ← タブ切替
├─────────────────────────┤
│                         │
│  ── 試験種別 ──          │
│  [AP] [SC] [両方]        │  ← セグメントコントロール
│                         │
│  ── 問題数 ──            │
│  [10] [25] [50] [全問]   │  ← 選択チップ
│                         │
│  該当: 235問             │  ← リアルタイムカウント
│                         │
│  ┌───────────────────┐  │
│  │     開始する         │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

年度別モード追加表示:
```
│  ── 年度 ──              │
│  [2020] [2021] ... [2025] │
│  ── 季節 ──              │
│  [春] [秋] [両方]        │
```

分野別モード追加表示:
```
│  ── 大分類 ──            │
│  [テクノロジ系] [マネジメント系] [ストラテジ系] │
│  ── 中分類 ──            │
│  [セキュリティ] [ネットワーク] ... │  ← 選択した大分類に連動
```

### 2. セッション作成ロジック `src/hooks/useCreateSession.ts`

```typescript
export interface QuizSettings {
  mode: "all" | "year" | "category";
  exam?: Exam;            // undefined = 両方
  year?: number;          // 年度別モード時
  season?: Season;        // 年度別モード時（undefined = 両方）
  subCategory?: SubCategory; // 分野別モード時
  count: number | "all";  // 問題数（"all" = 全問）
}

export function useCreateSession(): {
  createSession: (settings: QuizSettings) => Promise<string>; // sessionId を返す
  isCreating: boolean;
};
```

処理フロー:
1. `loadAllQuestions()` で全問題取得
2. `filterQuestions()` で条件に合う問題を抽出
3. `shuffle()` でシャッフル
4. `count` に応じて `.slice(0, count)` で切り出し（"all" なら全問）
5. Session オブジェクトを作成して `db.sessions.add()`
6. 作成した `session.id` を返す
7. `/quiz/${session.id}` に navigate

### 3. コンポーネント

- `src/components/common/SegmentControl.tsx` — セグメントコントロール（汎用）
- `src/components/common/ChipSelect.tsx` — 選択チップ（複数の選択肢から1つ選ぶ）
- `src/components/common/TabBar.tsx` — タブ切替

### 4. バリデーション

- 該当問題数が0の場合、「開始する」ボタンを disabled にする
- 該当問題数はフィルタ条件の変更に即座に反応して更新する（`countFilteredQuestions` を使用）

## 参照すべきファイル

- `src/types/index.ts`
- `src/constants/categories.ts` — CATEGORY_MAP, EXAM_SCHEDULE, TARGET_YEARS
- `src/utils/questionFilter.ts`
- `src/utils/shuffle.ts`
- `src/utils/dataLoader.ts`
- `src/db/sessions.ts`

## 完了条件

- [ ] 3つのモード（全シャッフル/年度別/分野別）がタブで切替できる
- [ ] 各モードで条件を選択できる
- [ ] 試験種別（AP/SC/両方）を全モードで選択できる
- [ ] 問題数（10/25/50/全問）を選択できる
- [ ] 該当問題数がリアルタイムに表示される
- [ ] 分野別モードで大分類を選択すると中分類の選択肢が連動する
- [ ] 「開始する」ボタンでセッションがDBに保存される
- [ ] セッション作成後に `/quiz/:sessionId` に自動遷移する
- [ ] 該当0問の場合は開始ボタンが無効
- [ ] 「← 戻る」で `/` に遷移

## テスト方法

ブラウザで `/settings` にアクセスし、各モード・条件の選択を手動確認。
開始ボタン押下後、DevTools > Application > IndexedDB でセッションが保存されていることを確認。
`/quiz/:sessionId` に正しく遷移することを確認。
