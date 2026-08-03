import { useCallback, useEffect, useState } from "react";

import { getAllAnswerRecords, getAnsweredQuestionIds } from "../db/answerRecords";
import { getIncompleteSession } from "../db/sessions";
import { loadAllQuestions } from "../utils/dataLoader";

export interface HomeStats {
  /** アプリ内の全問題数 */
  totalQuestions: number;
  /** 解答したユニーク問題数 */
  answeredQuestions: number;
  /** 総解答回数 */
  totalAnswers: number;
  /** 正答率（0〜1）。解答が0件なら null */
  correctRate: number | null;
  hasIncompleteSession: boolean;
  incompleteSessionId?: string;
  /** 未完了セッションの進捗表示用 */
  incompleteProgress?: { currentIndex: number; totalQuestions: number };
}

interface UseHomeStatsResult {
  stats: HomeStats | null;
  isLoading: boolean;
  reload: () => void;
}

export function useHomeStats(): UseHomeStatsResult {
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const [questions, answeredIds, allAnswers, incomplete] = await Promise.all([
          loadAllQuestions().catch(() => []),
          getAnsweredQuestionIds(),
          getAllAnswerRecords(),
          getIncompleteSession(),
        ]);

        if (cancelled) return;

        const correctCount = allAnswers.filter((record) => record.isCorrect).length;

        setStats({
          totalQuestions: questions.length,
          answeredQuestions: answeredIds.length,
          totalAnswers: allAnswers.length,
          correctRate: allAnswers.length > 0 ? correctCount / allAnswers.length : null,
          hasIncompleteSession: !!incomplete,
          incompleteSessionId: incomplete?.id,
          incompleteProgress: incomplete
            ? {
                currentIndex: incomplete.currentIndex,
                totalQuestions: incomplete.totalQuestions,
              }
            : undefined,
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { stats, isLoading, reload };
}
