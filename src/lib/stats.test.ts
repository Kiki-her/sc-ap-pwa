import { describe, expect, it, vi } from 'vitest'
import { buildCategoryStats, buildDailyActivity, computeStreak } from './stats'

describe('stats utils', () => {
  it('computes streak including yesterday start', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-03T09:00:00Z'))

    const streak = computeStreak([
      {
        questionId: 'q1',
        selectedAnswer: 1,
        isCorrect: true,
        answeredAt: '2026-08-02T10:00:00Z',
        sessionId: 's1',
      },
      {
        questionId: 'q2',
        selectedAnswer: 2,
        isCorrect: true,
        answeredAt: '2026-08-01T10:00:00Z',
        sessionId: 's1',
      },
    ])

    expect(streak).toBe(2)
    vi.useRealTimers()
  })

  it('builds 30 days activity', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-03T00:00:00Z'))
    const daily = buildDailyActivity([
      {
        questionId: 'q1',
        selectedAnswer: 1,
        isCorrect: true,
        answeredAt: '2026-08-03T10:00:00Z',
        sessionId: 's1',
      },
      {
        questionId: 'q2',
        selectedAnswer: 2,
        isCorrect: false,
        answeredAt: '2026-08-03T12:00:00Z',
        sessionId: 's2',
      },
    ])

    expect(daily).toHaveLength(30)
    expect(daily.at(-1)?.count).toBe(2)
    vi.useRealTimers()
  })

  it('builds category accuracy', () => {
    const rows = buildCategoryStats(
      [
        {
          id: 'q1',
          exam: 'AP',
          year: 2024,
          season: 'A',
          category: 'セキュリティ',
          question: '',
          choices: ['a', 'b', 'c', 'd'],
          answer: 0,
          explanation: '',
        },
      ],
      [
        {
          questionId: 'q1',
          selectedAnswer: 0,
          isCorrect: true,
          answeredAt: '2026-08-03T10:00:00Z',
          sessionId: 's1',
        },
      ],
    )

    expect(rows).toEqual([{ category: 'セキュリティ', total: 1, correctRate: 100 }])
  })
})
