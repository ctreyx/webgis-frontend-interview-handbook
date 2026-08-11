<template>
  <div class="quiz-view fade-in">
    <!-- ===== 配置阶段 ===== -->
    <template v-if="!quiz.currentQuiz && !lastResult">
      <div class="quiz-setup">
        <div class="setup-header">
          <h1>🎯 随机考试</h1>
          <p>选择分类和题目数量，开始自测</p>
        </div>

        <!-- 分类选择 -->
        <div class="setup-section">
          <div class="setup-label">
            <span>选择分类</span>
            <button class="link-btn" @click="toggleAllCats">
              {{ selectedCats.length === app.categories.length ? '取消全选' : '全选' }}
            </button>
          </div>
          <div class="cat-grid">
            <button
              v-for="cat in app.categories"
              :key="cat.key"
              class="cat-chip"
              :class="{ active: selectedCats.includes(cat.key) }"
              @click="toggleCat(cat.key)"
            >
              <span class="chip-name">{{ cat.name }}</span>
              <span class="chip-count">{{ cat.count }}</span>
            </button>
          </div>
        </div>

        <!-- 数量选择 -->
        <div class="setup-section">
          <div class="setup-label">题目数量</div>
          <div class="count-options">
            <button
              v-for="n in countOptions"
              :key="n"
              class="count-btn"
              :class="{ active: quizCount === n }"
              @click="quizCount = n"
            >
              {{ n === -1 ? '全部' : n + ' 题' }}
            </button>
          </div>
        </div>

        <!-- 模式选择 -->
        <div class="setup-section">
          <div class="setup-label">考试模式</div>
          <div class="mode-options">
            <button
              v-for="m in modes"
              :key="m.value"
              class="mode-btn"
              :class="{ active: quizMode === m.value }"
              @click="quizMode = m.value"
            >
              <span class="mode-icon">{{ m.icon }}</span>
              <span class="mode-name">{{ m.label }}</span>
              <span class="mode-desc">{{ m.desc }}</span>
            </button>
          </div>
        </div>

        <div class="setup-info">
          可用题目: {{ availableCount }} 题 |
          已掌握: {{ masteredInSelection }} 题 |
          未掌握: {{ availableCount - masteredInSelection }} 题
        </div>

        <button
          class="start-btn"
          :disabled="selectedCats.length === 0 || availableCount === 0"
          @click="startExam"
        >
          开始考试
        </button>
      </div>
    </template>

    <!-- ===== 考试进行中 ===== -->
    <template v-if="quiz.currentQuiz">
      <div class="quiz-active">
        <!-- 进度条 -->
        <div class="quiz-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="progress-info">
            <span>{{ quiz.currentQuiz.currentIndex + 1 }} / {{ quiz.currentQuiz.questions.length }}</span>
            <span>{{ progressPercent }}%</span>
          </div>
        </div>

        <!-- 当前题目 -->
        <div class="quiz-question" v-if="currentQuestion">
          <div class="q-header">
            <span class="q-number">第 {{ quiz.currentQuiz.currentIndex + 1 }} 题</span>
            <span class="q-category">{{ currentQuestion.categoryName }}</span>
            <span class="q-status-badge" v-if="answerRevealed">
              {{ hasAnswered ? '已提交' : '查看答案中...' }}
            </span>
          </div>

          <!-- 题目：只显示标题 -->
          <div class="q-title-section">
            <h2 class="q-title">{{ currentQuestion.title }}</h2>
          </div>

          <!-- 阶段一：输入答案（答案未显示时） -->
          <div v-if="!answerRevealed" class="answer-input-section">
            <label class="input-label">✍️ 写下你的答案</label>
            <textarea
              ref="answerTextarea"
              v-model="userAnswer"
              class="answer-textarea"
              placeholder="在这里输入你对这道题的理解和回答..."
              rows="8"
              @keydown.ctrl.enter="submitAnswer"
            ></textarea>
            <div class="input-actions">
              <span class="input-hint">Ctrl + Enter 快速提交</span>
              <button
                class="submit-btn"
                :disabled="!userAnswer.trim()"
                @click="submitAnswer"
              >
                提交答案，查看对比
              </button>
            </div>
          </div>

          <!-- 阶段二：答案对比（已提交后） -->
          <div v-if="answerRevealed" class="answer-compare-section">
            <!-- 用户答案 -->
            <div class="compare-panel user-answer" v-if="userAnswer.trim()">
              <div class="panel-header">
                <span class="panel-badge yours">📝 你的回答</span>
              </div>
              <div class="panel-body">{{ userAnswer }}</div>
            </div>

            <!-- 正确答案 -->
            <div class="compare-panel correct-answer">
              <div class="panel-header">
                <span class="panel-badge correct">✅ 参考答案</span>
              </div>
              <div class="panel-body">
                <MarkdownRenderer :content="currentQuestion.content" />
              </div>
            </div>
          </div>

          <!-- 操作按钮（答案显示后） -->
          <div class="quiz-actions" v-if="answerRevealed">
            <p class="action-prompt">对比后，这道题你掌握了吗？</p>
            <div class="action-btns">
              <button class="action-btn unknown" @click="answer('unknown')">
                <span class="action-icon">✗</span>
                <span>没掌握</span>
              </button>
              <button class="action-btn partial" @click="answer('partial')">
                <span class="action-icon">△</span>
                <span>部分掌握</span>
              </button>
              <button class="action-btn known" @click="answer('known')">
                <span class="action-icon">✓</span>
                <span>已掌握</span>
              </button>
            </div>

            <div class="quiz-nav">
              <button
                class="nav-btn-sm"
                :disabled="quiz.currentQuiz.currentIndex === 0"
                @click="goPrev"
              >
                ← 上一题
              </button>
              <button class="nav-btn-sm finish" @click="finishExam">
                结束考试
              </button>
              <button
                v-if="quiz.currentQuiz.currentIndex < quiz.currentQuiz.questions.length - 1"
                class="nav-btn-sm next"
                @click="goNext"
              >
                下一题 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== 考试结果 ===== -->
    <template v-if="lastResult && !quiz.currentQuiz">
      <div class="quiz-result">
        <div class="result-header">
          <div class="result-icon">{{ resultEmoji }}</div>
          <h1>考试完成！</h1>
          <p class="result-date">{{ formatDate(lastResult.date) }}</p>
        </div>

        <div class="result-cards">
          <div class="result-card total">
            <div class="rc-value">{{ lastResult.total }}</div>
            <div class="rc-label">总题数</div>
          </div>
          <div class="result-card known">
            <div class="rc-value">{{ lastResult.known }}</div>
            <div class="rc-label">已掌握</div>
          </div>
          <div class="result-card partial">
            <div class="rc-value">{{ lastResult.partial }}</div>
            <div class="rc-label">部分掌握</div>
          </div>
          <div class="result-card unknown">
            <div class="rc-value">{{ lastResult.unknown }}</div>
            <div class="rc-label">未掌握</div>
          </div>
        </div>

        <div class="result-percent">
          <div class="percent-ring" :style="{ '--pct': knownPercent }">
            <span>{{ knownPercent }}%</span>
          </div>
          <p>掌握率</p>
        </div>

        <!-- 薄弱题目列表 -->
        <div class="weak-questions" v-if="weakQuestions.length > 0">
          <h3>📋 需要复习的题目</h3>
          <div class="weak-list">
            <div
              v-for="q in weakQuestions"
              :key="q.id"
              class="weak-item"
              @click="$router.push(`/question/${encodeURIComponent(q.id)}`)"
            >
              <span class="weak-status" :class="lastResult.results[q.id]">
                {{ statusLabel(lastResult.results[q.id]) }}
              </span>
              <span class="weak-title">{{ q.title }}</span>
              <span class="weak-cat">{{ q.categoryName }}</span>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-primary" @click="retakeExam">重新考试</button>
          <button class="btn-secondary" @click="lastResult = null">重新配置</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useQuizStore, type QuizRecord } from '@/stores/quizStore'
