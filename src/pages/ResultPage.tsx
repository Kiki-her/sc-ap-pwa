import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CategoryBar } from "../components/stats/CategoryBar";
import { PageHeader } from "../components/common/PageHeader";
import { QuestionDetailModal } from "../components/common/QuestionDetailModal";
import { Skeleton } from "../components/common/Skeleton";
import { formatRatePercent, formatSource } from "../utils/format";
import { useCreateSession } from "../hooks/useCreateSession";
import { useSessionResult } from "../hooks/useSessionResult";
import type { ResultItem } from "../hooks/useSessionResult";

export function ResultPage() {
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { result, isLoading, error } = useSessionResult(sessionId);
  const { createSessionFromIds, isCreating } = useCreateSession();
  const [detail, setDetail] = useState<ResultItem | null>(null);

  async function handleReview() {
    if (!result || result.mistakeQuestionIds.length === 0) return;
    const newSessionId = await createSessionFromIds(result.mistakeQuestionIds, "mistakes");
    navigate(`/quiz/${newSessionId}`, { replace: true });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          {error?.message ?? "結果を表示できませんでした"}
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

  const allCorrect = result.mistakeItems.length === 0 && result.totalQuestions > 0;

  return (
    <div className="page-enter">
      <PageHeader title="結果" />

      <section className="mb-5 rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {result.correctCount} / {result.totalQuestions}
          <span className="ml-1 text-base font-normal text-gray-500 dark:text-gray-400">
            問正解
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          正答率 {formatRatePercent(result.correctRate)}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {result.items.map((item) => (
            <span
              key={item.question.id}
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${
                item.isCorrect ? "bg-green-500" : "bg-red-500"
              }`}
            />
          ))}
        </div>
      </section>

      {result.categoryResults.length > 0 ? (
        <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">分野別正答率</h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {result.categoryResults.map((item) => (
              <CategoryBar
                key={item.subCategory}
                label={item.subCategory}
                total={item.total}
                correct={item.correct}
                rate={item.rate}
              />
            ))}
          </div>
        </section>
      ) : null}

      {allCorrect ? (
        <section className="mb-5 rounded-xl border border-green-300 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
          <p className="text-base font-bold text-green-700 dark:text-green-300">全問正解！</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            この調子で次のセットに進みましょう。
          </p>
        </section>
      ) : (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            間違えた問題（{result.mistakeItems.length}問）
          </h2>
          <ul className="space-y-2">
            {result.mistakeItems.map((item) => (
              <li key={item.question.id}>
                <button
                  type="button"
                  onClick={() => setDetail(item)}
                  className="flex w-full min-h-[56px] items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                      問{item.question.questionNumber}・{formatSource(item.question)}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.question.subCategory}
                    </span>
                  </span>
                  <span className="text-gray-400" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-3">
        {result.mistakeQuestionIds.length > 0 ? (
          <button
            type="button"
            onClick={() => void handleReview()}
            disabled={isCreating}
            className="min-h-[56px] w-full rounded-xl bg-blue-600 px-4 text-base font-bold text-white active:bg-blue-700 disabled:opacity-40"
          >
            間違えた問題を復習
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="min-h-[56px] w-full rounded-xl border border-gray-300 px-4 text-base font-semibold text-gray-700 active:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:active:bg-gray-800"
        >
          ホームに戻る
        </button>
      </div>

      {detail ? (
        <QuestionDetailModal
          question={detail.question}
          selectedAnswer={detail.selectedAnswer}
          onClose={() => setDetail(null)}
        />
      ) : null}
    </div>
  );
}
