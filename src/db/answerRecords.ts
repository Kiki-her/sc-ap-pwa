import { db } from "./index";
import type { AnswerRecord } from "../types";

/** 解答記録を追加 */
export async function addAnswerRecord(record: Omit<AnswerRecord, "id">): Promise<number> {
  return db.answerRecords.add(record as AnswerRecord);
}

/** 特定セッションの解答記録を取得（古い順） */
export async function getAnswersBySession(sessionId: string): Promise<AnswerRecord[]> {
  const records = await db.answerRecords.where("sessionId").equals(sessionId).toArray();
  return records.sort((a, b) => a.answeredAt.getTime() - b.answeredAt.getTime());
}

/** 特定問題の解答履歴を取得（新しい順） */
export async function getAnswersByQuestion(questionId: string): Promise<AnswerRecord[]> {
  const records = await db.answerRecords.where("questionId").equals(questionId).toArray();
  return records.sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime());
}

/** 全解答記録を取得 */
export async function getAllAnswerRecords(): Promise<AnswerRecord[]> {
  return db.answerRecords.toArray();
}

/** 指定期間の解答記録を取得（from 以上 to 以下） */
export async function getAnswersByDateRange(from: Date, to: Date): Promise<AnswerRecord[]> {
  return db.answerRecords.where("answeredAt").between(from, to, true, true).toArray();
}

/** 解答済み問題IDの一覧を取得（重複排除） */
export async function getAnsweredQuestionIds(): Promise<string[]> {
  const ids = await db.answerRecords.orderBy("questionId").uniqueKeys();
  return ids.map((key) => String(key));
}

/** 特定セッション・特定問題の解答記録を取得 */
export async function getAnswerBySessionAndQuestion(
  sessionId: string,
  questionId: string,
): Promise<AnswerRecord | undefined> {
  return db.answerRecords.where({ sessionId, questionId }).first();
}
