export type ExamType = 'AP' | 'SC'
export type ExamFilter = ExamType | 'BOTH'
export type QuizMode = 'all' | 'year' | 'category' | 'mistakes'

export interface Question {
  id: string
  exam: ExamType
  year: number
  season: 'S' | 'A'
  category: string
  question: string
  choices: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  explanation: string
}

export interface Session {
  id: string
  mode: QuizMode
  examFilter: ExamFilter
  yearFilter?: number
  seasonFilter?: 'S' | 'A'
  categoryFilter?: string
  questionIds: string[]
  currentIndex: number
  totalQuestions: number
  correctCount: number
  startedAt: string
  completedAt?: string
}

export interface AnswerRecord {
  id?: number
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
  answeredAt: string
  sessionId: string
}

export interface MistakeRecord {
  questionId: string
  mistakeCount: number
  lastMistakenAt: string
  archived: boolean
}
