<template>
  <div class="question-card" @click="$emit('click')">
    <div class="card-category">
      <span class="cat-dot"></span>
      {{ question.categoryName }}
    </div>
    <h3 class="card-title">{{ question.title }}</h3>
    <div class="card-footer">
      <span class="card-file">{{ question.fileName }}</span>
      <span class="mastery-badge" :class="masteryClass" v-if="mastery">
        {{ masteryLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/data/questions'
import { useQuizStore } from '@/stores/quizStore'

const props = defineProps<{
  question: Question
}>()

defineEmits<{
  click: []
}>()

const quiz = useQuizStore()
const mastery = computed(() => quiz.mastery[props.question.id])

const masteryClass = computed(() => {
  if (mastery.value === 'known') return 'known'
  if (mastery.value === 'partial') return 'partial'
  return ''
})

const masteryLabel = computed(() => {
  if (mastery.value === 'known') return '✓ 已掌握'
  if (mastery.value === 'partial') return '△ 部分掌握'
  return ''
})
</script>

<style lang="scss" scoped>
.question-card {
  padding: 20px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);

  &:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-medium);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.card-category {
  font-size: 12px;
  color: var(--accent-light);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.cat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-file {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.mastery-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;

  &.known {
    background: var(--success-bg);
    color: var(--success);
  }

  &.partial {
    background: var(--warning-bg);
    color: var(--warning);
  }
}
</style>
