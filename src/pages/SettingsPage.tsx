import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import { filterQuestions, loadQuestions, shuffle } from '../lib/questions'
import type { ExamFilter, Question, QuizMode, Session } from '../types'

const QUESTION_SIZE_OPTIONS = [10, 25, 50, -1]

export function SettingsPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [mode, setMode] = useState<QuizMode>('all')
  const [examFilter, setExamFilter] = useState<ExamFilter>('BOTH')
  const [yearFilter, setYearFilter] = useState<number | undefined>()
  const [seasonFilter, setSeasonFilter] = useState<'S' | 'A' | undefined>()
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [questionSize, setQuestionSize] = useState<number>(10)

  useEffect(() => {
    void loadQuestions().then(setQuestions)
  }, [])

  const years = useMemo(
    () => [...new Set(questions.map((question) => question.year))].sort((a, b) => b - a),
    [questions],
  )
  const categories = useMemo(() => [...new Set(questions.map((question) => question.category))].sort(), [questions])

  const candidateQuestions = useMemo(
    () =>
      filterQuestions(questions, examFilter, mode, {
        yearFilter,
        seasonFilter,
        categoryFilter: categoryFilter || undefined,
      }),
    [questions, examFilter, mode, yearFilter, seasonFilter, categoryFilter],
  )

  const startSession = async () => {
    const shuffled = shuffle(candidateQuestions)
    const selected = questionSize > 0 ? shuffled.slice(0, questionSize) : shuffled
    if (selected.length === 0) return

    const session: Session = {
      id: crypto.randomUUID(),
      mode,
      examFilter,
      yearFilter,
      seasonFilter,
      categoryFilter: categoryFilter || undefined,
      questionIds: selected.map((question) => question.id),
      currentIndex: 0,
      totalQuestions: selected.length,
      correctCount: 0,
      startedAt: new Date().toISOString(),
      completedAt: undefined,
    }

    await db.sessions.put(session)
    navigate(`/quiz/${session.id}`)
  }

  return (
    <section className="page">
      <article className="card form">
        <label>
          出題モード
          <select value={mode} onChange={(event) => setMode(event.target.value as QuizMode)}>
            <option value="all">全シャッフル</option>
            <option value="year">年度別シャッフル</option>
            <option value="category">分野別シャッフル</option>
          </select>
        </label>

        <label>
          試験種別
          <select value={examFilter} onChange={(event) => setExamFilter(event.target.value as ExamFilter)}>
            <option value="BOTH">両方</option>
            <option value="AP">AP</option>
            <option value="SC">SC</option>
          </select>
        </label>

        {mode === 'year' && (
          <>
            <label>
              年度
              <select
                value={yearFilter ?? ''}
                onChange={(event) => setYearFilter(event.target.value ? Number(event.target.value) : undefined)}
              >
                <option value="">指定なし</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              季節
              <select
                value={seasonFilter ?? ''}
                onChange={(event) => setSeasonFilter((event.target.value as 'S' | 'A') || undefined)}
              >
                <option value="">指定なし</option>
                <option value="S">春</option>
                <option value="A">秋</option>
              </select>
            </label>
          </>
        )}

        {mode === 'category' && (
          <label>
            分野
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">指定なし</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          問題数
          <select value={questionSize} onChange={(event) => setQuestionSize(Number(event.target.value))}>
            {QUESTION_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size === -1 ? '全問' : `${size}問`}
              </option>
            ))}
          </select>
        </label>

        <p>該当問題数: {candidateQuestions.length} 問</p>

        <button type="button" className="primary" onClick={() => void startSession()}>
          開始する
        </button>
      </article>
    </section>
  )
}
