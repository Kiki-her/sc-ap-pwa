import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import { loadQuestions } from '../lib/questions'
import type { ExamFilter, MistakeRecord, Question, Session } from '../types'

type SortType = 'count' | 'date'

export function MistakesPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([])
  const [examFilter, setExamFilter] = useState<ExamFilter>('BOTH')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortType, setSortType] = useState<SortType>('count')
  const [showArchived, setShowArchived] = useState(false)

  const refresh = async () => {
    const [questionData, mistakeData] = await Promise.all([loadQuestions(), db.mistakes.toArray()])
    setQuestions(questionData)
    setMistakes(mistakeData)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const categories = useMemo(
    () => [...new Set(questions.map((question) => question.category))].sort(),
    [questions],
  )

  const enriched = useMemo(() => {
    const byQuestionId = new Map(questions.map((question) => [question.id, question]))
    return mistakes
      .map((mistake) => ({
        mistake,
        question: byQuestionId.get(mistake.questionId),
      }))
      .filter((item): item is { mistake: MistakeRecord; question: Question } => !!item.question)
      .filter((item) => (showArchived ? true : !item.mistake.archived))
      .filter((item) => (examFilter === 'BOTH' ? true : item.question.exam === examFilter))
      .filter((item) => (categoryFilter ? item.question.category === categoryFilter : true))
      .sort((a, b) =>
        sortType === 'count'
          ? b.mistake.mistakeCount - a.mistake.mistakeCount
          : b.mistake.lastMistakenAt.localeCompare(a.mistake.lastMistakenAt),
      )
  }, [mistakes, questions, showArchived, examFilter, categoryFilter, sortType])

  const archive = async (questionId: string) => {
    const record = await db.mistakes.get(questionId)
    if (!record) return
    await db.mistakes.put({ ...record, archived: true })
    await refresh()
  }

  const review = async () => {
    if (enriched.length === 0) return
    const session: Session = {
      id: crypto.randomUUID(),
      mode: 'mistakes',
      examFilter,
      categoryFilter: categoryFilter || undefined,
      questionIds: enriched.map((item) => item.question.id),
      currentIndex: 0,
      totalQuestions: enriched.length,
      correctCount: 0,
      startedAt: new Date().toISOString(),
    }
    await db.sessions.put(session)
    navigate(`/quiz/${session.id}`)
  }

  return (
    <section className="page">
      <article className="card form">
        <label>
          試験種別
          <select value={examFilter} onChange={(event) => setExamFilter(event.target.value as ExamFilter)}>
            <option value="BOTH">両方</option>
            <option value="AP">AP</option>
            <option value="SC">SC</option>
          </select>
        </label>
        <label>
          分野
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">すべて</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          並び替え
          <select value={sortType} onChange={(event) => setSortType(event.target.value as SortType)}>
            <option value="count">回数順</option>
            <option value="date">日時順</option>
          </select>
        </label>
        <label className="inline">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
          />
          アーカイブ表示
        </label>
      </article>

      <article className="card">
        <ul>
          {enriched.map((item) => (
            <li key={item.question.id} className="mistake-item">
              <button type="button" className="link-button" onClick={() => window.alert(item.question.explanation)}>
                {item.question.question}
              </button>
              <div>
                <small>回数: {item.mistake.mistakeCount}</small>
                <button type="button" className="secondary" onClick={() => void archive(item.question.id)}>
                  理解した
                </button>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <button type="button" className="primary" onClick={() => void review()}>
        復習する
      </button>
    </section>
  )
}
