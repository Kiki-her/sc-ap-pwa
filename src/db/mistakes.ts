import { db } from "./index";
import type { MistakeEntry } from "../types";

/**
 * 間違い記録を追加または更新
 * 既存なら mistakeCount +1・lastMistakenAt 更新・archived を false に戻す
 * 新規なら mistakeCount=1 で追加
 */
export async function upsertMistake(questionId: string, at: Date = new Date()): Promise<void> {
  const existing = await db.mistakes.get(questionId);
  await db.mistakes.put({
    questionId,
    mistakeCount: (existing?.mistakeCount ?? 0) + 1,
    lastMistakenAt: at,
    archived: false,
  });
}

/** アーカイブ済みでない間違い問題を取得（最終間違い日時の新しい順） */
export async function getActiveMistakes(): Promise<MistakeEntry[]> {
  const entries = await db.mistakes.toArray();
  return entries
    .filter((entry) => !entry.archived)
    .sort((a, b) => b.lastMistakenAt.getTime() - a.lastMistakenAt.getTime());
}

/** 全間違い問題を取得（アーカイブ済み含む） */
export async function getAllMistakes(): Promise<MistakeEntry[]> {
  const entries = await db.mistakes.toArray();
  return entries.sort((a, b) => b.lastMistakenAt.getTime() - a.lastMistakenAt.getTime());
}

/** 特定問題の間違い記録を取得 */
export async function getMistake(questionId: string): Promise<MistakeEntry | undefined> {
  return db.mistakes.get(questionId);
}

/** アーカイブ状態を切り替え */
export async function toggleArchive(questionId: string): Promise<void> {
  const entry = await db.mistakes.get(questionId);
  if (!entry) return;
  await db.mistakes.put({ ...entry, archived: !entry.archived });
}

/** 特定問題が間違い記録に存在するか */
export async function isMistaken(questionId: string): Promise<boolean> {
  const entry = await db.mistakes.get(questionId);
  return !!entry;
}

/** 間違い回数でソートして取得（既定は降順） */
export async function getMistakesByCount(ascending = false): Promise<MistakeEntry[]> {
  const entries = await db.mistakes.toArray();
  return entries.sort((a, b) =>
    ascending ? a.mistakeCount - b.mistakeCount : b.mistakeCount - a.mistakeCount,
  );
}
