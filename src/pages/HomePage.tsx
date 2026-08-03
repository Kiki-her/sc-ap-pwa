import { useNavigate } from "react-router-dom";

import { MenuButton } from "../components/common/MenuButton";
import { ProgressBar } from "../components/common/ProgressBar";
import { Skeleton } from "../components/common/Skeleton";
import { formatRate } from "../utils/format";
import { useHomeStats } from "../hooks/useHomeStats";

export function HomePage() {
  const navigate = useNavigate();
  const { stats, isLoading } = useHomeStats();

  return (
    <div className="page-enter">
      <header className="safe-top mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          SC過去問トレーニング
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          SC・AP午前問題をスマホで反復学習
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {isLoading || !stats ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-2.5 w-full" />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              解答済:{" "}
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.answeredQuestions}
              </span>{" "}
              / {stats.totalQuestions}問
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              正答率:{" "}
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatRate(stats.correctRate)}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                （総解答 {stats.totalAnswers}回）
              </span>
            </p>
            <ProgressBar
              className="mt-3"
              value={stats.answeredQuestions}
              total={stats.totalQuestions}
            />
          </>
        )}
      </section>

      <div className="space-y-3">
        {stats?.hasIncompleteSession && stats.incompleteSessionId ? (
          <MenuButton
            icon="▶"
            variant="primary"
            label="続きから"
            description={
              stats.incompleteProgress
                ? `${stats.incompleteProgress.currentIndex + 1} / ${stats.incompleteProgress.totalQuestions}問目`
                : undefined
            }
            onClick={() => navigate(`/quiz/${stats.incompleteSessionId}`)}
          />
        ) : null}

        <MenuButton
          icon="📝"
          label="学習を始める"
          description="モード・年度・分野を選んで出題"
          onClick={() => navigate("/settings")}
        />
        <MenuButton
          icon="❌"
          label="間違えた問題"
          description="苦手問題を集中復習"
          onClick={() => navigate("/mistakes")}
        />
        <MenuButton
          icon="📊"
          label="学習履歴"
          description="学習量と分野別正答率"
          onClick={() => navigate("/stats")}
        />
      </div>
    </div>
  );
}
