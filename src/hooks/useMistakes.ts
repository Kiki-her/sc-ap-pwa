import { useCallback, useEffect, useMemo, useState } from "react";

import { getAllMistakes, toggleArchive as persistToggleArchive } from "../db/mistakes";
import { createSessionFromQuestionIds } from "./useCreateSession";
import { loadAllQuestions } from "../utils/dataLoader";
import type { Exam, MistakeEntry, Question, SubCategory } from "../types";

export interface MistakeWithQuestion {
  mistake: MistakeEntry;
  question: Question;
}

export interface MistakesFilter {
  exam?: Exam;
  year?: number;
  subCategory?: SubCategory;
  /** 間違い回数順 / 最終日時順 */
  sortBy: "count" | "date";
  showArchived: boolean;
}

interface UseMistakesResult {
  mistakes: MistakeWithQuestion[];
  isLoading: boolean;
  toggleArchive: (questionId: string) => Promise<void>;
  createReviewSession: () => Promise<string>;
}

export function useMistakes(filter: MistakesFilter): UseMistakesResult {
  const [entries, setEntries] = useState<MistakeWithQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const [mistakes, questions] = await Promise.all([getAllMistakes(), loadAllQuestions()]);
        if (cancelled) return;

        const questionMap = new Map(questions.map((question) => [question.id, question]));
        setEntries(
          mistakes.flatMap((mistake) => {
            const question = questionMap.get(mistake.questionId);
            return question ? [{ mistake, question }] : [];
          }),
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const mistakes = useMemo(() => {
    const filtered = entries.filter(({ mistake, question }) => {
      if (!filter.showArchived && mistake.archived) return false;
      if (filter.exam && question.exam !== filter.exam) return false;
      if (typeof filter.year === "number" && question.year !== filter.year) return false;
      if (filter.subCategory && question.subCategory !== filter.subCategory) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (filter.sortBy === "count") {
        return (
          b.mistake.mistakeCount - a.mistake.mistakeCount ||
          b.mistake.lastMistakenAt.getTime() - a.mistake.lastMistakenAt.getTime()
        );
      }
      return b.mistake.lastMistakenAt.getTime() - a.mistake.lastMistakenAt.getTime();
    });
  }, [entries, filter]);

  const toggleArchive = useCallback(async (questionId: string) => {
    await persistToggleArchive(questionId);
    setReloadToken((prev) => prev + 1);
  }, []);

  const createReviewSession = useCallback(async () => {
    return createSessionFromQuestionIds(
      mistakes.map((item) => item.question.id),
      "mistakes",
    );
  }, [mistakes]);

  return { mistakes, isLoading, toggleArchive, createReviewSession };
}
