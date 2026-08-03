import { useEffect, useState } from "react";

import { getAllAnswerRecords } from "../db/answerRecords";
import { loadAllQuestions } from "../utils/dataLoader";
import { toDateKey } from "../utils/format";
import type { AnswerRecord, SubCategory } from "../types";

export interface DailyCount {
  /** "2025-01-15" */
  date: string;
  count: number;
  correct: number;
}

export interface CategoryStat {
  subCategory: SubCategory;
  total: number;
  correct: number;
  /** 0〜1 */
  rate: number;
}

export interface StudyStats {
  /** 直近30日分 */
  dailyCounts: DailyCount[];
  categoryStats: CategoryStat[];
  /** 正答率が低い上位5分野（解答実績があるものだけ） */
  weakCategories: CategoryStat[];
  totalAnswered: number;
  /** 0〜1。解答0件なら null */
  totalCorrectRate: number | null;
  /** 連続学習日数 */
  streakDays: number;
}

const DAILY_RANGE = 30;

/** 直近30日分の日別集計（記録がない日は0で埋める） */
export function buildDailyCounts(records: AnswerRecord[], days = DAILY_RANGE): DailyCount[] {
  const buckets = new Map<string, { count: number; correct: number }>();
  for (const record of records) {
    const key = toDateKey(record.answeredAt);
    const bucket = buckets.get(key) ?? { count: 0, correct: 0 };
    bucket.count += 1;
    if (record.isCorrect) bucket.correct += 1;
    buckets.set(key, bucket);
  }

  const today = new Date();
  const result: DailyCount[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = toDateKey(date);
    const bucket = buckets.get(key);
    result.push({ date: key, count: bucket?.count ?? 0, correct: bucket?.correct ?? 0 });
  }
  return result;
}

/**
 * 連続学習日数を計算する。
 * 今日まだ学習していなくても、昨日まで連続していればカウントを継続する。
 */
export function computeStreak(records: AnswerRecord[], now = new Date()): number {
  if (records.length === 0) return 0;

  const dayKeys = new Set(records.map((record) => toDateKey(record.answeredAt)));

  const cursor = new Date(now);
  if (!dayKeys.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(toDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (dayKeys.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

interface UseStatsResult {
  stats: StudyStats | null;
  isLoading: boolean;
}

export function useStats(): UseStatsResult {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const [records, questions] = await Promise.all([
          getAllAnswerRecords(),
          loadAllQuestions().catch(() => []),
        ]);
        if (cancelled) return;

        const questionMap = new Map(questions.map((question) => [question.id, question]));
        const categoryMap = new Map<SubCategory, { total: number; correct: number }>();

        for (const record of records) {
          const question = questionMap.get(record.questionId);
          if (!question) continue;
          const bucket = categoryMap.get(question.subCategory) ?? { total: 0, correct: 0 };
          bucket.total += 1;
          if (record.isCorrect) bucket.correct += 1;
          categoryMap.set(question.subCategory, bucket);
        }

        // 出題データに存在する分野は未学習でも一覧に載せる
        for (const question of questions) {
          if (!categoryMap.has(question.subCategory)) {
            categoryMap.set(question.subCategory, { total: 0, correct: 0 });
          }
        }

        const categoryStats: CategoryStat[] = [...categoryMap.entries()]
          .map(([subCategory, value]) => ({
            subCategory,
            total: value.total,
            correct: value.correct,
            rate: value.total > 0 ? value.correct / value.total : 0,
          }))
          .sort((a, b) => {
            if (a.total === 0 && b.total > 0) return 1;
            if (b.total === 0 && a.total > 0) return -1;
            return b.total - a.total || a.subCategory.localeCompare(b.subCategory, "ja");
          });

        const correctCount = records.filter((record) => record.isCorrect).length;

        setStats({
          dailyCounts: buildDailyCounts(records),
          categoryStats,
          weakCategories: categoryStats
            .filter((stat) => stat.total > 0)
            .sort((a, b) => a.rate - b.rate || b.total - a.total)
            .slice(0, 5),
          totalAnswered: records.length,
          totalCorrectRate: records.length > 0 ? correctCount / records.length : null,
          streakDays: computeStreak(records),
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, isLoading };
}
