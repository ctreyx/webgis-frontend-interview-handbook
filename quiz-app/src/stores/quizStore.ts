import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questions } from '@/data/questions'

export interface QuizRecord {
  id: string
  date: string
  total: number
  known: number
  unknown: number
  partial: number
  questionIds: string[]
  results: Record<string, 'known' | 'unknown' | 'partial'>
}

export const useQuizStore = defineStore('quiz', () => {
  // 每题掌握状态: 'unknown' | 'partial' | 'known'
  const mastery = ref<Record<string, 'unknown' | 'partial' | 'known'>>(
    JSON.parse(localStorage.getItem('quiz-mastery') || '{}')
  )

  const history = ref<QuizRecord[]>(
    JSON.parse(localStorage.getItem('quiz-history') || '[]')
  )

  // 当前正在进行的考试
  const currentQuiz = ref<{
    questions: string[]
    currentIndex: number
    results: Record<string, 'known' | 'unknown' | 'partial'>
    startTime: string
  } | null>(null)

  const stats = computed(() => {
    const total = questions.length
    const known = Object.values(mastery.value).filter(v => v === 'known').length
    const partial = Object.values(mastery.value).filter(v => v === 'partial').length
    const unknown = total - known - partial
    const masteredPercent = total > 0 ? Math.round((known / total) * 100) : 0

    // 各分类统计
    const categoryStats = new Map<string, { total: number; known: number; partial: number }>()
    for (const q of questions) {
      const s = categoryStats.get(q.category) || { total: 0, known: 0, partial: 0 }
      s.total++
      const m = mastery.value[q.id]
      if (m === 'known') s.known++
      else if (m === 'partial') s.partial++
      categoryStats.set(q.category, s)
    }

    return { total, known, partial, unknown, masteredPercent, categoryStats }
  })

  function save() {
    localStorage.setItem('quiz-mastery', JSON.stringify(mastery.value))
    localStorage.setItem('quiz-history', JSON.stringify(history.value.slice(0, 50)))
  }

  function setMastery(questionId: string, level: 'known' | 'unknown' | 'partial') {
    mastery.value = { ...mastery.value, [questionId]: level }
    save()
  }

  function startQuiz(questionIds: string[]) {
    currentQuiz.value = {
      questions: questionIds,
      currentIndex: 0,
      results: {},
      startTime: new Date().toISOString(),
    }
  }

  function answerCurrent(level: 'known' | 'unknown' | 'partial') {
    if (!currentQuiz.value) return
    const qId = currentQuiz.value.questions[currentQuiz.value.currentIndex]
    currentQuiz.value.results[qId] = level
    setMastery(qId, level)

    if (currentQuiz.value.currentIndex < currentQuiz.value.questions.length - 1) {
      currentQuiz.value.currentIndex++
    }
  }

  function prevQuestion() {
    if (!currentQuiz.value || currentQuiz.value.currentIndex <= 0) return
    currentQuiz.value.currentIndex--
  }

  function finishQuiz() {
    if (!currentQuiz.value) return
    const results = currentQuiz.value.results
    const record: QuizRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      total: currentQuiz.value.questions.length,
      known: Object.values(results).filter(v => v === 'known').length,
      unknown: Object.values(results).filter(v => v === 'unknown').length,
      partial: Object.values(results).filter(v => v === 'partial').length,
      questionIds: currentQuiz.value.questions,
      results,
    }
    history.value = [record, ...history.value].slice(0, 50)
    currentQuiz.value = null
    save()
    return record
  }

  function cancelQuiz() {
    currentQuiz.value = null
  }

  function getRandomQuestions(count: number, categories?: string[]): string[] {
    let pool = questions
    if (categories && categories.length > 0) {
      pool = questions.filter(q => categories.includes(q.category))
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length)).map(q => q.id)
  }

  return {
    mastery,
    history,
    currentQuiz,
    stats,
    setMastery,
    startQuiz,
    answerCurrent,
    prevQuestion,
    finishQuiz,
    cancelQuiz,
    getRandomQuestions,
  }
})
