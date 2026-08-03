import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** 戻るボタンを押したときの処理。未指定なら戻るボタンを表示しない */
  onBack?: () => void;
  backLabel?: string;
  /** タイトル右側に表示する要素 */
  action?: ReactNode;
}

export function PageHeader({ title, onBack, backLabel = "戻る", action }: PageHeaderProps) {
  return (
    <header className="safe-top mb-4 flex items-center gap-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-lg px-2 text-sm text-blue-700 active:bg-blue-50 dark:text-blue-300 dark:active:bg-gray-800"
          aria-label={backLabel}
        >
          <span aria-hidden="true">←</span>
          <span>{backLabel}</span>
        </button>
      ) : null}
      <h1 className="flex-1 truncate text-lg font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      {action}
    </header>
  );
}
