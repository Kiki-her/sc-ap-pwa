import type { DataIndex, Question } from "../types";

let cachedQuestions: Question[] | null = null;
let inflight: Promise<Question[]> | null = null;

const DATA_ROOT = "/data";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`データの取得に失敗しました: ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

/**
 * public/data/index.json を読み、全JSONファイルをfetchして統合。
 * 2回目以降はキャッシュを返す。
 */
export async function loadAllQuestions(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions;
  if (inflight) return inflight;

  inflight = (async () => {
    const index = await fetchJson<DataIndex>(`${DATA_ROOT}/index.json`);
    const chunks = await Promise.all(
      index.files.map((file) => fetchJson<Question[]>(`${DATA_ROOT}/${file.filename}`)),
    );
    const questions = chunks.flat();
    questions.sort((a, b) => a.id.localeCompare(b.id, "en"));
    cachedQuestions = questions;
    return questions;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/**
 * データインデックス（収録年度一覧など）を取得
 */
export async function loadDataIndex(): Promise<DataIndex> {
  return fetchJson<DataIndex>(`${DATA_ROOT}/index.json`);
}

/**
 * キャッシュをクリア（テスト用）
 */
export function clearCache(): void {
  cachedQuestions = null;
  inflight = null;
}
