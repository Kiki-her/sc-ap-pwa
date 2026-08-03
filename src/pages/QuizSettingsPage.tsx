import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChipSelect } from "../components/common/ChipSelect";
import { PageHeader } from "../components/common/PageHeader";
import { SegmentControl } from "../components/common/SegmentControl";
import { TabBar } from "../components/common/TabBar";
import { CATEGORY_MAP, TARGET_YEARS } from "../constants/categories";
import { countFilteredQuestions } from "../utils/questionFilter";
import { useCreateSession } from "../hooks/useCreateSession";
import { useQuestions } from "../hooks/useQuestions";
import type { Exam, MajorCategory, Season, SubCategory } from "../types";

type Mode = "all" | "year" | "category";

const COUNT_OPTIONS: (number | "all")[] = [10, 25, 50, "all"];

export function QuizSettingsPage() {
  const navigate = useNavigate();
  const { questions, isLoading } = useQuestions();
  const { createSession, isCreating } = useCreateSession();

  const [mode, setMode] = useState<Mode>("all");
  const [exam, setExam] = useState<Exam | undefined>(undefined);
  const [year, setYear] = useState<number>(TARGET_YEARS[TARGET_YEARS.length - 1]);
  const [season, setSeason] = useState<Season | undefined>(undefined);
  const [majorCategory, setMajorCategory] = useState<MajorCategory>("テクノロジ系");
  const [subCategory, setSubCategory] = useState<SubCategory>(CATEGORY_MAP["テクノロジ系"][0]);
  const [count, setCount] = useState<number | "all">(25);
  const [error, setError] = useState<string | null>(null);

  const matchCount = useMemo(
    () =>
      countFilteredQuestions(questions, {
        exam,
        year: mode === "year" ? year : undefined,
        season: mode === "year" ? season : undefined,
        subCategory: mode === "category" ? subCategory : undefined,
      }),
    [questions, exam, mode, year, season, subCategory],
  );

  async function handleStart() {
    setError(null);
    try {
      const sessionId = await createSession({ mode, exam, year, season, subCategory, count });
      navigate(`/quiz/${sessionId}`);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "セッションの作成に失敗しました");
    }
  }

  function handleMajorChange(value: MajorCategory) {
    setMajorCategory(value);
    setSubCategory(CATEGORY_MAP[value][0]);
  }

  return (
    <div className="page-enter">
      <PageHeader title="出題設定" onBack={() => navigate("/")} />

      <TabBar
        ariaLabel="出題モード"
        value={mode}
        onChange={setMode}
        tabs={[
          { value: "all", label: "全シャッフル" },
          { value: "year", label: "年度別" },
          { value: "category", label: "分野別" },
        ]}
      />

      <div className="mt-4 space-y-5">
        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">試験種別</h2>
          <SegmentControl
            ariaLabel="試験種別"
            value={exam ?? "BOTH"}
            onChange={(value) => setExam(value === "BOTH" ? undefined : (value as Exam))}
            options={[
              { value: "AP", label: "AP" },
              { value: "SC", label: "SC" },
              { value: "BOTH", label: "両方" },
            ]}
          />
        </section>

        {mode === "year" ? (
          <>
            <section>
              <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">年度</h2>
              <ChipSelect
                ariaLabel="年度"
                value={year}
                onChange={setYear}
                options={TARGET_YEARS.map((value) => ({ value, label: `${value}` }))}
              />
            </section>
            <section>
              <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">季節</h2>
              <SegmentControl
                ariaLabel="季節"
                value={season ?? "BOTH"}
                onChange={(value) => setSeason(value === "BOTH" ? undefined : (value as Season))}
                options={[
                  { value: "春", label: "春" },
                  { value: "秋", label: "秋" },
                  { value: "BOTH", label: "両方" },
                ]}
              />
            </section>
          </>
        ) : null}

        {mode === "category" ? (
          <>
            <section>
              <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">大分類</h2>
              <ChipSelect
                ariaLabel="大分類"
                value={majorCategory}
                onChange={handleMajorChange}
                options={(Object.keys(CATEGORY_MAP) as MajorCategory[]).map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </section>
            <section>
              <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">中分類</h2>
              <ChipSelect
                ariaLabel="中分類"
                value={subCategory}
                onChange={setSubCategory}
                options={CATEGORY_MAP[majorCategory].map((value) => ({ value, label: value }))}
              />
            </section>
          </>
        ) : null}

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">問題数</h2>
          <ChipSelect
            ariaLabel="問題数"
            value={count}
            onChange={setCount}
            options={COUNT_OPTIONS.map((value) => ({
              value,
              label: value === "all" ? "全問" : `${value}`,
            }))}
          />
        </section>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          該当:{" "}
          <span className="text-base font-bold text-gray-900 dark:text-gray-100">
            {isLoading ? "…" : matchCount}
          </span>
          問
        </p>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <button
          type="button"
          onClick={handleStart}
          disabled={isLoading || isCreating || matchCount === 0}
          className="min-h-[56px] w-full rounded-xl bg-blue-600 px-4 text-base font-bold text-white active:bg-blue-700 disabled:opacity-40"
        >
          {isCreating ? "作成中…" : "開始する"}
        </button>
      </div>
    </div>
  );
}
