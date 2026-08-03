import type { ExamFilter, Question } from '../types'

interface IndexFile {
  files: string[]
}

let cachedQuestions: Question[] | null = null

export async function loadQuestions(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions

  const index = await fetch('/data/index.json').then((res) => res.json() as Promise<IndexFile>)
  const allQuestions = await Promise.all(
    index.files.map(async (file) => {
      const questions = await fetch(`/data/${file}`).then((res) => res.json() as Promise<Question[]>)
      return questions
    }),
  )

  cachedQuestions = allQuestions.flat()
  return cachedQuestions
}

export function filterQuestions(
  questions: Question[],
  examFilter: ExamFilter,
  mode: 'all' | 'year' | 'category' | 'mistakes',
  options: {
    yearFilter?: number
    seasonFilter?: 'S' | 'A'
    categoryFilter?: string
    questionIds?: string[]
  },
): Question[] {
  const scopedByExam =
    examFilter === 'BOTH' ? questions : questions.filter((question) => question.exam === examFilter)

  switch (mode) {
    case 'year':
      return scopedByExam.filter(
        (question) =>
          (!options.yearFilter || question.year === options.yearFilter) &&
          (!options.seasonFilter || question.season === options.seasonFilter),
      )
    case 'category':
      return scopedByExam.filter(
        (question) => !options.categoryFilter || question.category === options.categoryFilter,
      )
    case 'mistakes': {
      const idSet = new Set(options.questionIds ?? [])
      return scopedByExam.filter((question) => idSet.has(question.id))
    }
    default:
      return scopedByExam
  }
}

export function shuffle<T>(items: T[]): T[] {
  const copied = [...items]
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copied[i], copied[j]] = [copied[j], copied[i]]
  }
  return copied
}
