<template>
  <aside class="sidebar" :class="{ collapsed: app.sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="logo" @click="$router.push('/')">
        <span class="logo-icon">🧠</span>
        <span class="logo-text" v-show="!app.sidebarCollapsed">面试题库</span>
      </div>
      <button
        class="sidebar-toggle"
        @click="app.toggleSidebar"
        :title="app.sidebarCollapsed ? '展开菜单' : '收起菜单'"
      >
        {{ app.sidebarCollapsed ? '☰' : '◁' }}
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.name === 'browse' }">
        <span class="nav-icon">📚</span>
        <span class="nav-label" v-show="!app.sidebarCollapsed">全部题目</span>
        <span class="nav-badge" v-show="!app.sidebarCollapsed">{{ questions.length }}</span>
      </router-link>
      <router-link to="/quiz" class="nav-item" :class="{ active: $route.name === 'quiz' }">
        <span class="nav-icon">🎯</span>
        <span class="nav-label" v-show="!app.sidebarCollapsed">随机考试</span>
      </router-link>
      <router-link to="/stats" class="nav-item" :class="{ active: $route.name === 'stats' }">
        <span class="nav-icon">📊</span>
        <span class="nav-label" v-show="!app.sidebarCollapsed">学习统计</span>
      </router-link>
    </nav>

    <div class="sidebar-divider" v-show="!app.sidebarCollapsed"></div>

    <div class="sidebar-categories" v-show="!app.sidebarCollapsed">
      <div class="cat-title">分类</div>
      <div
        v-for="cat in app.categories"
        :key="cat.key"
        class="cat-group"
        :class="{ expanded: expandedCats.has(cat.key) }"
      >
        <button
          class="cat-item"
          :class="{ active: expandedCats.has(cat.key) }"
          @click="toggleCat(cat.key)"
        >
          <span class="cat-arrow">{{ expandedCats.has(cat.key) ? '▾' : '▸' }}</span>
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-count">{{ cat.count }}</span>
        </button>
        <div class="cat-questions" v-show="expandedCats.has(cat.key)">
          <router-link
            v-for="q in getCatQuestions(cat.key)"
            :key="q.id"
            :to="`/question/${encodeURIComponent(q.id)}`"
            class="cat-question-item"
          >
            {{ q.title }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="sidebar-footer" v-show="!app.sidebarCollapsed">
      <div class="footer-item">
        <span class="footer-icon">📝</span>
        <span>{{ questions.length }} 道面试题</span>
      </div>
      <div class="footer-item">
        <span class="footer-icon">📁</span>
        <span>{{ app.categories.length }} 个分类</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { questions } from '@/data/questions'
import { useRouter } from 'vue-router'

const app = useAppStore()
const router = useRouter()

// 记录哪些分类展开了
const expandedCats = ref(new Set<string>())

function toggleCat(key: string) {
  const next = new Set(expandedCats.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  expandedCats.value = next
}

function getCatQuestions(catKey: string) {
  return questions.filter(q => q.category === catKey)
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width var(--transition-normal), transform var(--transition-normal);
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  padding: 16px 16px 12px;
  height: var(--topbar-height);
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-size: 12px;
  margin-left: auto;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-glass-strong);
    color: var(--accent-light);
  }
}

.sidebar-nav {
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  font-size: 14px;
  text-decoration: none;

  &:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--bg-glass-strong);
    color: var(--accent-light);
    font-weight: 500;
  }
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
}

.nav-badge {
  font-size: 12px;
  padding: 2px 7px;
  border-radius: 10px;
  background: var(--bg-glass);
  color: var(--text-muted);
}

.sidebar-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 8px 16px;
}

.sidebar-categories {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

.cat-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  padding: 8px 12px 6px;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  background: none;
  transition: all var(--transition-fast);
  text-align: left;

  &:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--bg-glass-strong);
    color: var(--accent-light);
  }
}

.cat-arrow {
  font-size: 10px;
  width: 14px;
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.cat-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-count {
  font-size: 11px;
  color: var(--text-muted);
}

.cat-group {
  margin-bottom: 2px;
}

.cat-questions {
  padding: 2px 0 2px 26px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.cat-question-item {
  display: block;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: none;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }

  &.router-link-active {
    color: var(--accent-light);
    background: var(--bg-glass);
  }
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-item {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-icon {
  font-size: 13px;
}
</style>
