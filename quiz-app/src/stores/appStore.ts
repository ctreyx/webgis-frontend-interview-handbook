import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questions, categories, type Question } from '@/data/questions'

export const useAppStore = defineStore('app', () => {
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)
  const sidebarCollapsed = ref(false)
  const theme = ref<'dark' | 'light'>('dark')

  const filteredQuestions = computed(() => {
    let result = questions
    if (selectedCategory.value) {
      result = result.filter(q => q.category === selectedCategory.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q)
      )
    }
    return result
  })

  function setCategory(cat: string | null) {
    selectedCategory.value = cat
  }

  function setSearch(q: string) {
    searchQuery.value = q
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function getQuestionById(id: string): Question | undefined {
    return questions.find(q => q.id === id)
  }

  return {
    searchQuery,
    selectedCategory,
    sidebarCollapsed,
    theme,
    filteredQuestions,
    categories,
    setCategory,
    setSearch,
    toggleSidebar,
    getQuestionById,
  }
})
