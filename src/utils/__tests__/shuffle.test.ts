import { describe, expect, it } from "vitest";

import { shuffle } from "../shuffle";

describe("shuffle", () => {
  it("要素数が変わらない", () => {
    const source = [1, 2, 3, 4, 5];
    expect(shuffle(source)).toHaveLength(source.length);
  });

  it("元の配列を変更しない", () => {
    const source = [1, 2, 3, 4, 5];
    const snapshot = [...source];

    shuffle(source);

    expect(source).toEqual(snapshot);
  });

  it("全要素が保持される", () => {
    const source = ["a", "b", "c", "d", "e", "f"];
    const result = shuffle(source);

    expect([...result].sort()).toEqual([...source].sort());
  });

  it("空配列・1要素配列でも安全に動作する", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });

  it("繰り返し実行すると順序が変化する", () => {
    const source = Array.from({ length: 20 }, (_, index) => index);
    const seen = new Set<string>();

    for (let i = 0; i < 30; i++) {
      seen.add(shuffle(source).join(","));
    }

    expect(seen.size).toBeGreaterThan(1);
  });

  it("元の順序と同一になる確率が極めて低いことを確認する", () => {
    const source = Array.from({ length: 20 }, (_, index) => index);
    const identical = Array.from({ length: 20 }, () => shuffle(source)).filter(
      (result) => result.join(",") === source.join(","),
    );

    expect(identical.length).toBe(0);
  });
});
