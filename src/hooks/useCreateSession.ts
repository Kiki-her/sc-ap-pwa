import { useCallback, useState } from "react";

import { createSession as persistSession } from "../db/sessions";
import { filterQuestions } from "../utils/questionFilter";
import { loadAllQuestions } from "../utils/dataLoader";
import { shuffle } from "../utils/shuffle";
import type { Exam, QuizMode, Season, Session, SubCategory } from "../types";

export interface QuizSettings {
  mode: Extract<QuizMode, "all" | "year" | "category">;
  /** undefined = 両方 */
  exam?: Exam;
  year?: number;
  /** undefined = 両方 */
  season?: Season;
  subCategory?: SubCategory;
  /** 問題数（"all" = 全問） */
  count: number | "all";
}

interface UseCreateSessionResult {
  createSession: (settings: QuizSettings) => Promise<string>;
  createSessionFromIds: (questionIds: string[], mode?: QuizMode) => Promise<string>;
  isCreating: boolean;
}

function newSessionId(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);
  return `session-${Date.now()}-${random}`;
}

/** 問題IDリストからセッションを作成する（間違い復習で共用） */
export async function createSessionFromQuestionIds(
  questionIds: string[],
  mode: QuizMode = "mistakes",
): Promise<string> {
  if (questionIds.length === 0) {
    throw new Error("出題できる問題がありません");
  }

  const shuffled = shuffle(questionIds);
  const session: Session = {
    id: newSessionId(),
    mode,
    questionIds: shuffled,
    currentIndex: 0,
    totalQuestions: shuffled.length,
    correctCount: 0,
    startedAt: new Date(),
  };

  await persistSession(session);
  return session.id;
}

export function useCreateSession(): UseCreateSessionResult {
  const [isCreating, setIsCreating] = useState(false);

  const createSession = useCallback(async (settings: QuizSettings): Promise<string> => {
    setIsCreating(true);
    try {
      const questions = await loadAllQuestions();
      const filtered = filterQuestions(questions, {
        exam: settings.exam,
        year: settings.mode === "year" ? settings.year : undefined,
        season: settings.mode === "year" ? settings.season : undefined,
        subCategory: settings.mode === "category" ? settings.subCategory : undefined,
      });

      if (filtered.length === 0) {
        throw new Error("条件に合う問題がありません");
      }

      const shuffled = shuffle(filtered);
      const sliced =
        settings.count === "all" ? shuffled : shuffled.slice(0, Math.max(settings.count, 1));

      const session: Session = {
        id: newSessionId(),
        mode: settings.mode,
        examFilter: settings.exam,
        yearFilter: settings.mode === "year" ? settings.year : undefined,
        seasonFilter: settings.mode === "year" ? settings.season : undefined,
        categoryFilter: settings.mode === "category" ? settings.subCategory : undefined,
        questionIds: sliced.map((question) => question.id),
        currentIndex: 0,
        totalQuestions: sliced.length,
        correctCount: 0,
        startedAt: new Date(),
      };

      await persistSession(session);
      return session.id;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const createSessionFromIds = useCallback(
    async (questionIds: string[], mode: QuizMode = "mistakes"): Promise<string> => {
      setIsCreating(true);
      try {
        return await createSessionFromQuestionIds(questionIds, mode);
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  return { createSession, createSessionFromIds, isCreating };
}
