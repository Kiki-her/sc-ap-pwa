interface ProgressBarProps {
  value: number;
  total: number;
  /** パーセンテージのラベルを表示するか */
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, total, showLabel = true, className = "" }: ProgressBarProps) {
  const safeTotal = total > 0 ? total : 0;
  const ratio = safeTotal > 0 ? Math.min(Math.max(value / safeTotal, 0), 1) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className={className}>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={value}
        aria-label="進捗"
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-300 dark:bg-blue-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel ? (
        <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">{percent}%</p>
      ) : null}
    </div>
  );
}
