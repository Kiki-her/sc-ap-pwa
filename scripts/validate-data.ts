/**
 * public/data/*.json のバリデーション
 * 実行: npm run validate:data
 */
import fs from "node:fs";
import path from "node:path";
import {
  ALL_MAJOR_CATEGORIES,
  ALL_SUB_CATEGORIES,
  CATEGORY_MAP,
  CODE_TO_SEASON,
  QUESTIONS_PER_EXAM,
  TARGET_YEARS,
} from "../src/constants/categories.ts";
import type { DataIndex, Exam, MajorCategory, SubCategory } from "../src/types/index.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../public/data");
const ID_PATTERN = /^(AP|SC)-(\d{4})([SA])-Q(\d{2,3})$/;
const CHOICE_KEYS = ["ア", "イ", "ウ", "エ"];
/** 実データ投入前は各回の問題数チェックを警告扱いにする */
const STRICT_COUNT = process.argv.includes("--strict-count");

interface FileResult {
  filename: string;
  count: number;
  errors: string[];
  warnings: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateQuestion(raw: unknown, index: number, filename: string): string[] {
  const errors: string[] = [];
  const label = `${filename}[${index}]`;

  if (!isRecord(raw)) {
    return [`${label}: オブジェクトではありません`];
  }

  const id = raw.id;
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    errors.push(`${label}: id が命名規則に従っていません (${String(id)})`);
    return errors;
  }
  const matched = ID_PATTERN.exec(id);
  if (!matched) return errors;
  const [, idExam, idYear, idSeasonCode, idNumber] = matched;

  if (raw.exam !== "AP" && raw.exam !== "SC") {
    errors.push(`${id}: exam が不正です (${String(raw.exam)})`);
  } else if (raw.exam !== idExam) {
    errors.push(`${id}: exam と id が一致しません`);
  }

  if (typeof raw.year !== "number" || !TARGET_YEARS.includes(raw.year as (typeof TARGET_YEARS)[number])) {
    errors.push(`${id}: year が対象範囲外です (${String(raw.year)})`);
  } else if (String(raw.year) !== idYear) {
    errors.push(`${id}: year と id が一致しません`);
  }

  if (raw.season !== "春" && raw.season !== "秋") {
    errors.push(`${id}: season が不正です (${String(raw.season)})`);
  } else if (raw.season !== CODE_TO_SEASON[idSeasonCode as "S" | "A"]) {
    errors.push(`${id}: season と id が一致しません`);
  }

  if (typeof raw.questionNumber !== "number" || raw.questionNumber < 1) {
    errors.push(`${id}: questionNumber が不正です`);
  } else if (raw.questionNumber !== Number(idNumber)) {
    errors.push(`${id}: questionNumber と id が一致しません`);
  }

  const major = raw.majorCategory;
  const sub = raw.subCategory;
  if (typeof major !== "string" || !ALL_MAJOR_CATEGORIES.includes(major as MajorCategory)) {
    errors.push(`${id}: majorCategory が不正です (${String(major)})`);
  }
  if (typeof sub !== "string" || !ALL_SUB_CATEGORIES.includes(sub as SubCategory)) {
    errors.push(`${id}: subCategory が不正です (${String(sub)})`);
  }
  if (
    typeof major === "string" &&
    typeof sub === "string" &&
    ALL_MAJOR_CATEGORIES.includes(major as MajorCategory) &&
    ALL_SUB_CATEGORIES.includes(sub as SubCategory) &&
    !CATEGORY_MAP[major as MajorCategory].includes(sub as SubCategory)
  ) {
    errors.push(`${id}: majorCategory と subCategory の対応が不正です (${major} / ${sub})`);
  }

  if (typeof raw.questionText !== "string" || raw.questionText.trim() === "") {
    errors.push(`${id}: questionText が空です`);
  }

  if (!isRecord(raw.choices)) {
    errors.push(`${id}: choices がオブジェクトではありません`);
  } else {
    for (const key of CHOICE_KEYS) {
      const value = raw.choices[key];
      if (typeof value !== "string" || value.trim() === "") {
        errors.push(`${id}: choices["${key}"] が空です`);
      }
    }
    const extra = Object.keys(raw.choices).filter((key) => !CHOICE_KEYS.includes(key));
    if (extra.length > 0) {
      errors.push(`${id}: choices に不正なキーがあります (${extra.join(", ")})`);
    }
  }