import { questions } from '@/data/questions'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const app = useAppStore()
const quiz = useQuizStore()
const router = useRouter()

// 配置
const selectedCats = ref<string[]>(app.categories.map(c => c.key))
const quizCount = ref(10)
const quizMode = ref<'random' | 'weak' | 'unmastered'>('random')
const lastResult = ref<QuizRecord | null>(null)

// 答题状态
const userAnswer = ref('')
const answerRevealed = ref(false)
const answerTextarea = ref<HTMLTextAreaElement | null>(null)
// 每题的用户答案存储（用于上一题回顾）
const userAnswers = ref<Record<string, string>>({})
// 每题是否已显示答案
const revealedQuestions = ref<Set<string>>(new Set())

const countOptions = [5, 10, 15, 20, 30, -1]

const modes = [
  { value: 'random' as const, icon: '🎲', label: '随机抽取', desc: '从选中分类随机抽题' },
  { value: 'unmastered' as const, icon: '🎯', label: '未掌握优先', desc: '优先出还没掌握的题' },
  { value: 'weak' as const, icon: '📋', label: '薄弱环节', desc: '只出部分掌握和未掌握的题' },
]

// 可用题目
const availablePool = computed(() => {
  let pool = questions
  if (selectedCats.value.length > 0) {
    pool = pool.filter(q => selectedCats.value.includes(q.category))
  }
  if (quizMode.value === 'unmastered') {
    const unmastered = pool.filter(q => quiz.mastery[q.id] !== 'known')
    const mastered = pool.filter(q => quiz.mastery[q.id] === 'known')
    return [...unmastered, ...mastered]
  }
  if (quizMode.value === 'weak') {
    return pool.filter(q => quiz.mastery[q.id] !== 'known')
  }
  return [...pool].sort(() => Math.random() - 0.5)
})

