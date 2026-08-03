# Task 01: 型定義とカテゴリマスタ

## 背景

アプリ全体で使用する TypeScript 型定義と、IPA公式分類に基づくカテゴリ定数を定義する。
この定義が全タスクの基盤になるため、正確かつ網羅的に作成する。

## ゴール

型定義ファイルとカテゴリ定数ファイルが作成され、他ファイルから import してコンパイルが通る。

## 技術的な指示

### 1. 型定義 `src/types/index.ts`

```typescript
// ===== 試験・分類 =====

export type Exam = "AP" | "SC";

export type Season = "春" | "秋";

export type MajorCategory = "テクノロジ系" | "マネジメント系" | "ストラテジ系";

export type SubCategory =
  // テクノロジ系
  | "基礎理論"
  | "アルゴリズムとプログラミング"
  | "コンピュータ構成要素"
  | "システム構成要素"
  | "ソフトウェア"
  | "ハードウェア"
  | "ヒューマンインターフェイス"
  | "マルチメディア"
  | "データベース"
  | "ネットワーク"
  | "セキュリティ"
  | "システム開発技術"
  | "ソフトウェア開発管理技術"
  // マネジメント系
  | "プロジェクトマネジメント"
  | "サービスマネジメント"
  | "システム監査"
  // ストラテジ系
  | "システム戦略"
  | "システム企画"
  | "経営戦略マネジメント"
  | "技術戦略マネジメント"
  | "ビジネスインダストリ"
  | "企業活動"
  | "法務";

export type ChoiceKey = "ア" | "イ" | "ウ" | "エ";

// ===== 過去問データ =====

export interface Question {
  /** 例: "AP-2024A-Q32", "SC-2024S-Q15" */
  id: string;
  exam: Exam;
  year: number;
  season: Season;
  questionNumber: number;
  majorCategory: MajorCategory;
  subCategory: SubCategory;
  questionText: string;
  choices: Record<ChoiceKey, string>;
  correctAnswer: ChoiceKey;
  explanation: string;
  /** 問題文中に図表がある場合の画像パス */
  imageUrl?: string;
}

// ===== ユーザーデータ（IndexedDB） =====

export interface AnswerRecord {
  id?: number;
  questionId: string;
  selectedAnswer: ChoiceKey;
  isCorrect: boolean;
  answeredAt: Date;
  sessionId: string;
}

export type QuizMode = "all" | "year" | "category" | "mistakes";

export interface Session {
  id: string;
  mode: QuizMode;
  examFilter?: Exam;
  yearFilter?: number;
  seasonFilter?: Season;
  categoryFilter?: SubCategory;
  questionIds: string[];
  currentIndex: number;
  totalQuestions: number;
  correctCount: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface MistakeEntry {
  questionId: string;
  mistakeCount: number;
  lastMistakenAt: Date;
  archived: boolean;
}
```

### 2. カテゴリ定数 `src/constants/categories.ts`

```typescript
import type { MajorCategory, SubCategory } from "../types";

export const CATEGORY_MAP: Record<MajorCategory, SubCategory[]> = {
  "テクノロジ系": [
    "基礎理論",
    "アルゴリズムとプログラミング",
    "コンピュータ構成要素",
    "システム構成要素",
    "ソフトウェア",
    "ハードウェア",
    "ヒューマンインターフェイス",
    "マルチメディア",
    "データベース",
    "ネットワーク",
    "セキュリティ",
    "システム開発技術",
    "ソフトウェア開発管理技術",
  ],
  "マネジメント系": [
    "プロジェクトマネジメント",
    "サービスマネジメント",
    "システム監査",
  ],
  "ストラテジ系": [
    "システム戦略",
    "システム企画",
    "経営戦略マネジメント",
    "技術戦略マネジメント",
    "ビジネスインダストリ",
    "企業活動",
    "法務",
  ],
};

/** 全中分類の配列 */
export const ALL_SUB_CATEGORIES: SubCategory[] = Object.values(CATEGORY_MAP).flat();

/** 大分類の配列 */
export const ALL_MAJOR_CATEGORIES: MajorCategory[] = Object.keys(CATEGORY_MAP) as MajorCategory[];

/** SC 科目A-2 の出題範囲に含まれる中分類 */
export const SC_EXAM_CATEGORIES: SubCategory[] = [
  "セキュリティ",
  "ネットワーク",
  "データベース",
  "システム開発技術",
  "ソフトウェア開発管理技術",
  "サービスマネジメント",
  "システム監査",
];

/**
 * 対象データの年度範囲
 * 直近5年分: 2020年春 〜 2025年秋（令和2年〜令和7年）
 * ※2026年度以降はCBT化により問題非公開
 */
export const TARGET_YEARS = [2020, 2021, 2022, 2023, 2024, 2025] as const;

/**
 * 年度・季節ごとの実施有無
 * ※2020年春はコロナで中止（AP春中止, SC春中止）
 * ※2021年以降は春秋ともに実施
 */
export const EXAM_SCHEDULE: { year: number; season: "春" | "秋"; exams: ("AP" | "SC")[] }[] = [
  // 2020: 春は中止、秋のみ
  { year: 2020, season: "秋", exams: ["AP", "SC"] },
  // 2021〜2025: 春秋ともに実施
  { year: 2021, season: "春", exams: ["AP", "SC"] },
  { year: 2021, season: "秋", exams: ["AP", "SC"] },
  { year: 2022, season: "春", exams: ["AP", "SC"] },
  { year: 2022, season: "秋", exams: ["AP", "SC"] },
  { year: 2023, season: "春", exams: ["AP", "SC"] },
  { year: 2023, season: "秋", exams: ["AP", "SC"] },
  { year: 2024, season: "春", exams: ["AP", "SC"] },
  { year: 2024, season: "秋", exams: ["AP", "SC"] },
  { year: 2025, season: "春", exams: ["AP", "SC"] },
  { year: 2025, season: "秋", exams: ["AP", "SC"] },
];
```

### 3. 補足: ID命名規則

問題IDは以下のフォーマットに統一する:

- `{Exam}-{Year}{Season初文字}-Q{番号2桁}`
- 季節: 春="S", 秋="A"
- 例: `AP-2024A-Q32`（応用情報 2024年秋 問32）
- 例: `SC-2023S-Q15`（支援士 2023年春 問15）

## 参照すべきファイル

- `tasks/` 内の設計ドキュメント全般（型定義が参照される）

## 完了条件

- [ ] `src/types/index.ts` が作成され、全型がエクスポートされている
- [ ] `src/constants/categories.ts` が作成され、全定数がエクスポートされている
- [ ] `npm run build` でコンパイルエラーが出ない
- [ ] 他ファイルから `import type { Question } from "../types"` のように import できる
- [ ] EXAM_SCHEDULE の実施回数が正しい（2020春中止を反映、合計19回）

## テスト方法

```bash
npm run build  # コンパイル確認
```

型定義は実行時テスト不要。コンパイルが通れば完了。
