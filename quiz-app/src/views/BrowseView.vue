<template>
  <div class="browse-view fade-in">
    <!-- 统计概览条 -->
    <div class="stats-bar" v-if="!app.selectedCategory && !app.searchQuery">
      <div class="stat-card">
        <div class="stat-value">{{ questions.length }}</div>
        <div class="stat-label">总题量</div>
      </div>
      <div class="stat-card">
        <div class="stat-value accent">{{ quiz.stats.known }}</div>
        <div class="stat-label">已掌握</div>
      </div>
      <div class="stat-card">
        <div class="stat-value warning">{{ quiz.stats.partial }}</div>
        <div class="stat-label">部分掌握</div>
      </div>
      <div class="stat-card">
        <div class="stat-value muted">{{ Math.round(quiz.stats.masteredPercent) }}%</div>
        <div class="stat-label">掌握率</div>
      </div>
    </div>

    <!-- 搜索/分类标题 -->
    <div class="browse-header" v-if="app.selectedCategory || app.searchQuery">
      <h2 v-if="app.selectedCategory && !app.searchQuery">
        {{ categoryName }}
        <span class="count-tag">{{ app.filteredQuestions.length }} 题</span>
      </h2>
      <h2 v-else-if="app.searchQuery">
        搜索: "{{ app.searchQuery }}"
        <span class="count-tag">{{ app.filteredQuestions.length }} 结果</span>
      </h2>
      <button v-if="app.selectedCategory" class="clear-btn" @click="app.setCategory(null)">查看全部</button>
    </div>

    <!-- 分类网格（无筛选时） -->
    <template v-if="!app.selectedCategory && !app.searchQuery">
      <div v-for="cat in app.categories" :key="cat.key" class="category-section">
        <h3 class="section-title" @click="toggleSection(cat.key)">
          <span class="section-arrow-icon">{{ expandedSections.has(cat.key) ? '▾' : '▸' }}</span>
          {{ cat.name }}
          <span class="section-count">{{ cat.count }}</span>
          <span v-if="getCategoryQuestions(cat.key).length > 4 && !expandedSections.has(cat.key)" class="section-hint">
            +{{ getCategoryQuestions(cat.key).length - 4 }}
          </span>
        </h3>
        <div class="card-grid">
          <QuestionCard
            v-for="q in (expandedSections.has(cat.key) ? getCategoryQuestions(cat.key) : getCategoryQuestions(cat.key).slice(0, 4))"
            :key="q.id"
            :question="q"
            @click="openQuestion(q.id)"
          />
          <div
            v-if="getCategoryQuestions(cat.key).length > 4 && !expandedSections.has(cat.key)"
            class="more-card"
            @click="toggleSection(cat.key)"
          >
            <span class="more-text">展开全部 {{ getCategoryQuestions(cat.key).length }} 题</span>
            <span class="more-arrow">▾</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 筛选后的卡片列表 -->
    <div class="card-grid" v-else>
      <QuestionCard
        v-for="q in app.filteredQuestions"
        :key="q.id"
        :question="q"
        @click="openQuestion(q.id)"
      />
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="app.filteredQuestions.length === 0">
      <span class="empty-icon">🔍</span>
      <p>没有找到匹配的题目</p>
      <button class="btn-secondary" @click="app.setSearch(''); app.setCategory(null)">清除筛选</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useQuizStore } from '@/stores/quizStore'
import { questions } from '@/data/questions'
import QuestionCard from '@/components/QuestionCard.vue'

const app = useAppStore()
const quiz = useQuizStore()
const router = useRouter()

// 记录哪些分类展开了
const expandedSections = ref(new Set<string>())

const categoryName = computed(() => {
  const cat = app.categories.find(c => c.key === app.selectedCategory)
  return cat?.name || ''
})

function toggleSection(key: string) {
  const next = new Set(expandedSections.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  expandedSections.value = next
}

function getCategoryQuestions(catKey: string) {
  return questions.filter(q => q.category === catKey)
}

function openQuestion(id: string) {
  router.push(`/question/${encodeURIComponent(id)}`)
}
</script>

<style lang="scss" scoped>
.browse-view {
  max-width: 1200px;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);

  &.accent { color: var(--success); }
  &.warning { color: var(--warning); }
  &.muted { color: var(--text-secondary); }
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.browse-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  h2 {
    font-size: 20px;
    font-weight: 600;
  }
}

.count-tag {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 8px;
}

.clear-btn {
  font-size: 13px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  color: var(--text-secondary);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-glass-strong);
    color: var(--text-primary);
  }
}

.category-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  transition: color var(--transition-fast);
  user-select: none;

  &:hover {
    color: var(--accent-light);
  }
}

.section-arrow-icon {
  font-size: 14px;
  color: var(--text-muted);
}

.section-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  background: var(--bg-glass);
  padding: 2px 8px;
  border-radius: 10px;
}

.section-hint {
  font-size: 11px;
  color: var(--accent-light);
  font-weight: 400;
}

.section-arrow {
  font-size: 16px;
  color: var(--accent);
  opacity: 0;
  transition: all var(--transition-fast);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}

.more-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 24px;
  background: var(--bg-glass);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--text-secondary);
  font-size: 14px;

  &:hover {
    background: var(--bg-card-hover);
    border-color: var(--accent);
    color: var(--accent-light);
  }
}

.more-arrow {
  transition: transform var(--transition-fast);
  .more-card:hover & { transform: translateX(4px); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);

  .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
  p { font-size: 16px; margin-bottom: 20px; }
}

.btn-secondary {
  padding: 10px 24px;
  border-radius: var(--radius-md);
  background: var(--bg-glass-strong);
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--transition-fast);

  &:hover { background: var(--border-strong); }
}

// ===== 移动端响应式 =====
@media (max-width: 768px) {
  .browse-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card {
    padding: 14px;
  }

  .question-grid {
    gap: 10px;
  }

  .question-card {
    padding: 14px 16px;
  }

  .question-title {
    font-size: 14px;
  }

  .category-section h3 {
    font-size: 13px;
  }
}
</style>
