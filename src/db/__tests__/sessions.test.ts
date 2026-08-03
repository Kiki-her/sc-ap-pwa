import { beforeEach, describe, expect, it } from "vitest";

import { clearAllData } from "../index";
import {
  createSession,
  deleteSession,
  getCompletedSessions,
  getIncompleteSession,
  getSession,
  updateSession,
} from "../sessions";
import type { Session } from "../../types";

function session(overrides: Partial<Session> = {}): Session {
  return {
    id: "session-1",
    mode: "all",
    questionIds: ["SC-2024S-Q01", "SC-2024S-Q02"],
    currentIndex: 0,
    totalQuestions: 2,
    correctCount: 0,
    startedAt: new Date("2026-01-01T09:00:00Z"),
    ...overrides,
  };
}

describe("sessions", () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it("セッションを作成して取得できる", async () => {
    const id = await createSession(session());

    expect(id).toBe("session-1");

    const found = await getSession("session-1");
    expect(found).toBeDefined();
    expect(found?.mode).toBe("all");
    expect(found?.questionIds).toEqual(["SC-2024S-Q01", "SC-2024S-Q02"]);
    expect(found?.startedAt).toBeInstanceOf(Date);
  });

  it("存在しないセッションは undefined を返す", async () => {
    await expect(getSession("missing")).resolves.toBeUndefined();
  });

  it("セッションを更新できる", async () => {
    await createSession(session());

    await updateSession("session-1", { currentIndex: 1, correctCount: 1 });

    const found = await getSession("session-1");
    expect(found?.currentIndex).toBe(1);
    expect(found?.correctCount).toBe(1);
  });

  it("completedAt を設定して完了状態にできる", async () => {
    await createSession(session());
    const completedAt = new Date("2026-01-01T09:30:00Z");

    await updateSession("session-1", { completedAt });

    const found = await getSession("session-1");
    expect(found?.completedAt?.getTime()).toBe(completedAt.getTime());
  });

  it("未完了セッションのうち最新のものを取得できる", async () => {
    await createSession(
      session({ id: "old", startedAt: new Date("2026-01-01T09:00:00Z") }),
    );
    await createSession(
      session({ id: "latest", startedAt: new Date("2026-01-03T09:00:00Z") }),
    );
    await createSession(
      session({
        id: "done",
        startedAt: new Date("2026-01-05T09:00:00Z"),
        completedAt: new Date("2026-01-05T10:00:00Z"),
      }),
    );

    const incomplete = await getIncompleteSession();
    expect(incomplete?.id).toBe("latest");
  });

  it("未完了セッションがない場合は undefined を返す", async () => {
    await createSession(
      session({ id: "done", completedAt: new Date("2026-01-05T10:00:00Z") }),
    );

    await expect(getIncompleteSession()).resolves.toBeUndefined();
  });

  it("完了済みセッションを新しい順に取得できる", async () => {
    await createSession(
      session({ id: "s1", completedAt: new Date("2026-01-01T10:00:00Z") }),
    );
    await createSession(
      session({ id: "s2", completedAt: new Date("2026-01-03T10:00:00Z") }),
    );
    await createSession(session({ id: "s3" }));

    const completed = await getCompletedSessions();
    expect(completed.map((item) => item.id)).toEqual(["s2", "s1"]);
  });

  it("完了済みセッションの取得件数を制限できる", async () => {
    await createSession(
      session({ id: "s1", completedAt: new Date("2026-01-01T10:00:00Z") }),
    );
    await createSession(
      session({ id: "s2", completedAt: new Date("2026-01-03T10:00:00Z") }),
    );

    const completed = await getCompletedSessions(1);
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe("s2");
  });

  it("セッションを削除できる", async () => {
    await createSession(session());

    await deleteSession("session-1");

    await expect(getSession("session-1")).resolves.toBeUndefined();
  });
});