  if (typeof raw.correctAnswer !== "string" || !CHOICE_KEYS.includes(raw.correctAnswer)) {
    errors.push(`${id}: correctAnswer が不正です (${String(raw.correctAnswer)})`);
  }

  if (typeof raw.explanation !== "string") {
    errors.push(`${id}: explanation が文字列ではありません`);
  }

  if (raw.imageUrl !== null && raw.imageUrl !== undefined && typeof raw.imageUrl !== "string") {
    errors.push(`${id}: imageUrl が不正です`);
  }
  if (typeof raw.imageUrl === "string") {
    const imagePath = path.resolve(DATA_DIR, "..", `.${raw.imageUrl}`);
    if (!fs.existsSync(imagePath)) {
      errors.push(`${id}: imageUrl のファイルが存在しません (${raw.imageUrl})`);
    }
  }

  return errors;
}

function main(): void {
  console.log("Validating data files...\n");

  const indexPath = path.join(DATA_DIR, "index.json");
  if (!fs.existsSync(indexPath)) {
    console.error("✗ public/data/index.json が存在しません");
    process.exit(1);
  }

  const dataIndex = JSON.parse(fs.readFileSync(indexPath, "utf8")) as DataIndex;
  if (!Array.isArray(dataIndex.files)) {
    console.error("✗ index.json の files が配列ではありません");
    process.exit(1);
  }

  const results: FileResult[] = [];
  const seenIds = new Map<string, string>();
  const globalErrors: string[] = [];

  for (const meta of dataIndex.files) {
    const filename = meta.filename;
    const filePath = path.join(DATA_DIR, filename);
    const result: FileResult = { filename, count: 0, errors: [], warnings: [] };

    if (!fs.existsSync(filePath)) {
      result.errors.push(`${filename}: ファイルが存在しません`);
      results.push(result);
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      result.errors.push(`${filename}: JSON パースに失敗しました (${String(error)})`);
      results.push(result);
      continue;
    }

    if (!Array.isArray(parsed)) {
      result.errors.push(`${filename}: 配列ではありません`);
      results.push(result);
      continue;
    }

    result.count = parsed.length;
    parsed.forEach((question, index) => {
      result.errors.push(...validateQuestion(question, index, filename));
      if (isRecord(question) && typeof question.id === "string") {
        const existing = seenIds.get(question.id);
        if (existing) {
          result.errors.push(`${question.id}: ID が重複しています (${existing} と ${filename})`);
        } else {
          seenIds.set(question.id, filename);
        }
      }
    });

    if (result.count !== meta.count) {
      result.errors.push(
        `${filename}: index.json の count(${meta.count}) と実際の件数(${result.count}) が一致しません`,
      );
    }

    const expected = QUESTIONS_PER_EXAM[meta.exam as Exam];
    if (result.count !== expected) {
      const message = `${filename}: 期待問題数 ${expected} 問に対して ${result.count} 問です`;
      if (STRICT_COUNT) {
        result.errors.push(message);
      } else {
        result.warnings.push(message);
      }
    }

    results.push(result);
  }

  const totalQuestions = results.reduce((sum, result) => sum + result.count, 0);
  if (dataIndex.totalQuestions !== totalQuestions) {
    globalErrors.push(
      `index.json の totalQuestions(${dataIndex.totalQuestions}) と実際の合計(${totalQuestions}) が一致しません`,
    );
  }

  for (const result of results) {
    const mark = result.errors.length === 0 ? "✓" : "✗";
    console.log(`${mark} ${result.filename}: ${result.count} questions, ${result.errors.length} errors`);
    for (const error of result.errors) console.log(`    ERROR: ${error}`);
    for (const warning of result.warnings) console.log(`    WARN : ${warning}`);
  }

  for (const error of globalErrors) console.log(`✗ ERROR: ${error}`);

  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0) + globalErrors.length;
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log(
    `\nSummary: ${results.length} files, ${totalQuestions} questions, ${errorCount} errors, ${warningCount} warnings`,
  );

  if (errorCount > 0) process.exit(1);
}

main();
