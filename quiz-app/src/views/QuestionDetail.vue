<template>
  <div class="question-detail fade-in" v-if="question">
    <!-- 题目头部 -->
    <div class="question-header">
      <div class="header-top">
        <span class="category-badge">{{ question.categoryName }}</span>
        <div class="mastery-selector">
          <button
            v-for="opt in masteryOptions"
            :key="opt.value"
            class="mastery-btn"
            :class="[opt.value, { active: quiz.mastery[question.id] === opt.value }]"
            @click="quiz.setMastery(question.id, opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <h1 class="question-title">{{ question.title }}</h1>
      <div class="question-meta">
        <span class="meta-item">📄 {{ question.fileName }}</span>
        <span class="meta-item">📁 {{ question.category }}</span>
      </div>
    </div>

    <!-- 答案内容 -->
    <div class="answer-section">
      <div class="answer-glass" :class="{ 'answer-hidden': !answerRevealed }">
        <div
          class="answer-overlay"
          v-if="!answerRevealed"
          @click="answerRevealed = true"
        >
          <span class="overlay-lock">🔒</span>
          <span class="overlay-text">点击显示答案</span>
          <span class="overlay-sub">(全局设置为「默认隐藏答案」)</span>
        </div>
        <div :class="{ 'answer-blur': !answerRevealed }">
          <MarkdownRenderer :content="question.content" />
        </div>
      </div>
    </div>

    <!-- 导航 -->
    <div class="question-nav">
      <button
        v-if="prevQuestion"
        class="nav-btn prev"
        @click="$router.push(`/question/${encodeURIComponent(prevQuestion.id)}`)"
      >
        ← {{ prevQuestion.title }}
      </button>
      <button
        v-if="nextQuestion"
        class="nav-btn next"
        @click="$router.push(`/question/${encodeURIComponent(nextQuestion.id)}`)"
      >
        {{ nextQuestion.title }} →
      </button>
    </div>
  </div>

  <div class="not-found fade-in" v-else>
    <span class="empty-icon">🤔</span>
    <p>题目未找到</p>
    <router-link to="/" class="btn-secondary">回到首页</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useQuizStore } from '@/stores/quizStore'
import { questions } from '@/data/questions'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const route = useRoute()
const app = useAppStore()
const quiz = useQuizStore()

// 答案是否显示（由全局设置决定默认值）
const answerRevealed = ref(app.showAnswerDefault)

// 切换题目时重置显示状态
watch(
  () => route.params.id,
  () => {
    answerRevealed.value = app.showAnswerDefault
  }
)

const question = computed(() => app.getQuestionById(decodeURIComponent(route.params.id as string)))

const currentIndex = computed(() =>
  questions.findIndex(q => q.id === decodeURIComponent(route.params.id as string))
)

const prevQuestion = computed(() =>
  currentIndex.value > 0 ? questions[currentIndex.value - 1] : null
)

const nextQuestion = computed(() =>
  currentIndex.value < questions.length - 1 ? questions[currentIndex.value + 1] : null
)

const masteryOptions = [
  { value: 'known' as const, label: '✓ 已掌握' },
  { value: 'partial' as const, label: '△ 部分掌握' },
  { value: 'unknown' as const, label: '✗ 未掌握' },
]
</script>

<style lang="scss" scoped>
.question-detail {
  max-width: 860px;
  margin: 0 auto;
}

.question-header {
  margin-bottom: 32px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.category-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  background: var(--accent-glow);
  color: var(--accent-light);
  font-weight: 500;
}

.mastery-selector {
  display: flex;
  gap: 4px;
  background: var(--bg-glass);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.mastery-btn {
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 6px;
  color: var(--text-muted);
  background: none;
  transition: all var(--transition-fast);
  white-space: nowrap;

  &.active {
    &.known { background: var(--success-bg); color: var(--success); }
    &.partial { background: var(--warning-bg); color: var(--warning); }
    &.unknown { background: var(--danger-bg); color: var(--danger); }
  }

  &:hover:not(.active) {
    color: var(--text-secondary);
  }
}

.question-title {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 12px;
}

.question-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  font-size: 12px;
  color: var(--text-muted);
}

.answer-section {
  position: relative;
}

.answer-glass {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-slow);
  position: relative;
  overflow: hidden;

  &.answer-hidden {
    cursor: pointer;
  }
}

.answer-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    .overlay-lock { transform: scale(1.2); }
  }
}

.overlay-lock {
  font-size: 36px;
  transition: transform var(--transition-fast);
}

.overlay-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.overlay-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.question-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

.nav-btn {
  padding: 14px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  text-align: left;
  transition: all var(--transition-fast);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-medium);
    color: var(--text-primary);
  }

  &.next { text-align: right; }
}

.not-found {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);

  .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
  p { font-size: 16px; margin-bottom: 20px; }
}

.btn-secondary {
  display: inline-block;
  padding: 10px 24px;
  border-radius: var(--radius-md);
  background: var(--bg-glass-strong);
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--transition-fast);

  &:hover { background: var(--border-strong); }
}
</style>
