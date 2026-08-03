import type { AnswerRecord, Question } from '../types'

export function computeStreak(answerRecords: AnswerRecord[]): number {
  const days = [...new Set(answerRecords.map((record) => record.answeredAt.slice(0, 10)))].sort().reverse()
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (const day of days) {
    const date = new Date(`${day}T00:00:00`)
    if (date.getTime() === cursor.getTime()) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else if (streak === 0 && date.getTime() === cursor.getTime() - 86400000) {
      streak += 1
      cursor.setDate(cursor.getDate() - 2)
    } else {
      break
    }
  }

  return streak
}

export function buildDailyActivity(answerRecords: AnswerRecord[], days = 30): { day: string; count: number }[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const counts = new Map<string, number>()
  answerRecords.forEach((record) => {
    const day = record.answeredAt.slice(0, 10)
    counts.set(day, (counts.get(day) ?? 0) + 1)
  })

  return [...Array(days)].map((_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (days - index - 1))
    const day = date.toISOString().slice(0, 10)
    return { day, count: counts.get(day) ?? 0 }
  })
}

export function buildCategoryStats(questions: Question[], answers: AnswerRecord[]) {
  const byQuestion = new Map(questions.map((question) => [question.id, question]))
  const map = new Map<string, { total: number; correct: number }>()

  for (const answer of answers) {
    const question = byQuestion.get(answer.questionId)
    if (!question) continue

    const category = map.get(question.category) ?? { total: 0, correct: 0 }
    category.total += 1
    if (answer.isCorrect) category.correct += 1
    map.set(question.category, category)
  }

  return [...map.entries()].map(([category, value]) => ({
    category,
    total: value.total,
    correctRate: value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0,
  }))
}
