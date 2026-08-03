import { beforeEach, describe, expect, it } from "vitest";

import { clearAllData } from "../index";
import {
  getActiveMistakes,
  getAllMistakes,
  getMistake,
  getMistakesByCount,
  isMistaken,
  toggleArchive,
  upsertMistake,
} from "../mistakes";

describe("mistakes", () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it("新規の間違いを mistakeCount=1 で追加できる", async () => {
    await upsertMistake("SC-2024S-Q01", new Date("2026-01-01T10:00:00Z"));

    const entry = await getMistake("SC-2024S-Q01");
    expect(entry).toBeDefined();
    expect(entry?.mistakeCount).toBe(1);
    expect(entry?.archived).toBe(false);
    expect(entry?.lastMistakenAt.getTime()).toBe(
      new Date("2026-01-01T10:00:00Z").getTime(),
    );
  });

  it("既存の間違いは mistakeCount が加算され lastMistakenAt が更新される", async () => {
    await upsertMistake("SC-2024S-Q01", new Date("2026-01-01T10:00:00Z"));
    await upsertMistake("SC-2024S-Q01", new Date("2026-01-05T10:00:00Z"));
    await upsertMistake("SC-2024S-Q01", new Date("2026-01-09T10:00:00Z"));

    const entry = await getMistake("SC-2024S-Q01");
    expect(entry?.mistakeCount).toBe(3);
    expect(entry?.lastMistakenAt.getTime()).toBe(
      new Date("2026-01-09T10:00:00Z").getTime(),
    );

    const all = await getAllMistakes();
    expect(all).toHaveLength(1);
  });

  it("アーカイブ状態を切り替えられる", async () => {
    await upsertMistake("SC-2024S-Q01");

    await toggleArchive("SC-2024S-Q01");
    expect((await getMistake("SC-2024S-Q01"))?.archived).toBe(true);

    await toggleArchive("SC-2024S-Q01");
    expect((await getMistake("SC-2024S-Q01"))?.archived).toBe(false);
  });

  it("存在しない問題の toggleArchive は何もしない", async () => {
    await toggleArchive("SC-9999S-Q99");

    await expect(getAllMistakes()).resolves.toHaveLength(0);
  });

  it("アーカイブ済みは getActiveMistakes に含まれない", async () => {
    await upsertMistake("SC-2024S-Q01", new Date("2026-01-01T10:00:00Z"));
    await upsertMistake("SC-2024S-Q02", new Date("2026-01-02T10:00:00Z"));
    await toggleArchive("SC-2024S-Q02");

    const active = await getActiveMistakes();
    expect(active.map((entry) => entry.questionId)).toEqual(["SC-2024S-Q01"]);

    const all = await getAllMistakes();
    expect(all).toHaveLength(2);
  });

  it("アーカイブ済みでも再度間違えるとアーカイブが解除される", async () => {
    await upsertMistake("SC-2024S-Q01", new Date("2026-01-01T10:00:00Z"));
    await toggleArchive("SC-2024S-Q01");
    expect((await getMistake("SC-2024S-Q01"))?.archived).toBe(true);

    await upsertMistake("SC-2024S-Q01", new Date("2026-01-10T10:00:00Z"));

    const entry = await getMistake("SC-2024S-Q01");
    expect(entry?.archived).toBe(false);
    expect(entry?.mistakeCount).toBe(2);

    const active = await getActiveMistakes();
    expect(active.map((item) => item.questionId)).toEqual(["SC-2024S-Q01"]);
  });

  it("getActiveMistakes は最終間違い日時の新しい順で返す", async () => {
    await upsertMistake("SC-2024S-Q01", new Date("2026-01-01T10:00:00Z"));
    await upsertMistake("SC-2024S-Q02", new Date("2026-01-05T10:00:00Z"));
    await upsertMistake("SC-2024S-Q03", new Date("2026-01-03T10:00:00Z"));

    const active = await getActiveMistakes();
    expect(active.map((entry) => entry.questionId)).toEqual([
      "SC-2024S-Q02",
      "SC-2024S-Q03",
      "SC-2024S-Q01",
    ]);
  });

  it("間違い回数でソートできる", async () => {
    await upsertMistake("SC-2024S-Q01");
    await upsertMistake("SC-2024S-Q02");
    await upsertMistake("SC-2024S-Q02");
    await upsertMistake("SC-2024S-Q03");
    await upsertMistake("SC-2024S-Q03");
    await upsertMistake("SC-2024S-Q03");

    const desc = await getMistakesByCount();
    expect(desc.map((entry) => entry.questionId)).toEqual([
      "SC-2024S-Q03",
      "SC-2024S-Q02",
      "SC-2024S-Q01",
    ]);

    const asc = await getMistakesByCount(true);
    expect(asc.map((entry) => entry.questionId)).toEqual([
      "SC-2024S-Q01",
      "SC-2024S-Q02",
      "SC-2024S-Q03",
    ]);
  });

  it("isMistaken で存在確認できる", async () => {
    await upsertMistake("SC-2024S-Q01");

    await expect(isMistaken("SC-2024S-Q01")).resolves.toBe(true);
    await expect(isMistaken("SC-2024S-Q99")).resolves.toBe(false);
  });
});
