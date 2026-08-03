import { useEffect, useState } from "react";

import { getAnswersBySession } from "../db/answerRecords";
import { getSession } from "../db/sessions";
import { loadAllQuestions } from "../utils/dataLoader";
import type { AnswerRecord, Question, Session, SubCategory } from "../types";

export interface CategoryResult {
  subCategory: SubCategory;
  total: number;
  correct: number;
  rate: number;
}

export interface ResultItem {
  question: Question;
  selectedAnswer: AnswerRecord["selectedAnswer"];
  isCorrect: boolean;
}

export interface SessionResult {
  session: Session;
  totalQuestions: number;
  correctCount: number;
  correctRate: number;
  categoryResults: CategoryResult[];
  /** 間違えた問題のID */
  mistakeQuestionIds: string[];
  /** 間違えた問題の詳細（モーダル表示用） */
  mistakeItems: ResultItem[];
  /** 解答した順の全問題（ドットインジケータ用） */
  items: ResultItem[];
}

interface UseSessionResultResult {
  result: SessionResult | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSessionResult(sessionId: string): UseSessionResultResult {
  const [result, setResult] = useState<SessionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const [session, answers, questions] = await Promise.all([
          getSession(sessionId),
          getAnswersBySession(sessionId),
          loadAllQuestions(),
        ]);
        if (cancelled) return;

        if (!session) {
          setError(new Error("セッションが見つかりません"));
          setResult(null);
          return;
        }

        const questionMap = new Map(questions.map((question) => [question.id, question]));

        // 同じ問題に複数解答がある場合は最初の解答を採用する
        const answerByQuestion = new Map<string, AnswerRecord>();
        for (const answer of answers) {
          if (!answerByQuestion.has(answer.questionId)) {
            answerByQuestion.set(answer.questionId, answer);
          }
        }

        const items: ResultItem[] = session.questionIds.flatMap((questionId) => {
          const question = questionMap.get(questionId);
          const answer = answerByQuestion.get(questionId);
          if (!question || !answer) return [];
          return [
            { question, selectedAnswer: answer.selectedAnswer, isCorrect: answer.isCorrect },
          ];
        });

        const categoryMap = new Map<SubCategory, { total: number; correct: number }>();
        for (const item of items) {
          const current = categoryMap.get(item.question.subCategory) ?? { total: 0, correct: 0 };
          current.total += 1;
          if (item.isCorrect) current.correct += 1;
          categoryMap.set(item.question.subCategory, current);
        }

        const categoryResults: CategoryResult[] = [...categoryMap.entries()]
          .map(([subCategory, value]) => ({
            subCategory,
            total: value.total,
            correct: value.correct,
            rate: value.total > 0 ? value.correct / value.total : 0,
          }))
          .sort((a, b) => b.total - a.total || a.subCategory.localeCompare(b.subCategory, "ja"));

        const mistakeItems = items.filter((item) => !item.isCorrect);
        const answeredCount = items.length;
        const correctCount = items.filter((item) => item.isCorrect).length;

        setResult({
          session,
          totalQuestions: answeredCount > 0 ? answeredCount : session.totalQuestions,
          correctCount,
          correctRate: answeredCount > 0 ? correctCount / answeredCount : 0,
          categoryResults,
          mistakeQuestionIds: mistakeItems.map((item) => item.question.id),
          mistakeItems,
          items,
        });
        setError(null);
      } catch (cause: unknown) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause : new Error("結果の集計に失敗しました"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { result, isLoading, error };
}
