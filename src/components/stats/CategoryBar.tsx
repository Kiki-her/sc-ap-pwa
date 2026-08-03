import { formatRatePercent } from "../../utils/format";

interface CategoryBarProps {
  label: string;
  total: number;
  correct: number;
  rate: number;
}

function rateColor(rate: number): string {
  if (rate >= 0.8) return "bg-green-500";
  if (rate >= 0.6) return "bg-yellow-500";
  return "bg-red-500";
}

export function CategoryBar({ label, total, correct, rate }: CategoryBarProps) {
  const hasData = total > 0;

  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 truncate text-gray-800 dark:text-gray-200">{label}</span>
        {hasData ? (
          <span className="shrink-0 tabular-nums text-gray-600 dark:text-gray-300">
            {correct}/{total}（{formatRatePercent(rate)}）
          </span>
        ) : (
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">未学習</span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {hasData ? (
          <div
            className={`h-full rounded-full ${rateColor(rate)}`}
            style={{ width: `${Math.round(rate * 100)}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}
