import { CategoryBar } from "./CategoryBar";
import type { CategoryStat } from "../../hooks/useStats";

interface CategoryChartProps {
  stats: CategoryStat[];
}

export function CategoryChart({ stats }: CategoryChartProps) {
  if (stats.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        まだ学習データがありません
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {stats.map((stat) => (
        <CategoryBar
          key={stat.subCategory}
          label={stat.subCategory}
          total={stat.total}
          correct={stat.correct}
          rate={stat.rate}
        />
      ))}
    </div>
  );
}
