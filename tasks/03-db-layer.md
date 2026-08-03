# Task 03: IndexedDB (Dexie) のDB定義とCRUD関数

## 背景

ユーザーの解答履歴・セッション・間違い問題をブラウザ内のIndexedDBに永続化する。
Dexie.js を使用してDBスキーマとCRUD関数を実装する。

## ゴール

DB定義と各テーブルのCRUD関数が実装され、単体テストが全てパスする。

## 技術的な指示

### 1. DB定義 `src/db/index.ts`

```typescript
import Dexie, { type Table } from "dexie";
import type { AnswerRecord, Session, MistakeEntry } from "../types";

export class AppDB extends Dexie {
  answerRecords!: Table<AnswerRecord, number>;
  sessions!: Table<Session, string>;
  mistakes!: Table<MistakeEntry, string>;

  constructor() {
    super("sc-study-app");
    this.version(1).stores({
      answerRecords: "++id, questionId, sessionId, answeredAt, isCorrect",
      sessions: "id, mode, startedAt, completedAt",
      mistakes: "questionId, mistakeCount, archived, lastMistakenAt",
    });
  }
}

export const db = new AppDB();
```

### 2. 解答記録 `src/db/answerRecords.ts`

```typescript
// 実装すべき関数:

/** 解答記録を追加 */
export async function addAnswerRecord(record: Omit<AnswerRecord, "id">): Promise<number>;

/** 特定セッションの解答記録を取得 */
export async function getAnswersBySession(sessionId: string): Promise<AnswerRecord[]>;

/** 特定問題の解答履歴を取得（新しい順） */
export async function getAnswersByQuestion(questionId: string): Promise<AnswerRecord[]>;

/** 全解答記録を取得 */
export async function getAllAnswerRecords(): Promise<AnswerRecord[]>;

/** 指定期間の解答記録を取得 */
export async function getAnswersByDateRange(from: Date, to: Date): Promise<AnswerRecord[]>;

/** 解答済み問題IDの一覧を取得（重複排除） */
export async function getAnsweredQuestionIds(): Promise<string[]>;
```

### 3. セッション `src/db/sessions.ts`

```typescript
// 実装すべき関数:

/** セッションを作成 */
export async function createSession(session: Session): Promise<string>;

/** セッションを取得 */
export async function getSession(id: string): Promise<Session | undefined>;

/** セッションを更新（currentIndex, correctCount, completedAt） */
export async function updateSession(id: string, updates: Partial<Session>): Promise<void>;

/** 未完了セッション（completedAt が undefined）を取得 */
export async function getIncompleteSession(): Promise<Session | undefined>;

/** 完了済みセッションを新しい順に取得 */
export async function getCompletedSessions(limit?: number): Promise<Session[]>;
```

### 4. 間違い問題 `src/db/mistakes.ts`

```typescript
// 実装すべき関数:

/** 間違い記録を追加または更新 */
export async function upsertMistake(questionId: string): Promise<void>;
// 既存なら mistakeCount +1, lastMistakenAt 更新, archived を false に戻す
// 新規なら mistakeCount=1 で追加

/** アーカイブ済みでない間違い問題を取得 */
export async function getActiveMistakes(): Promise<MistakeEntry[]>;

/** 全間違い問題を取得（アーカイブ済み含む） */
export async function getAllMistakes(): Promise<MistakeEntry[]>;

/** アーカイブ状態を切り替え */
export async function toggleArchive(questionId: string): Promise<void>;

/** 特定問題が間違い記録に存在するか */
export async function isMistaken(questionId: string): Promise<boolean>;

/** 間違い回数でソートして取得 */
export async function getMistakesByCount(ascending?: boolean): Promise<MistakeEntry[]>;
```

### 5. テスト

`src/db/__tests__/answerRecords.test.ts`, `sessions.test.ts`, `mistakes.test.ts` を作成。

fake-indexeddb を使用してテストする（test-setup.ts で `import "fake-indexeddb/auto"` 済み）。

各テストファイルの `beforeEach` でDBをクリアする:

```typescript
import { db } from "../index";

beforeEach(async () => {
  await db.answerRecords.clear();
  await db.sessions.clear();
  await db.mistakes.clear();
});
```

テストケース例:
- answerRecords: 追加→取得、セッション別取得、日付範囲フィルタ
- sessions: 作成→取得、更新、未完了セッション取得、完了済みセッション取得
- mistakes: 新規追加、既存更新（count+1）、アーカイブ切替、再間違い時のアーカイブ解除

## 参照すべきファイル

- `src/types/index.ts` — 型定義
- `src/test-setup.ts` — fake-indexeddb の設定

## 完了条件

- [ ] `src/db/index.ts` にDBスキーマが定義されている
- [ ] `src/db/answerRecords.ts` の全関数が実装されている
- [ ] `src/db/sessions.ts` の全関数が実装されている
- [ ] `src/db/mistakes.ts` の全関数が実装されている
- [ ] 全テストがパスする

## テスト方法

```bash
npm run test -- --run src/db/
```
