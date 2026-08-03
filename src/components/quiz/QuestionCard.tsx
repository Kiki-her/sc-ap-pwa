import { formatQuestionNumber, formatSource } from "../../utils/format";
import type { Question } from "../../types";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <article className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">
        {formatQuestionNumber(question)}
      </p>
      <div className="mb-3 flex flex-wrap gap-1">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
          {question.subCategory}
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {formatSource(question)}
        </span>
      </div>
      <p className="text-base leading-relaxed whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
        {question.questionText}
      </p>
      {question.imageUrl ? (
        <img
          src={question.imageUrl}
          alt="問題の図"
          loading="lazy"
          className="mt-3 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
        />
      ) : null}
    </article>
  );
}
