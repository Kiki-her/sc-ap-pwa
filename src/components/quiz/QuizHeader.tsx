import { ProgressBar } from "../common/ProgressBar";

interface QuizHeaderProps {
  currentNumber: number;
  totalQuestions: number;
  onQuit: () => void;
}

export function QuizHeader({ currentNumber, totalQuestions, onQuit }: QuizHeaderProps) {
  return (
    <header className="safe-top mb-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onQuit}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-lg px-2 text-sm text-blue-700 active:bg-blue-50 dark:text-blue-300 dark:active:bg-gray-800"
        >
          <span aria-hidden="true">←</span>
          終了
        </button>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {currentNumber} / {totalQuestions}
        </p>
      </div>
      <ProgressBar value={currentNumber - 1} total={totalQuestions} showLabel={false} />
    </header>
  );
}
