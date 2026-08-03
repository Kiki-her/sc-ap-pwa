import type { Exam, Question, Season, SubCategory } from "../types";

export interface QuestionFilter {
  exam?: Exam;
  year?: number;
  season?: Season;
  subCategory?: SubCategory;
  /** 間違い問題の復習など、ID指定で絞り込む場合に使用 */
  questionIds?: string[];
}

/**
 * 条件に合う問題をフィルタリングして返す
 * 未指定の条件は無視される（AND 条件）
 */
export function filterQuestions(questions: Question[], filter: QuestionFilter): Question[] {
  const idSet = filter.questionIds ? new Set(filter.questionIds) : null;

  return questions.filter((question) => {
    if (idSet && !idSet.has(question.id)) return false;
    if (filter.exam && question.exam !== filter.exam) return false;
    if (typeof filter.year === "number" && question.year !== filter.year) return false;
    if (filter.season && question.season !== filter.season) return false;
    if (filter.subCategory && question.subCategory !== filter.subCategory) return false;
    return true;
  });
}

/**
 * フィルタ条件に合致する問題数を返す（設定画面でリアルタイム表示用）
 */
export function countFilteredQuestions(questions: Question[], filter: QuestionFilter): number {
  return filterQuestions(questions, filter).length;
}

/**
 * 指定した問題IDの並び順を保ったまま Question を取り出す
 * （セッションの questionIds 順に出題するために使用）
 */
export function pickQuestionsByIds(questions: Question[], questionIds: string[]): Question[] {
  const map = new Map(questions.map((question) => [question.id, question]));
  return questionIds
    .map((id) => map.get(id))
    .filter((question): question is Question => question !== undefined);
}
