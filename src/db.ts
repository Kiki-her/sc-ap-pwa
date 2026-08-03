import Dexie, { type Table } from 'dexie'
import type { AnswerRecord, MistakeRecord, Session } from './types'

class AppDB extends Dexie {
  answerRecords!: Table<AnswerRecord, number>
  sessions!: Table<Session, string>
  mistakes!: Table<MistakeRecord, string>

  constructor() {
    super('sc-ap-pwa-db')
    this.version(1).stores({
      answerRecords: '++id,questionId,answeredAt,sessionId',
      sessions: 'id,startedAt,completedAt',
      mistakes: 'questionId,mistakeCount,lastMistakenAt,archived',
    })
  }
}

export const db = new AppDB()