const availableCount = computed(() => {
  let pool = questions.filter(q => selectedCats.value.includes(q.category))
  if (quizMode.value === 'weak') {
    pool = pool.filter(q => quiz.mastery[q.id] !== 'known')
  }
  return pool.length
})

const masteredInSelection = computed(() => {
  let pool = questions.filter(q => selectedCats.value.includes(q.category))
  return pool.filter(q => quiz.mastery[q.id] === 'known').length
})

// 当前题目
const currentQuestion = computed(() => {
  if (!quiz.currentQuiz) return null
  const qId = quiz.currentQuiz.questions[quiz.currentQuiz.currentIndex]
  return questions.find(q => q.id === qId) || null
})

const progressPercent = computed(() => {
  if (!quiz.currentQuiz) return 0
  return Math.round((quiz.currentQuiz.currentIndex / quiz.currentQuiz.questions.length) * 100)
})

// 当前题是否已评估
const hasAnswered = computed(() => {
  if (!quiz.currentQuiz) return false
  const qId = quiz.currentQuiz.questions[quiz.currentQuiz.currentIndex]
  return qId in quiz.currentQuiz.results
})

// 结果
const resultEmoji = computed(() => {
  if (!lastResult.value) return ''
  const pct = lastResult.value.total > 0
    ? Math.round((lastResult.value.known / lastResult.value.total) * 100)
    : 0
  if (pct >= 80) return '🎉'
  if (pct >= 60) return '💪'
  if (pct >= 40) return '📚'
  return '🔥'
})

const knownPercent = computed(() => {
  if (!lastResult.value || lastResult.value.total === 0) return 0
  return Math.round((lastResult.value.known / lastResult.value.total) * 100)
})

const weakQuestions = computed(() => {
  if (!lastResult.value) return []
  return lastResult.value.questionIds
    .filter(id => lastResult.value!.results[id] !== 'known')
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is NonNullable<typeof q> => q != null)
})

// 方法
function toggleCat(key: string) {
  const idx = selectedCats.value.indexOf(key)
  if (idx >= 0) selectedCats.value.splice(idx, 1)
  else selectedCats.value.push(key)
}

function toggleAllCats() {
  if (selectedCats.value.length === app.categories.length) {
    selectedCats.value = []
  } else {
    selectedCats.value = app.categories.map(c => c.key)
  }
}

function startExam() {
  const count = quizCount.value === -1 ? availablePool.value.length : Math.min(quizCount.value, availablePool.value.length)
  const ids = availablePool.value.slice(0, count).map(q => q.id)
  // 重置所有答题状态
  userAnswer.value = ''
  answerRevealed.value = false
  userAnswers.value = {}
  revealedQuestions.value = new Set()
  quiz.startQuiz(ids)
  nextTick(() => answerTextarea.value?.focus())
}

