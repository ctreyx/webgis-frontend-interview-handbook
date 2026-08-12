<template>
  <div class="stats-view fade-in">
    <div class="stats-header">
      <h1>📊 学习统计</h1>
    </div>

    <!-- 总览卡片 -->
    <div class="overview-cards">
      <div class="overview-card main">
        <div class="ov-big">{{ quiz.stats.masteredPercent }}%</div>
        <div class="ov-label">总掌握率</div>
        <div class="ov-sub">{{ quiz.stats.known }} / {{ quiz.stats.total }} 题</div>
      </div>
      <div class="overview-card">
        <div class="ov-value success">{{ quiz.stats.known }}</div>
        <div class="ov-label">已掌握</div>
      </div>
      <div class="overview-card">
        <div class="ov-value warning">{{ quiz.stats.partial }}</div>
        <div class="ov-label">部分掌握</div>
      </div>
      <div class="overview-card">
        <div class="ov-value danger">{{ quiz.stats.unknown }}</div>
        <div class="ov-label">未掌握</div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="mastery-bar-container">
      <div class="mastery-bar">
        <div
          class="bar-segment known"
          :style="{ width: knownPct + '%' }"
          v-if="knownPct > 0"
        ></div>
        <div
          class="bar-segment partial"
          :style="{ width: partialPct + '%' }"
          v-if="partialPct > 0"
        ></div>
        <div
          class="bar-segment unknown"
          :style="{ width: unknownPct + '%' }"
          v-if="unknownPct > 0"
        ></div>
      </div>
      <div class="bar-legend">
        <span class="legend-item"><span class="dot known"></span> 已掌握 {{ knownPct }}%</span>
        <span class="legend-item"><span class="dot partial"></span> 部分掌握 {{ partialPct }}%</span>
        <span class="legend-item"><span class="dot unknown"></span> 未掌握 {{ unknownPct }}%</span>
      </div>
    </div>

    <!-- 分类掌握情况 -->
    <h2 class="section-heading">分类掌握情况</h2>
    <div class="cat-stats">
      <div
        v-for="cat in sortedCatStats"
        :key="cat.key"
        class="cat-stat-row"
      >
        <div class="cs-header">
          <span class="cs-name">{{ cat.name }}</span>
          <span class="cs-pct">{{ cat.percent }}%</span>
        </div>
        <div class="cs-bar">
          <div class="cs-fill known" :style="{ width: cat.percent + '%' }"></div>
        </div>
        <div class="cs-detail">
          {{ cat.known }}/{{ cat.total }} 已掌握
          <span v-if="cat.partial > 0" class="cs-partial"> · {{ cat.partial }} 部分掌握</span>
        </div>
      </div>
    </div>

    <!-- 考试历史 -->
    <h2 class="section-heading">考试历史</h2>
    <div class="history-section" v-if="quiz.history.length > 0">
      <div class="history-list">
        <div
          v-for="record in quiz.history.slice(0, 10)"
          :key="record.id"
          class="history-item"
        >
          <div class="hi-date">{{ formatDate(record.date) }}</div>
          <div class="hi-bar">
            <div class="hi-fill known" :style="{ width: knownWidth(record) + '%' }"></div>
            <div class="hi-fill partial" :style="{ width: partialWidth(record) + '%' }"></div>
            <div class="hi-fill unknown" :style="{ width: unknownWidth(record) + '%' }"></div>
          </div>
          <div class="hi-score">{{ record.known }}/{{ record.total }}</div>
          <div class="hi-pct">{{ Math.round(record.known / record.total * 100) }}%</div>
        </div>
      </div>

      <button
        v-if="quiz.history.length > 0"
        class="clear-btn"
        @click="clearHistory"
      >
        清除历史记录
      </button>
    </div>

    <div class="empty-state" v-else>
      <span class="empty-icon">📝</span>
      <p>还没有考试记录</p>
      <router-link to="/quiz" class="btn-secondary">去考试</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useAppStore } from '@/stores/appStore'
import type { QuizRecord } from '@/stores/quizStore'

const quiz = useQuizStore()
const app = useAppStore()

const knownPct = computed(() => quiz.stats.total > 0 ? Math.round(quiz.stats.known / quiz.stats.total * 100) : 0)
const partialPct = computed(() => quiz.stats.total > 0 ? Math.round(quiz.stats.partial / quiz.stats.total * 100) : 0)
const unknownPct = computed(() => 100 - knownPct.value - partialPct.value)

