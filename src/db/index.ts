import Dexie, { type Table } from "dexie";
import type { AnswerRecord, MistakeEntry, Session } from "../types";

export class AppDB extends Dexie {
  answerRecords!: Table<AnswerRecord, number>;
  sessions!: Table<Session, string>;
  mistakes!: Table<MistakeEntry, string>;

  constructor() {
    super("sc-study-app");
    this.version(1).stores({
      answerRecords:
        "++id, questionId, sessionId, answeredAt, isCorrect, [sessionId+questionId]",
      sessions: "id, mode, startedAt, completedAt",
      mistakes: "questionId, mistakeCount, archived, lastMistakenAt",
    });
  }
}

export const db = new AppDB();

/** 全テーブルをクリア（テスト・データリセット用） */
export async function clearAllData(): Promise<void> {
  await Promise.all([db.answerRecords.clear(), db.sessions.clear(), db.mistakes.clear()]);
}
