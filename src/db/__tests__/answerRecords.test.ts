import { beforeEach, describe, expect, it } from "vitest";
import { clearAllData, db } from "../index";
import {
  addAnswerRecord,
  getAllAnswerRecords,
  getAnswerBySessionAndQuestion,
  getAnsweredQuestionIds,
  getAnswersByDateRange,
  getAnswersByQuestion,
  getAnswersBySession,
} from "../answerRecords";
import type { AnswerRecord } from "../../types";

function record(overrides: Partial<AnswerRecord> = {}): Omit<AnswerRecord, "id"> {
  return {
    questionId: "AP-2024A-Q01",
    selectedAnswer: "ア",
    isCorrect: true,
    answeredAt: new Date("2025-01-15T10:00:00Z"),
    sessionId: "session-1",
    ...overrides,
  };
}

describe("db/answerRecords", () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it("解答記録を追加して取得できる", async () => {
    const id = await addAnswerRecord(record());
    expect(id).toBeGreaterThan(0);

    const all = await getAllAnswerRecords();
    expect(all).toHaveLength(1);
    expect(all[0].questionId).toBe("AP-2024A-Q01");
    expect(all[0].answeredAt).toBeInstanceOf(Date);
  });

  it("セッション別に解答記録を取得できる", async () => {
    await addAnswerRecord(record({ sessionId: "session-1", questionId: "AP-2024A-Q01" }));
    await addAnswerRecord(record({ sessionId: "session-1", questionId: "AP-2024A-Q02" }));
    await addAnswerRecord(record({ sessionId: "session-2", questionId: "AP-2024A-Q03" }));

    const session1 = await getAnswersBySession("session-1");
    expect(session1).toHaveLength(2);
    const session2 = await getAnswersBySession("session-2");
    expect(session2).toHaveLength(1);
  });

  it("問題別の解答履歴を新しい順に取得できる", async () => {
    await addAnswerRecord(record({ answeredAt: new Date("2025-01-10T10:00:00Z") }));
    await addAnswerRecord(record({ answeredAt: new Date("2025-01-20T10:00:00Z") }));

    const history = await getAnswersByQuestion("AP-2024A-Q01");
    expect(history).toHaveLength(2);
    expect(history[0].answeredAt.getTime()).toBeGreaterThan(history[1].answeredAt.getTime());
  });

  it("日付範囲でフィルタできる", async () => {
    await addAnswerRecord(record({ answeredAt: new Date("2025-01-01T00:00:00Z") }));
    await addAnswerRecord(record({ answeredAt: new Date("2025-01-15T00:00:00Z") }));
    await addAnswerRecord(record({ answeredAt: new Date("2025-02-01T00:00:00Z") }));

    const inRange = await getAnswersByDateRange(
      new Date("2025-01-10T00:00:00Z"),
      new Date("2025-01-20T00:00:00Z"),
    );
    expect(inRange).toHaveLength(1);
  });

  it("解答済み問題IDを重複排除して取得できる", async () => {
    await addAnswerRecord(record({ questionId: "AP-2024A-Q01" }));
    await addAnswerRecord(record({ questionId: "AP-2024A-Q01" }));
    await addAnswerRecord(record({ questionId: "SC-2024S-Q01" }));

    const ids = await getAnsweredQuestionIds();
    expect(ids.sort()).toEqual(["AP-2024A-Q01", "SC-2024S-Q01"]);
  });

  it("セッションと問題の組合せで解答記録を取得できる", async () => {
    await addAnswerRecord(record({ sessionId: "s1", questionId: "q1", selectedAnswer: "ウ" }));
    const found = await getAnswerBySessionAndQuestion("s1", "q1");
    expect(found?.selectedAnswer).toBe("ウ");

    const notFound = await getAnswerBySessionAndQuestion("s1", "q2");
    expect(notFound).toBeUndefined();
  });

  it("テーブルクリア後は0件になる", async () => {
    await addAnswerRecord(record());
    await clearAllData();
    expect(await db.answerRecords.count()).toBe(0);
  });
});
