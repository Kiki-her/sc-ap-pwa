import { useEffect } from "react";

import { formatSource } from "../../utils/format";
import { CHOICE_KEYS } from "../../types";
import type { ChoiceKey, Question } from "../../types";

interface QuestionDetailModalProps {
  question: Question;
  /** ユーザーが選んだ選択肢（不明な場合は null） */
  selectedAnswer?: ChoiceKey | null;
  onClose: () => void;
  /** 「理解した」ボタン。未指定なら非表示 */
  onArchive?: () => void;
  archiveLabel?: string;
}

export function QuestionDetailModal({
  question,
  selectedAnswer = null,
  onClose,
  onArchive,
  archiveLabel = "理解した",
}: QuestionDetailModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="問題の詳細"
        className="safe-bottom relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl dark:bg-gray-800 sm:rounded-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {question.id}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                {question.subCategory}
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {formatSource(question)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-500 active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-base leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100">
          {question.questionText}
        </p>

        {question.imageUrl ? (
          <img
            src={question.imageUrl}
            alt="問題の図"
            className="mb-3 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
          />
        ) : null}

        <ul className="mb-4 space-y-2">
          {CHOICE_KEYS.map((key) => {
            const isCorrect = key === question.correctAnswer;
            const isSelected = key === selectedAnswer;
            const tone = isCorrect
              ? "border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-900/30"
              : isSelected
                ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/30"
                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800";

            return (
              <li key={key} className={`rounded-lg border p-3 text-sm ${tone}`}>
                <div className="flex gap-2">
                  <span className="font-bold text-gray-700 dark:text-gray-200">{key}</span>
                  <span className="flex-1 text-gray-900 dark:text-gray-100">
                    {question.choices[key]}
                  </span>
                </div>
                <div className="mt-1 flex gap-2 text-xs">
                  {isCorrect ? (
                    <span className="font-semibold text-green-700 dark:text-green-300">正解</span>
                  ) : null}
                  {isSelected ? (
                    <span className="text-gray-600 dark:text-gray-300">あなたの解答</span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <section className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/60">
          <h3 className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">解説</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {question.explanation}
          </p>
        </section>

        {onArchive ? (
          <button
            type="button"
            onClick={onArchive}
            className="min-h-[48px] w-full rounded-xl bg-green-600 px-4 font-semibold text-white active:bg-green-700"
          >
            {archiveLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
