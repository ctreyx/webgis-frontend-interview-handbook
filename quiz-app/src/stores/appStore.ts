import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questions, categories, type Question } from '@/data/questions'

// 主题定义
export const THEMES = [
  { key: 'space', name: '深空紫', desc: '深邃的紫罗兰色调', icon: '🪐' },
  { key: 'ocean', name: '海洋蓝', desc: '宁静的深海蓝调', icon: '🌊' },
  { key: 'forest', name: '森林绿', desc: '自然的苔原绿意', icon: '🌲' },
  { key: 'sunset', name: '暖阳橙', desc: '温暖的日落余晖', icon: '🌇' },
  { key: 'midnight', name: '极夜黑', desc: '纯粹的高对比暗黑', icon: '🌑' },
] as const

export type ThemeKey = (typeof THEMES)[number]['key']

export const useAppStore = defineStore('app', () => {
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)
  const sidebarCollapsed = ref(false)
  const mobileMenuOpen = ref(false)
  const theme = ref<ThemeKey>(localStorage.getItem('app-theme') as ThemeKey || 'space')
  // 全局设置：是否默认显示答案（false = 默认隐藏答案，需点击显示）
  const showAnswerDefault = ref(localStorage.getItem('app-show-answer') === '1')

  // 应用主题到 document
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem('app-theme', theme.value)
  }
  applyTheme()

  function setTheme(key: ThemeKey) {
    theme.value = key
    document.documentElement.classList.add('theme-transition')
    applyTheme()
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 400)
  }

  function toggleShowAnswerDefault() {
    showAnswerDefault.value = !showAnswerDefault.value
    localStorage.setItem('app-show-answer', showAnswerDefault.value ? '1' : '0')
  }

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

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  function getQuestionById(id: string): Question | undefined {
    return questions.find(q => q.id === id)
  }

  return {
    searchQuery,
    selectedCategory,
    sidebarCollapsed,
    mobileMenuOpen,
    theme,
    showAnswerDefault,
    THEMES,
    filteredQuestions,
    categories,
    setCategory,
    setSearch,
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
    setTheme,
    toggleShowAnswerDefault,
    getQuestionById,
  }
})
