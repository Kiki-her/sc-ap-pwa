import type { Question } from "../types";

/** 「SC 2024春」のような出典ラベルを作る */
export function formatSource(question: Question): string {
  return `${question.exam} ${question.year}${question.season}`;
}

/** 「問12」のような問題番号ラベルを作る */
export function formatQuestionNumber(question: Question): string {
  return `問${question.questionNumber}`;
}

/** 日付を「2025/01/15」形式にする */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/** 日付を「2025-01-15」形式（ローカルタイム基準）にする */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 「2025-01-15」を「1/15」形式の短い表示にする */
export function toShortDateLabel(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}/${Number(day)}`;
}

/** 割合（0〜1）を「72.3%」形式にする。データなしは「--」 */
export function formatRate(rate: number | null, fractionDigits = 1): string {
  if (rate === null || Number.isNaN(rate)) return "--";
  return `${(rate * 100).toFixed(fractionDigits)}%`;
}

/** 割合（0〜1）を整数パーセントにする */
export function formatRatePercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
