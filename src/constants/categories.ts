import type { Exam, MajorCategory, Season, SubCategory } from "../types";

export const CATEGORY_MAP: Record<MajorCategory, SubCategory[]> = {
  テクノロジ系: [
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
  マネジメント系: ["プロジェクトマネジメント", "サービスマネジメント", "システム監査"],
  ストラテジ系: [
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
export const ALL_MAJOR_CATEGORIES: MajorCategory[] = Object.keys(
  CATEGORY_MAP,
) as MajorCategory[];

/** 中分類 → 大分類の逆引き */
export const SUB_TO_MAJOR: Record<SubCategory, MajorCategory> = Object.entries(
  CATEGORY_MAP,
).reduce(
  (acc, [major, subs]) => {
    for (const sub of subs) {
      acc[sub] = major as MajorCategory;
    }
    return acc;
  },
  {} as Record<SubCategory, MajorCategory>,
);

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
 * 2020年春 〜 2025年秋（令和2年〜令和7年）
 * ※2026年度以降はCBT化により問題非公開
 */
export const TARGET_YEARS = [2020, 2021, 2022, 2023, 2024, 2025] as const;

/**
 * 年度・季節ごとの実施有無
 * ※2020年春はコロナで中止（AP春中止, SC春中止）
 * ※2021年以降は春秋ともに実施
 */
export const EXAM_SCHEDULE: { year: number; season: Season; exams: Exam[] }[] = [
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

/** 各回の問題数 */
export const QUESTIONS_PER_EXAM: Record<Exam, number> = {
  AP: 80,
  SC: 25,
};

/** 季節 → ID内の記号 */
export const SEASON_CODE: Record<Season, "S" | "A"> = {
  春: "S",
  秋: "A",
};

/** ID内の記号 → 季節 */
export const CODE_TO_SEASON: Record<"S" | "A", Season> = {
  S: "春",
  A: "秋",
};
