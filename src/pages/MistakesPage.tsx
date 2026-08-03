import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ALL_SUB_CATEGORIES } from "../constants/categories";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { QuestionDetailModal } from "../components/common/QuestionDetailModal";
import { SegmentControl } from "../components/common/SegmentControl";
import { Skeleton } from "../components/common/Skeleton";
import { formatDate, formatSource } from "../utils/format";
import { useMistakes } from "../hooks/useMistakes";
import type { Exam, SubCategory } from "../types";
import type { MistakeWithQuestion } from "../hooks/useMistakes";

export function MistakesPage() {
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | undefined>(undefined);
  const [subCategory, setSubCategory] = useState<SubCategory | "">("");
  const [sortBy, setSortBy] = useState<"count" | "date">("count");
  const [showArchived, setShowArchived] = useState(false);
  const [detail, setDetail] = useState<MistakeWithQuestion | null>(null);

  const filter = useMemo(
    () => ({
      exam,
      subCategory: subCategory === "" ? undefined : subCategory,
      sortBy,
      showArchived,
    }),
    [exam, subCategory, sortBy, showArchived],
  );

  const { mistakes, isLoading, toggleArchive, createReviewSession } = useMistakes(filter);

  async function handleReview() {
    if (mistakes.length === 0) return;
    const sessionId = await createReviewSession();
    navigate(`/quiz/${sessionId}`);
  }

  async function handleArchive(questionId: string) {
    await toggleArchive(questionId);
    setDetail(null);
  }

  return (
    <div className="page-enter">
      <PageHeader title="間違えた問題" onBack={() => navigate("/")} />

      <div className="mb-4 space-y-3">
        <SegmentControl
          ariaLabel="試験種別"
          value={exam ?? "ALL"}
          onChange={(value) => setExam(value === "ALL" ? undefined : (value as Exam))}
          options={[
            { value: "AP", label: "AP" },
            { value: "SC", label: "SC" },
            { value: "ALL", label: "全て" },
          ]}
        />

        <label className="block">
          <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">分野</span>
          <select
            value={subCategory}
            onChange={(event) => setSubCategory(event.target.value as SubCategory | "")}
            className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">全て</option>
            {ALL_SUB_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <SegmentControl
          ariaLabel="並び順"
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "count", label: "回数順" },
            { value: "date", label: "日時順" },
          ]}
        />

        <label className="flex min-h-[44px] items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
            className="h-5 w-5"
          />
          アーカイブ済みも表示
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : mistakes.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="まだ間違えた問題はありません"
          description="学習を始めて弱点を見つけましょう！"
          actionLabel="学習を始める"
          onAction={() => navigate("/settings")}
        />
      ) : (
        <>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{mistakes.length}問</p>
          <ul className="mb-5 space-y-2">
            {mistakes.map((item) => (
              <li key={item.question.id}>
                <button
                  type="button"
                  onClick={() => setDetail(item)}
                  className="flex w-full min-h-[56px] items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.question.id}
                      {item.mistake.archived ? (
                        <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          アーカイブ済
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.question.subCategory}・{formatSource(item.question)}・
                      {item.mistake.mistakeCount}回
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">
                      最終: {formatDate(item.mistake.lastMistakenAt)}
                    </span>
                  </span>
                  <span className="text-gray-400" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => void handleReview()}
            className="min-h-[56px] w-full rounded-xl bg-blue-600 px-4 text-base font-bold text-white active:bg-blue-700"
          >
            この問題を復習する
          </button>
        </>
      )}

      {detail ? (
        <QuestionDetailModal
          question={detail.question}
          onClose={() => setDetail(null)}
          onArchive={() => void handleArchive(detail.question.id)}
          archiveLabel={detail.mistake.archived ? "復習対象に戻す" : "理解した"}
        />
      ) : null}
    </div>
  );
}
