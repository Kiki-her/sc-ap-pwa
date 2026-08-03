import type { ChoiceKey } from "../../types";

export type ChoiceState =
  | "default"
  | "selected-correct"
  | "selected-wrong"
  | "correct"
  | "disabled";

interface ChoiceButtonProps {
  choiceKey: ChoiceKey;
  text: string;
  state: ChoiceState;
  onSelect: (choice: ChoiceKey) => void;
}

const STATE_STYLES: Record<ChoiceState, string> = {
  default:
    "border-gray-300 bg-white text-gray-900 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700",
  "selected-correct":
    "border-green-500 bg-green-100 text-gray-900 dark:border-green-500 dark:bg-green-900/30 dark:text-gray-100",
  "selected-wrong":
    "border-red-500 bg-red-100 text-gray-900 dark:border-red-500 dark:bg-red-900/30 dark:text-gray-100",
  correct:
    "border-green-500 bg-green-50 text-gray-900 dark:border-green-600 dark:bg-green-900/20 dark:text-gray-100",
  disabled:
    "border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const BADGE: Partial<Record<ChoiceState, { label: string; className: string }>> = {
  "selected-correct": {
    label: "正解",
    className: "bg-green-600 text-white",
  },
  "selected-wrong": {
    label: "不正解",
    className: "bg-red-600 text-white",
  },
  correct: {
    label: "正解",
    className: "bg-green-600 text-white",
  },
};

export function ChoiceButton({ choiceKey, text, state, onSelect }: ChoiceButtonProps) {
  const isInteractive = state === "default";
  const badge = BADGE[state];

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={() => onSelect(choiceKey)}
      aria-label={`選択肢${choiceKey}`}
      className={`flex w-full min-h-[56px] items-start gap-3 rounded-xl border p-4 text-left transition-colors ${STATE_STYLES[state]}`}
    >
      <span className="mt-0.5 shrink-0 text-base font-bold">{choiceKey}</span>
      <span className="min-w-0 flex-1 text-base leading-relaxed break-words">{text}</span>
      {badge ? (
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${badge.className}`}>
          {badge.label}
        </span>
      ) : null}
    </button>
  );
}
