import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ChoiceButton } from "../components/quiz/ChoiceButton";
import { ExplanationPanel } from "../components/quiz/ExplanationPanel";
import { QuestionCard } from "../components/quiz/QuestionCard";
import { QuizHeader } from "../components/quiz/QuizHeader";
import { Skeleton } from "../components/common/Skeleton";
import { CHOICE_KEYS } from "../types";
import { useQuiz } from "../hooks/useQuiz";
import type { ChoiceState } from "../components/quiz/ChoiceButton";
import type { ChoiceKey } from "../types";

export function QuizPage() {
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const {
    session,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isCorrect,
    isLastQuestion,
    isLoading,
    error,
    submitAnswer,
    goToNext,
    quitQuiz,
  } = useQuiz(sessionId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (error || !session || !currentQuestion) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          {error?.message ?? "問題を表示できませんでした"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="min-h-[48px] w-full rounded-xl bg-blue-600 px-4 font-semibold text-white active:bg-blue-700"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  function choiceState(key: ChoiceKey): ChoiceState {
    if (!isAnswered) return "default";
    if (key === selectedAnswer) {
      return key === currentQuestion!.correctAnswer ? "selected-correct" : "selected-wrong";
    }
    if (key === currentQuestion!.correctAnswer) return "correct";
    return "disabled";
  }

  return (
    <div className="page-enter">
      <QuizHeader
        currentNumber={session.currentIndex + 1}
        totalQuestions={session.totalQuestions}
        onQuit={() => setShowQuitConfirm(true)}
      />

      <QuestionCard question={currentQuestion} />

      <div className="space-y-2">
        {CHOICE_KEYS.map((key) => (
          <ChoiceButton
            key={key}
            choiceKey={key}
            text={currentQuestion.choices[key]}
            state={choiceState(key)}
            onSelect={(choice) => void submitAnswer(choice)}
          />
        ))}
      </div>

      {isAnswered ? (
        <>
          <ExplanationPanel
            explanation={currentQuestion.explanation}
            correctAnswer={currentQuestion.correctAnswer}
            isCorrect={isCorrect === true}
          />
          <button
            type="button"
            onClick={() => void goToNext()}
            className="mt-4 min-h-[56px] w-full rounded-xl bg-blue-600 px-4 text-base font-bold text-white active:bg-blue-700"
          >
            {isLastQuestion ? "結果を見る" : "次の問題 →"}
          </button>
        </>
      ) : null}

      {showQuitConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-gray-800"
          >
            <p className="mb-1 text-base font-bold text-gray-900 dark:text-gray-100">
              学習を終了しますか？
            </p>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              進捗は保存され、ホームの「続きから」で再開できます。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="min-h-[48px] flex-1 rounded-xl border border-gray-300 px-4 font-semibold text-gray-700 active:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:active:bg-gray-700"
              >
                続ける
              </button>
              <button
                type="button"
                onClick={quitQuiz}
                className="min-h-[48px] flex-1 rounded-xl bg-red-600 px-4 font-semibold text-white active:bg-red-700"
              >
                終了する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