function submitAnswer() {
  if (!userAnswer.value.trim() || !quiz.currentQuiz) return
  const qId = quiz.currentQuiz.questions[quiz.currentQuiz.currentIndex]
  userAnswers.value[qId] = userAnswer.value
  revealedQuestions.value.add(qId)
  answerRevealed.value = true
}

function goNext() {
  if (!quiz.currentQuiz) return
  quiz.currentQuiz.currentIndex++
  loadQuestionState()
}

function goPrev() {
  if (!quiz.currentQuiz || quiz.currentQuiz.currentIndex <= 0) return
  quiz.currentQuiz.currentIndex--
  loadQuestionState()
}

function loadQuestionState() {
  if (!quiz.currentQuiz) return
  const qId = quiz.currentQuiz.questions[quiz.currentQuiz.currentIndex]
  userAnswer.value = userAnswers.value[qId] || ''
  answerRevealed.value = revealedQuestions.value.has(qId)
  if (!answerRevealed.value) {
    nextTick(() => answerTextarea.value?.focus())
  }
}

function resetQuestionState() {
  userAnswer.value = ''
  answerRevealed.value = false
  nextTick(() => answerTextarea.value?.focus())
}

function answer(level: 'known' | 'unknown' | 'partial') {
  quiz.answerCurrent(level)
  if (quiz.currentQuiz && quiz.currentQuiz.currentIndex >= quiz.currentQuiz.questions.length - 1) {
    const answeredAll = Object.keys(quiz.currentQuiz.results).length >= quiz.currentQuiz.questions.length
    if (answeredAll) {
      const result = quiz.finishQuiz()
      if (result) lastResult.value = result
    }
  }
}

function finishExam() {
  const result = quiz.finishQuiz()
  if (result) lastResult.value = result
}

function retakeExam() {
  lastResult.value = null
  startExam()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN')
}

function statusLabel(s: string) {
  if (s === 'known') return '✓'
  if (s === 'partial') return '△'
  return '✗'
}
</script>

<style lang="scss" scoped>
.quiz-view {
  max-width: 860px;
  margin: 0 auto;
}

// ===== Setup =====
.quiz-setup {
  .setup-header {
    text-align: center;
    margin-bottom: 36px;

    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    p { color: var(--text-secondary); font-size: 15px; }
  }
}

.setup-section {
  margin-bottom: 24px;
}

.setup-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.link-btn {
  font-size: 12px;
  color: var(--accent-light);
  background: none;
  &:hover { text-decoration: underline; }
}

.cat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 13px;
  transition: all var(--transition-fast);

  &:hover { border-color: var(--border-medium); }
  &.active {
    background: var(--accent-glow);
    border-color: var(--accent);
    color: var(--accent-light);
  }
}

.chip-count {
  font-size: 11px;
  opacity: 0.6;
}

.count-options, .mode-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.count-btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 14px;
  transition: all var(--transition-fast);

  &:hover { border-color: var(--border-medium); }
  &.active {
    background: var(--accent-glow);
    border-color: var(--accent);
    color: var(--accent-light);
    font-weight: 600;
  }
}

.mode-btn {
  flex: 1;
  min-width: 140px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  text-align: left;
  transition: all var(--transition-fast);

  &:hover { border-color: var(--border-medium); }
  &.active {
    background: var(--bg-glass-strong);
    border-color: var(--accent);
  }
}

.mode-icon { font-size: 22px; display: block; margin-bottom: 6px; }
.mode-name { font-size: 14px; font-weight: 600; display: block; margin-bottom: 2px; }
.mode-desc { font-size: 11px; color: var(--text-muted); }

.setup-info {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.start-btn {
  display: block;
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--accent);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  transition: all var(--transition-normal);

  &:hover:not(:disabled) {
    background: var(--accent-light);
    box-shadow: var(--shadow-glow);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// ===== Active Quiz =====
.quiz-progress {
  margin-bottom: 28px;
}

.progress-bar {
  height: 6px;
  background: var(--bg-glass);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}

.quiz-question {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 32px;
}

.q-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.q-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-light);
}

.q-category {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  background: var(--bg-glass-strong);
  color: var(--text-muted);
}

.q-status-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  background: var(--info-bg);
  color: var(--info);
  margin-left: auto;
}

