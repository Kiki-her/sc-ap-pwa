import { useNavigate } from "react-router-dom";

import { CategoryChart } from "../components/stats/CategoryChart";
import { DailyChart } from "../components/stats/DailyChart";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Skeleton } from "../components/common/Skeleton";
import { formatRate, formatRatePercent } from "../utils/format";
import { useStats } from "../hooks/useStats";

export function StatsPage() {
  const navigate = useNavigate();
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  const hasData = stats.totalAnswered > 0;

  return (
    <div className="page-enter">
      <PageHeader title="学習履歴" onBack={() => navigate("/")} />

      <section className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">総解答数</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalAnswered}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">正答率</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatRate(stats.totalCorrectRate)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">連続学習</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.streakDays}
            <span className="text-sm font-normal">日</span>
          </p>
        </div>
      </section>

      {!hasData ? (
        <EmptyState
          icon="📊"
          title="まだ学習データがありません"
          description="1セット解くと、ここに学習量と分野別の正答率が表示されます。"
          actionLabel="学習を始める"
          onAction={() => navigate("/settings")}
        />
      ) : (
        <>
          <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
              直近30日の学習量
            </h2>
            <div className="text-gray-500 dark:text-gray-400">
              <DailyChart data={stats.dailyCounts} />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              青: 解答数 / 緑: 正答数
            </p>
          </section>

          <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">分野別正答率</h2>
            <CategoryChart stats={stats.categoryStats} />
          </section>

          {stats.weakCategories.length > 0 ? (
            <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                苦手分野 TOP5
              </h2>
              <ol className="space-y-1">
                {stats.weakCategories.map((item, index) => (
                  <li
                    key={item.subCategory}
                    className="flex items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 truncate text-gray-800 dark:text-gray-200">
                      {index + 1}. {item.subCategory}
                    </span>
                    <span className="shrink-0 tabular-nums text-gray-600 dark:text-gray-300">
                      {formatRatePercent(item.rate)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
