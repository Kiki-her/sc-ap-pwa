import { useState } from "react";

import type { ChoiceKey } from "../../types";

interface ExplanationPanelProps {
  explanation: string;
  correctAnswer: ChoiceKey;
  isCorrect: boolean;
  /** 初期状態で開いておくか */
  defaultOpen?: boolean;
}

export function ExplanationPanel({
  explanation,
  correctAnswer,
  isCorrect,
  defaultOpen = true,
}: ExplanationPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      className={`mt-4 rounded-xl border p-4 ${
        isCorrect
          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p
          className={`text-sm font-bold ${
            isCorrect
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300"
          }`}
        >
          {isCorrect ? "正解！" : `不正解（正解は ${correctAnswer}）`}
        </p>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm text-gray-600 active:bg-black/5 dark:text-gray-300 dark:active:bg-white/10"
        >
          <span aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
          解説
        </button>
      </div>
      {isOpen ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
          {explanation}
        </p>
      ) : null}
    </section>
  );
}