// 题目标题区
.q-title-section {
  margin-bottom: 28px;
}

.q-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--text-primary);
}

// 答案输入区
.answer-input-section {
  margin-bottom: 8px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.answer-textarea {
  width: 100%;
  min-height: 160px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  font-family: var(--font-sans);
  line-height: 1.7;
  resize: vertical;
  transition: border-color var(--transition-fast);
  outline: none;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.input-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.submit-btn {
  padding: 10px 24px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--accent-light);
    box-shadow: var(--shadow-glow);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// 答案对比区
.answer-compare-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 8px;
}

.compare-panel {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  &.user-answer {
    border-color: var(--border-medium);
  }

  &.correct-answer {
    border-color: var(--success);
    background: var(--bg-glass);
  }
}

.panel-header {
  padding: 10px 16px;
  background: var(--bg-glass);
  border-bottom: 1px solid var(--border-subtle);
}

.panel-badge {
  font-size: 12px;
  font-weight: 600;

  &.yours { color: var(--accent-light); }
  &.correct { color: var(--success); }
}

.panel-body {
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
  max-height: 500px;
  overflow-y: auto;

  // MarkdownRenderer inside panel
  :deep(.markdown-body) {
    h1 { font-size: 18px; }
    h2 { font-size: 15px; margin-top: 16px; }
    h3 { font-size: 14px; }
    pre { padding: 10px 14px; }
    code { font-size: 12px; }
  }
}

.quiz-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
}

.action-prompt {
  text-align: center;
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.action-btns {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);

  .action-icon { font-size: 22px; }

  &.unknown {
    background: var(--danger-bg);
    color: var(--danger);
    &:hover { background: rgba(239, 68, 68, 0.2); }
  }
  &.partial {
    background: var(--warning-bg);
    color: var(--warning);
    &:hover { background: rgba(245, 158, 11, 0.2); }
  }
  &.known {
    background: var(--success-bg);
    color: var(--success);
    &:hover { background: rgba(34, 197, 94, 0.2); }
  }
}

.quiz-nav {
  display: flex;
  justify-content: space-between;
}

.nav-btn-sm {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-size: 13px;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) { background: var(--bg-glass-strong); color: var(--text-primary); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  &.finish {
    color: var(--warning);
    &:hover { background: var(--warning-bg); }
  }

  &.next {
    color: var(--accent-light);
    &:hover { background: var(--accent-glow); }
  }
}

// ===== Result =====
.quiz-result {
  text-align: center;
}

.result-header {
  margin-bottom: 32px;

  .result-icon { font-size: 56px; margin-bottom: 12px; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
  .result-date { font-size: 13px; color: var(--text-muted); }
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.result-card {
  padding: 20px 12px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);

  .rc-value { font-size: 32px; font-weight: 700; }
  .rc-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

  &.known .rc-value { color: var(--success); }
  &.partial .rc-value { color: var(--warning); }
  &.unknown .rc-value { color: var(--danger); }
}

.result-percent {
  margin-bottom: 32px;

  .percent-ring {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    margin: 0 auto 8px;
    background: conic-gradient(
      var(--success) calc(var(--pct) * 1%),
      var(--bg-glass) calc(var(--pct) * 1%)
    );
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      font-size: 32px;
      font-weight: 700;
      color: var(--success);
    }
  }

  p { font-size: 14px; color: var(--text-muted); margin-top: 8px; }
}

.weak-questions {
  text-align: left;
  margin-bottom: 28px;

  h3 { font-size: 16px; margin-bottom: 12px; }
}

.weak-list { display: flex; flex-direction: column; gap: 6px; }

.weak-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-glass);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover { background: var(--bg-card-hover); }
}

.weak-status {
  font-size: 12px;
  font-weight: 600;
  width: 20px;

  &.unknown { color: var(--danger); }
  &.partial { color: var(--warning); }
}

.weak-title {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weak-cat {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  padding: 12px 32px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--accent-light);
    box-shadow: var(--shadow-glow);
  }
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  background: var(--bg-glass-strong);
  color: var(--text-primary);
  font-size: 15px;
  transition: all var(--transition-fast);

  &:hover { background: var(--border-strong); }
}
</style>