const sortedCatStats = computed(() => {
  return app.categories
    .map(cat => {
      const s = quiz.stats.categoryStats.get(cat.key)
      const total = s?.total || cat.count
      const known = s?.known || 0
      const partial = s?.partial || 0
      const percent = total > 0 ? Math.round(known / total * 100) : 0
      return { ...cat, total, known, partial, percent }
    })
    .sort((a, b) => a.percent - b.percent) // 从低到高，薄弱项在前
})

function knownWidth(r: QuizRecord) { return r.total > 0 ? Math.round(r.known / r.total * 100) : 0 }
function partialWidth(r: QuizRecord) { return r.total > 0 ? Math.round(r.partial / r.total * 100) : 0 }
function unknownWidth(r: QuizRecord) { return 100 - knownWidth(r) - partialWidth(r) }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function clearHistory() {
  if (confirm('确定要清除所有考试历史吗？掌握状态会保留。')) {
    localStorage.removeItem('quiz-history')
    quiz.history.splice(0)
  }
}
</script>

<style lang="scss" scoped>
.stats-view {
  max-width: 860px;
  margin: 0 auto;
}

.stats-header {
  margin-bottom: 28px;
  h1 { font-size: 24px; font-weight: 700; }
}

// Overview
.overview-cards {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 24px;
}

.overview-card {
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  text-align: center;

  &.main {
    background: var(--bg-glass-strong);
    border-color: var(--border-medium);
  }
}

.ov-big {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-light);
}

.ov-value {
  font-size: 28px;
  font-weight: 700;
  &.success { color: var(--success); }
  &.warning { color: var(--warning); }
  &.danger { color: var(--danger); }
}

.ov-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.ov-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

// Mastery bar
.mastery-bar-container {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 32px;
}

.mastery-bar {
  height: 12px;
  border-radius: 6px;
  background: var(--bg-glass);
  overflow: hidden;
  display: flex;
  margin-bottom: 12px;
}

.bar-segment {
  height: 100%;
  transition: width var(--transition-slow);
  &.known { background: var(--success); }
  &.partial { background: var(--warning); }
  &.unknown { background: var(--danger); opacity: 0.6; }
}

.bar-legend {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: var(--text-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  &.known { background: var(--success); }
  &.partial { background: var(--warning); }
  &.unknown { background: var(--danger); opacity: 0.6; }
}

// Category stats
.section-heading {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  margin-top: 8px;
}

.cat-stats {
  margin-bottom: 36px;
}

.cat-stat-row {
  padding: 14px 0;
  border-bottom: 1px solid var(--border-subtle);

  &:last-child { border-bottom: none; }
}

.cs-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;

  .cs-name { font-size: 14px; color: var(--text-primary); }
  .cs-pct { font-size: 13px; font-weight: 600; color: var(--success); }
}

.cs-bar {
  height: 6px;
  background: var(--bg-glass);
  border-radius: 3px;
  overflow: hidden;
}

.cs-fill {
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-slow);
  &.known { background: var(--success); }
}

.cs-detail {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.cs-partial {
  color: var(--warning);
}

// History
.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.hi-date {
  font-size: 12px;
  color: var(--text-muted);
  width: 130px;
  flex-shrink: 0;
}

.hi-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-glass);
  overflow: hidden;
  display: flex;
}

.hi-fill {
  height: 100%;
  &.known { background: var(--success); }
  &.partial { background: var(--warning); }
  &.unknown { background: var(--danger); opacity: 0.4; }
}

.hi-score {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  width: 40px;
  text-align: center;
}

.hi-pct {
  font-size: 12px;
  color: var(--success);
  width: 36px;
  text-align: right;
  font-weight: 600;
}

.clear-btn {
  font-size: 12px;
  color: var(--text-muted);
  background: none;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover { color: var(--danger); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
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

// ===== 移动端响应式 =====
@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .overview-card {
    padding: 14px;
  }

  .overview-value {
    font-size: 22px;
  }

  .category-stats {
    gap: 8px;
  }

  .cat-stat-row {
    padding: 10px 12px;
    font-size: 13px;
  }

  .mastery-dist {
    grid-template-columns: 1fr;
  }
}
</style>
