import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addAnswerRecord } from "../db/answerRecords";
import { getSession, updateSession } from "../db/sessions";
import { loadAllQuestions } from "../utils/dataLoader";
import { upsertMistake } from "../db/mistakes";
import type { ChoiceKey, Question, Session } from "../types";

export interface QuizState {
  session: Session | null;
  currentQuestion: Question | null;
  selectedAnswer: ChoiceKey | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  isLastQuestion: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface QuizActions {
  submitAnswer: (choice: ChoiceKey) => Promise<void>;
  goToNext: () => Promise<void>;
  quitQuiz: () => void;
}

export function useQuiz(sessionId: string): QuizState & QuizActions {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [questionMap, setQuestionMap] = useState<Map<string, Question> | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<ChoiceKey | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const [loadedSession, questions] = await Promise.all([
          getSession(sessionId),
          loadAllQuestions(),
        ]);
        if (cancelled) return;

        if (!loadedSession) {
          setError(new Error("セッションが見つかりません"));
          return;
        }

        setSession(loadedSession);
        setQuestionMap(new Map(questions.map((question) => [question.id, question])));
        setError(null);
      } catch (cause: unknown) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause : new Error("読み込みに失敗しました"));
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

  const currentQuestionId = session?.questionIds[session.currentIndex] ?? null;
  const currentQuestion =
    currentQuestionId && questionMap ? (questionMap.get(currentQuestionId) ?? null) : null;
  const isLastQuestion = session ? session.currentIndex >= session.totalQuestions - 1 : false;

  const submitAnswer = useCallback(
    async (choice: ChoiceKey) => {
      if (!session || !currentQuestion || selectedAnswer !== null || isSubmitting.current) return;
      isSubmitting.current = true;

      try {
        const correct = choice === currentQuestion.correctAnswer;
        setSelectedAnswer(choice);
        setIsCorrect(correct);

        await addAnswerRecord({
          questionId: currentQuestion.id,
          selectedAnswer: choice,
          isCorrect: correct,
          answeredAt: new Date(),
          sessionId: session.id,
        });

        if (!correct) {
          await upsertMistake(currentQuestion.id);
        }

        const nextCorrectCount = session.correctCount + (correct ? 1 : 0);
        await updateSession(session.id, { correctCount: nextCorrectCount });
        setSession({ ...session, correctCount: nextCorrectCount });
      } finally {
        isSubmitting.current = false;
      }
    },
    [currentQuestion, selectedAnswer, session],
  );

  const goToNext = useCallback(async () => {
    if (!session) return;

    if (session.currentIndex >= session.totalQuestions - 1) {
      const completedAt = new Date();
      await updateSession(session.id, {
        currentIndex: session.totalQuestions,
        completedAt,
      });
      navigate(`/result/${session.id}`, { replace: true });
      return;
    }

    const nextIndex = session.currentIndex + 1;
    await updateSession(session.id, { currentIndex: nextIndex });
    setSession({ ...session, currentIndex: nextIndex });
    setSelectedAnswer(null);
    setIsCorrect(null);
    window.scrollTo({ top: 0 });
  }, [navigate, session]);

  const quitQuiz = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return {
    session,
    currentQuestion,
    selectedAnswer,
    isAnswered: selectedAnswer !== null,
    isCorrect,
    isLastQuestion,
    isLoading,
    error,
    submitAnswer,
    goToNext,
    quitQuiz,
  };
}
