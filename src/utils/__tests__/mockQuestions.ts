import type { ChoiceKey, Exam, MajorCategory, Question, Season, SubCategory } from "../../types";

interface MockOptions {
  id: string;
  exam: Exam;
  year: number;
  season: Season;
  questionNumber: number;
  majorCategory: MajorCategory;
  subCategory: SubCategory;
  correctAnswer?: ChoiceKey;
}

function mock(options: MockOptions): Question {
  return {
    id: options.id,
    exam: options.exam,
    year: options.year,
    season: options.season,
    questionNumber: options.questionNumber,
    majorCategory: options.majorCategory,
    subCategory: options.subCategory,
    questionText: `テスト問題 ${options.id}`,
    choices: { ア: "選択肢ア", イ: "選択肢イ", ウ: "選択肢ウ", エ: "選択肢エ" },
    correctAnswer: options.correctAnswer ?? "ア",
    explanation: `テスト解説 ${options.id}`,
  };
}

export const mockQuestions: Question[] = [
  mock({
    id: "AP-2024A-Q01",
    exam: "AP",
    year: 2024,
    season: "秋",
    questionNumber: 1,
    majorCategory: "テクノロジ系",
    subCategory: "セキュリティ",
  }),
  mock({
    id: "AP-2024A-Q02",
    exam: "AP",
    year: 2024,
    season: "秋",
    questionNumber: 2,
    majorCategory: "テクノロジ系",
    subCategory: "ネットワーク",
    correctAnswer: "イ",
  }),
  mock({
    id: "AP-2024S-Q01",
    exam: "AP",
    year: 2024,
    season: "春",
    questionNumber: 1,
    majorCategory: "テクノロジ系",
    subCategory: "データベース",
    correctAnswer: "ウ",
  }),
  mock({
    id: "AP-2023A-Q01",
    exam: "AP",
    year: 2023,
    season: "秋",
    questionNumber: 1,
    majorCategory: "テクノロジ系",
    subCategory: "アルゴリズムとプログラミング",
  }),
  mock({
    id: "AP-2023A-Q02",
    exam: "AP",
    year: 2023,
    season: "秋",
    questionNumber: 2,
    majorCategory: "マネジメント系",
    subCategory: "プロジェクトマネジメント",
    correctAnswer: "エ",
  }),
  mock({
    id: "AP-2023A-Q03",
    exam: "AP",
    year: 2023,
    season: "秋",
    questionNumber: 3,
    majorCategory: "ストラテジ系",
    subCategory: "経営戦略マネジメント",
  }),
  mock({
    id: "SC-2024S-Q01",
    exam: "SC",
    year: 2024,
    season: "春",
    questionNumber: 1,
    majorCategory: "テクノロジ系",
    subCategory: "セキュリティ",
    correctAnswer: "イ",
  }),
  mock({
    id: "SC-2024S-Q02",
    exam: "SC",
    year: 2024,
    season: "春",
    questionNumber: 2,
    majorCategory: "テクノロジ系",
    subCategory: "ネットワーク",
  }),
  mock({
    id: "SC-2024A-Q01",
    exam: "SC",
    year: 2024,
    season: "秋",
    questionNumber: 1,
    majorCategory: "テクノロジ系",
    subCategory: "セキュリティ",
    correctAnswer: "ウ",
  }),
  mock({
    id: "SC-2023A-Q01",
    exam: "SC",
    year: 2023,
    season: "秋",
    questionNumber: 1,
    majorCategory: "テクノロジ系",
    subCategory: "システム構成要素",
  }),
  mock({
    id: "SC-2023A-Q02",
    exam: "SC",
    year: 2023,
    season: "秋",
    questionNumber: 2,
    majorCategory: "マネジメント系",
    subCategory: "サービスマネジメント",
    correctAnswer: "エ",
  }),
  mock({
    id: "SC-2023A-Q03",
    exam: "SC",
    year: 2023,
    season: "秋",
    questionNumber: 3,
    majorCategory: "ストラテジ系",
    subCategory: "法務",
  }),
];
