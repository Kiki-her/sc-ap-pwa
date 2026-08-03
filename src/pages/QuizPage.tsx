import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProgressBar } from '../components/ProgressBar'
import { db } from '../db'
import { loadQuestions } from '../lib/questions'
import type { AnswerRecord, Question, Session } from '../types'

export function QuizPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [questionMap, setQuestionMap] = useState<Map<string, Question>>(new Map())
  const [answerRecord, setAnswerRecord] = useState<AnswerRecord | null>(null)

  useEffect(() => {
    if (!sessionId) return

    void (async () => {
      const [storedSession, questions] = await Promise.all([
        db.sessions.get(sessionId),
        loadQuestions(),
      ])
      if (!storedSession) {
        navigate('/settings')
        return
      }

      setSession(storedSession)
      setQuestionMap(new Map(questions.map((question) => [question.id, question])))
    })()
  }, [sessionId, navigate])

  const currentQuestion = useMemo(() => {
    if (!session) return null
    return questionMap.get(session.questionIds[session.currentIndex]) ?? null
  }, [session, questionMap])

  useEffect(() => {
    if (!session || !currentQuestion) return
    void db.answerRecords
      .where({ sessionId: session.id, questionId: currentQuestion.id })
      .first()
      .then((record) => setAnswerRecord(record ?? null))
  }, [session, currentQuestion])

  const submitAnswer = async (selectedAnswer: number) => {
    if (!session || !currentQuestion || answerRecord) return

    const isCorrect = selectedAnswer === currentQuestion.answer
    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date().toISOString(),
      sessionId: session.id,
    }

    await db.answerRecords.add(record)

    if (!isCorrect) {
      const mistake = await db.mistakes.get(currentQuestion.id)
      await db.mistakes.put({
        questionId: currentQuestion.id,
        mistakeCount: (mistake?.mistakeCount ?? 0) + 1,
        lastMistakenAt: record.answeredAt,
        archived: false,
      })
    }

    const updatedSession: Session = {
      ...session,
      correctCount: isCorrect ? session.correctCount + 1 : session.correctCount,
    }
    await db.sessions.put(updatedSession)
    setSession(updatedSession)
    setAnswerRecord(record)
  }

  const goNext = async () => {
    if (!session) return
    if (session.currentIndex >= session.totalQuestions - 1) {
      const completed = { ...session, completedAt: new Date().toISOString() }
      await db.sessions.put(completed)
      navigate(`/result/${session.id}`)
      return
    }

    const updated = { ...session, currentIndex: session.currentIndex + 1 }
    await db.sessions.put(updated)
    setSession(updated)
    setAnswerRecord(null)
  }

  if (!session || !currentQuestion) {
    return <section className="page">読み込み中...</section>
  }

  return (
    <section className="page">
      <ProgressBar value={session.currentIndex + 1} total={session.totalQuestions} />
      <article className="card">
        <p>
          問題 {session.currentIndex + 1} / {session.totalQuestions}
        </p>
        <p className="question">{currentQuestion.question}</p>
        <div className="choices">
          {currentQuestion.choices.map((choice, index) => {
            const isAnswered = !!answerRecord
            const isSelected = answerRecord?.selectedAnswer === index
            const isCorrectChoice = currentQuestion.answer === index
            const className = !isAnswered
              ? ''
              : isCorrectChoice
                ? 'correct'
                : isSelected
                  ? 'wrong'
                  : ''

            return (
              <button
                type="button"
                key={choice}
                className={className}
                onClick={() => void submitAnswer(index)}
                disabled={isAnswered}
              >
                {choice}
              </button>
            )
          })}
        </div>

        {answerRecord && (
          <>
            <p className={answerRecord.isCorrect ? 'feedback-correct' : 'feedback-wrong'}>
              {answerRecord.isCorrect ? '正解です' : '不正解です'}
            </p>
            <p>{currentQuestion.explanation}</p>
            <button type="button" className="primary" onClick={() => void goNext()}>
              次の問題
            </button>
          </>
        )}
      </article>
    </section>
  )
}
