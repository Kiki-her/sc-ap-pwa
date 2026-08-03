import { describe, expect, it } from "vitest";

import { mockQuestions } from "./mockQuestions";
import {
  countFilteredQuestions,
  filterQuestions,
  pickQuestionsByIds,
} from "../questionFilter";

describe("filterQuestions", () => {
  it("条件が空なら全件返す", () => {
    expect(filterQuestions(mockQuestions, {})).toHaveLength(mockQuestions.length);
  });

  it("exam でフィルタできる", () => {
    const result = filterQuestions(mockQuestions, { exam: "SC" });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((question) => question.exam === "SC")).toBe(true);
  });

  it("year でフィルタできる", () => {
    const result = filterQuestions(mockQuestions, { year: 2023 });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((question) => question.year === 2023)).toBe(true);
  });

  it("season でフィルタできる", () => {
    const result = filterQuestions(mockQuestions, { season: "春" });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((question) => question.season === "春")).toBe(true);
  });

  it("subCategory でフィルタできる", () => {
    const result = filterQuestions(mockQuestions, { subCategory: "セキュリティ" });

    expect(result.map((question) => question.id)).toEqual([
      "AP-2024A-Q01",
      "SC-2024S-Q01",
      "SC-2024A-Q01",
    ]);
  });

  it("複数条件を AND で組み合わせられる", () => {
    const result = filterQuestions(mockQuestions, {
      exam: "SC",
      year: 2024,
      season: "春",
    });

    expect(result.map((question) => question.id)).toEqual(["SC-2024S-Q01", "SC-2024S-Q02"]);
  });

  it("exam と subCategory の組み合わせで絞り込める", () => {
    const result = filterQuestions(mockQuestions, {
      exam: "AP",
      subCategory: "セキュリティ",
    });

    expect(result.map((question) => question.id)).toEqual(["AP-2024A-Q01"]);
  });

  it("該当なしの場合は空配列を返す", () => {
    expect(filterQuestions(mockQuestions, { year: 1999 })).toEqual([]);
    expect(
      filterQuestions(mockQuestions, { exam: "SC", subCategory: "経営戦略マネジメント" }),
    ).toEqual([]);
  });

  it("questionIds 指定で絞り込める", () => {
    const result = filterQuestions(mockQuestions, {
      questionIds: ["SC-2024S-Q01", "AP-2023A-Q02", "NOT-EXIST-Q99"],
    });

    expect(result.map((question) => question.id).sort()).toEqual([
      "AP-2023A-Q02",
      "SC-2024S-Q01",
    ]);
  });

  it("questionIds と他条件を併用できる", () => {
    const result = filterQuestions(mockQuestions, {
      questionIds: ["SC-2024S-Q01", "AP-2024A-Q01"],
      exam: "AP",
    });

    expect(result.map((question) => question.id)).toEqual(["AP-2024A-Q01"]);
  });

  it("questionIds が空配列なら空結果になる", () => {
    expect(filterQuestions(mockQuestions, { questionIds: [] })).toEqual([]);
  });
});

describe("countFilteredQuestions", () => {
  it("フィルタ結果の件数を返す", () => {
    expect(countFilteredQuestions(mockQuestions, {})).toBe(mockQuestions.length);
    expect(countFilteredQuestions(mockQuestions, { exam: "AP" })).toBe(
      filterQuestions(mockQuestions, { exam: "AP" }).length,
    );
    expect(countFilteredQuestions(mockQuestions, { year: 1999 })).toBe(0);
  });
});

describe("pickQuestionsByIds", () => {
  it("指定したID順で問題を返す", () => {
    const ids = ["SC-2023A-Q03", "AP-2024A-Q01", "SC-2024S-Q02"];

    expect(pickQuestionsByIds(mockQuestions, ids).map((question) => question.id)).toEqual(ids);
  });

  it("存在しないIDは無視する", () => {
    const result = pickQuestionsByIds(mockQuestions, ["NOPE", "AP-2024A-Q01"]);

    expect(result.map((question) => question.id)).toEqual(["AP-2024A-Q01"]);
  });
});
