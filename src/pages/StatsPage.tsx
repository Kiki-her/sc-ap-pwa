import { useEffect, useMemo, useState } from 'react'
import { db } from '../db'
import { buildCategoryStats, buildDailyActivity, computeStreak } from '../lib/stats'
import { loadQuestions } from '../lib/questions'
import type { AnswerRecord, Question } from '../types'

export function StatsPage() {
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    void Promise.all([db.answerRecords.toArray(), loadQuestions()]).then(([records, questionData]) => {
      setAnswers(records)
      setQuestions(questionData)
    })
  }, [])

  const totalAnswers = answers.length
  const correctRate = totalAnswers === 0 ? 0 : Math.round((answers.filter((a) => a.isCorrect).length / totalAnswers) * 100)
  const streak = computeStreak(answers)

  const daily = useMemo(() => buildDailyActivity(answers), [answers])
  const categoryStats = useMemo(() => buildCategoryStats(questions, answers), [questions, answers])
  const weakTop5 = [...categoryStats]
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, 5)

  const maxDaily = Math.max(...daily.map((item) => item.count), 1)

  return (
    <section className="page">
      <article className="card">
        <p>総解答数: {totalAnswers}</p>
        <p>正答率: {correctRate}%</p>
        <p>連続学習日数: {streak}日</p>
      </article>

      <article className="card">
        <h3>直近30日の日別学習量</h3>
        <div className="bar-grid">
          {daily.map((item) => (
            <div key={item.day} className="bar-col" title={`${item.day}: ${item.count}問`}>
              <div style={{ height: `${(item.count / maxDaily) * 100}%` }} className="bar" />
            </div>
          ))}
        </div>
      </article>

      <article className="card">
        <h3>分野別正答率</h3>
        {categoryStats.map((item) => (
          <div key={item.category} className="row-stat">
            <span>{item.category}</span>
            <div className="progress-wrap">
              <div className="progress-fill" style={{ width: `${item.correctRate}%` }} />
            </div>
            <small>{item.correctRate}%</small>
          </div>
        ))}
      </article>

      <article className="card">
        <h3>苦手分野 TOP5</h3>
        <ol>
          {weakTop5.map((item) => (
            <li key={item.category}>
              {item.category} ({item.correctRate}%)
            </li>
          ))}
        </ol>
      </article>
    </section>
  )
}
