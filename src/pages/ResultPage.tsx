import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db'
import { loadQuestions } from '../lib/questions'
import { buildCategoryStats } from '../lib/stats'
import type { Question, Session } from '../types'

export function ResultPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [categoryRows, setCategoryRows] = useState<
    { category: string; total: number; correctRate: number }[]
  >([])

  useEffect(() => {
    if (!sessionId) return
    void (async () => {
      const [storedSession, answers, questions] = await Promise.all([
        db.sessions.get(sessionId),
        db.answerRecords.where('sessionId').equals(sessionId).toArray(),
        loadQuestions(),
      ])
      if (!storedSession) return
      setSession(storedSession)
      const wrongIds = new Set(answers.filter((answer) => !answer.isCorrect).map((answer) => answer.questionId))
      setWrongQuestions(questions.filter((question) => wrongIds.has(question.id)))
      setCategoryRows(buildCategoryStats(questions, answers))
    })()
  }, [sessionId])

  const reviewWrong = async () => {
    if (wrongQuestions.length === 0 || !session) return
    const reviewSession: Session = {
      id: crypto.randomUUID(),
      mode: 'mistakes',
      examFilter: session.examFilter,
      questionIds: wrongQuestions.map((question) => question.id),
      currentIndex: 0,
      totalQuestions: wrongQuestions.length,
      correctCount: 0,
      startedAt: new Date().toISOString(),
    }
    await db.sessions.put(reviewSession)
    navigate(`/quiz/${reviewSession.id}`)
  }

  if (!session) {
    return <section className="page">読み込み中...</section>
  }

  const rate = Math.round((session.correctCount / session.totalQuestions) * 100)

  return (
    <section className="page">
      <article className="card">
        <h2>
          {session.correctCount} / {session.totalQuestions} ({rate}%)
        </h2>
        <h3>間違えた問題</h3>
        <ul>
          {wrongQuestions.map((question) => (
            <li key={question.id}>{question.question}</li>
          ))}
        </ul>
        <h3>分野別正答率</h3>
        <ul>
          {categoryRows.map((item) => (
            <li key={item.category}>
              {item.category}: {item.correctRate}% ({item.total}問)
            </li>
          ))}
        </ul>
      </article>

      <button type="button" className="primary" onClick={() => void reviewWrong()}>
        間違えた問題を復習する
      </button>
      <button type="button" className="secondary" onClick={() => navigate('/')}>
        ホームに戻る
      </button>
    </section>
  )
}
