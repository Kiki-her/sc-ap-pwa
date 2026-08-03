import { useEffect, useState } from "react";

import { loadAllQuestions } from "../utils/dataLoader";
import type { Question } from "../types";

interface UseQuestionsResult {
  questions: Question[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * 全問題データを読み込むフック
 * ローディング状態とエラーも返す
 */
export function useQuestions(): UseQuestionsResult {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    loadAllQuestions()
      .then((loaded) => {
        if (cancelled) return;
        setQuestions(loaded);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause : new Error("問題データの読み込みに失敗しました"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { questions, isLoading, error };
}
