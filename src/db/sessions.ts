import { db } from "./index";
import type { Session } from "../types";

/** セッションを作成 */
export async function createSession(session: Session): Promise<string> {
  return db.sessions.add(session);
}

/** セッションを取得 */
export async function getSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id);
}

/** セッションを更新（currentIndex, correctCount, completedAt 等） */
export async function updateSession(id: string, updates: Partial<Session>): Promise<void> {
  await db.sessions.update(id, updates);
}

/** セッションを削除 */
export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

/** 未完了セッション（completedAt が未設定）のうち最新のものを取得 */
export async function getIncompleteSession(): Promise<Session | undefined> {
  const sessions = await db.sessions.toArray();
  return sessions
    .filter((session) => !session.completedAt)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .at(0);
}

/** 完了済みセッションを新しい順に取得 */
export async function getCompletedSessions(limit?: number): Promise<Session[]> {
  const sessions = await db.sessions.toArray();
  const completed = sessions
    .filter((session): session is Session & { completedAt: Date } => !!session.completedAt)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  return typeof limit === "number" ? completed.slice(0, limit) : completed;
}
