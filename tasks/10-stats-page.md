# Task 10: 学習履歴・統計画面の実装

## 背景

学習の進捗と弱点を可視化する画面。日々の学習量と分野別の正答率をグラフで表示する。

## ゴール

学習履歴画面にグラフと統計情報が正しく表示される。

## 技術的な指示

### 1. 統計フック `src/hooks/useStats.ts`

```typescript
export interface DailyCount {
  date: string;     // "2025-01-15"
  count: number;    // その日の解答数
  correct: number;  // その日の正答数
}

export interface CategoryStat {
  subCategory: SubCategory;
  total: number;
  correct: number;
  rate: number;     // 0〜1
}

export interface StudyStats {
  dailyCounts: DailyCount[];        // 直近30日分
  categoryStats: CategoryStat[];    // 分野別
  weakCategories: CategoryStat[];   // 正答率が低い上位5分野
  totalAnswered: number;
  totalCorrectRate: number;
  streakDays: number;               // 連続学習日数
}

export function useStats(): {
  stats: StudyStats | null;
  isLoading: boolean;
};
```

**連続学習日数の計算:**
今日（または昨日）から遡って、解答記録がある連続した日数をカウント。
今日まだ学習していなくても、昨日まで連続していればカウント継続。

**分野別正答率:**
全 AnswerRecord を questionId → Question に紐づけ、subCategory でグルーピング。

### 2. ページ `src/pages/StatsPage.tsx`

```
┌─────────────────────────┐
│  ← 戻る    学習履歴       │
├─────────────────────────┤
│  累計                    │
│  総解答数: 450問          │
│  正答率: 72.3%           │
│  連続学習: 7日           │
├─────────────────────────┤
│  直近30日の学習量         │
│  ┌───────────────────┐  │
│  │  棒グラフ（Recharts）│  │
│  │  X軸: 日付          │  │
│  │  Y軸: 解答数         │  │
│  └───────────────────┘  │
├─────────────────────────┤
│  分野別正答率             │
│  ┌───────────────────┐  │
│  │  横棒グラフ          │  │
│  │  セキュリティ  82%   │  │
│  │  ネットワーク  65%   │  │
│  │  ...               │  │
│  └───────────────────┘  │
├─────────────────────────┤
│  苦手分野 TOP5           │
│  1. データベース (42%)   │
│  2. システム監査 (50%)   │
│  3. ...                 │
└─────────────────────────┘
```

### 3. グラフコンポーネント

**Recharts を使用:**

`src/components/stats/DailyChart.tsx`:
- Recharts の `BarChart` + `Bar` + `XAxis` + `YAxis` + `Tooltip`
- レスポンシブ: `ResponsiveContainer` でラップ
- 高さ: 200px 程度
- 日付がない日は 0 で埋める（直近30日分を連続で表示）

`src/components/stats/CategoryChart.tsx`:
- 分野別正答率の横棒グラフ
- Recharts の `BarChart` (layout="vertical") または自前のTailwind CSSバー
- 解答実績のない分野は「未学習」と表示
- 正答率の色分け: 80%以上=緑, 60-79%=黄, 60%未満=赤

### 4. データ0件の初期状態

- グラフは空で表示（「まだ学習データがありません」のメッセージ）
- 累計は全て 0 / "--" で表示
- クラッシュしないことが重要

## 参照すべきファイル

- `src/types/index.ts`
- `src/db/answerRecords.ts`
- `src/utils/dataLoader.ts`（問題のsubCategoryを引くため）

## 完了条件

- [ ] 累計統計（総解答数、正答率、連続学習日数）が正しく表示される
- [ ] 直近30日の棒グラフが表示される
- [ ] 分野別正答率の横棒グラフが表示される
- [ ] 苦手分野TOP5が正答率昇順で表示される
- [ ] 解答実績のない分野は「未学習」と表示される
- [ ] データ0件の初期状態でクラッシュせず空の状態が表示される
- [ ] グラフがスマホ画面幅に合わせてレスポンシブに表示される

## テスト方法

1. 初期状態（DB空）で `/stats` にアクセスし、クラッシュしないことを確認
2. 複数セッションを解答してデータを蓄積
3. `/stats` で各グラフ・統計が正しく表示されることを確認
4. ブラウザ幅を変えてレスポンシブを確認
