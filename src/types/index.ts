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

/** 選択肢キーの表示順 */
export const CHOICE_KEYS: ChoiceKey[] = ["ア", "イ", "ウ", "エ"];

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
  imageUrl?: string | null;
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

// ===== データファイルのメタ情報 =====

export interface DataFileMeta {
  filename: string;
  exam: Exam;
  year: number;
  season: Season;
  count: number;
}

export interface DataIndex {
  files: DataFileMeta[];
  totalQuestions: number;
  lastUpdated: string;
}
