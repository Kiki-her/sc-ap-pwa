import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import { loadQuestions } from '../lib/questions'
import { ProgressBar } from '../components/ProgressBar'
import type { Session } from '../types'

export function HomePage() {
  const navigate = useNavigate()
  const [totals, setTotals] = useState({ totalAnswers: 0, correctAnswers: 0 })
  const [questionCount, setQuestionCount] = useState(0)
  const [resumeSession, setResumeSession] = useState<Session | null>(null)

  useEffect(() => {
    void (async () => {
      const [answers, sessions, questions] = await Promise.all([
        db.answerRecords.toArray(),
        db.sessions.toArray(),
        loadQuestions(),
      ])

      setTotals({
        totalAnswers: answers.length,
        correctAnswers: answers.filter((record) => record.isCorrect).length,
      })
      setQuestionCount(questions.length)
      setResumeSession(
        sessions
          .filter((session) => !session.completedAt)
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
          .at(0) ?? null,
      )
    })()
  }, [])

  const correctRate = useMemo(() => {
    if (totals.totalAnswers === 0) return 0
    return Math.round((totals.correctAnswers / totals.totalAnswers) * 100)
  }, [totals])

  return (
    <section className="page">
      <article className="card">
        <p>解答済み: {totals.totalAnswers} 問</p>
        <p>正答率: {correctRate}%</p>
        <ProgressBar value={totals.totalAnswers} total={questionCount || 1} />
      </article>

      {resumeSession && (
        <button type="button" className="primary" onClick={() => navigate(`/quiz/${resumeSession.id}`)}>
          続きから
        </button>
      )}

      <button type="button" className="primary" onClick={() => navigate('/settings')}>
        学習を始める
      </button>
      <button type="button" className="secondary" onClick={() => navigate('/mistakes')}>
        間違えた問題
      </button>
      <button type="button" className="secondary" onClick={() => navigate('/stats')}>
        学習履歴
      </button>
    </section>
  )
}
