<template>
  <header class="topbar">
    <button class="mobile-menu-btn" @click="app.toggleMobileMenu" title="菜单">
      <span>{{ app.mobileMenuOpen ? '✕' : '☰' }}</span>
    </button>

    <div class="search-box" v-if="$route.name === 'browse'">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索面试题..."
        class="search-input"
        @input="onSearch"
      />
      <button v-if="searchText" class="search-clear" @click="clearSearch">✕</button>
    </div>

    <button class="back-nav" v-else-if="$route.name === 'question'" @click="$router.back()">
      <span class="back-arrow">←</span>
      <span class="back-label">返回列表</span>
    </button>

    <div class="topbar-title" v-else>
      <span>{{ pageTitle }}</span>
    </div>

    <div class="topbar-actions">
      <span class="time-badge">{{ currentTime }}</span>
      <div class="settings-wrap">
        <button class="settings-btn" @click="showSettings = !showSettings" title="设置">
          <span class="settings-icon" :class="{ spinning: showSettings }">⚙️</span>
        </button>
        <transition name="pop">
          <div class="settings-popover-wrap" v-if="showSettings">
            <SettingsPanel />
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import SettingsPanel from '@/components/SettingsPanel.vue'

const app = useAppStore()
const route = useRoute()
const searchText = ref(app.searchQuery)
const currentTime = ref('')
const showSettings = ref(false)

let timer: ReturnType<typeof setInterval>

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    quiz: '随机考试',
    stats: '学习统计',
    browse: '全部题目',
  }
  return map[route.name as string] || '面试题库'
})

function onSearch() {
  app.setSearch(searchText.value)
}

function clearSearch() {
  searchText.value = ''
  app.setSearch('')
}

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.topbar {
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
  backdrop-filter: blur(12px);
}

.search-box {
  flex: 1;
  max-width: 480px;
  display: flex;
  align-items: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  padding: 0 14px;
  transition: all var(--transition-fast);

  &:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
}

.search-icon {
  font-size: 14px;
  margin-right: 8px;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  height: 36px;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;

  &::placeholder {
    color: var(--text-muted);
  }
}

.search-clear {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-glass-strong);
  color: var(--text-muted);
  font-size: 11px;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--border-strong);
    color: var(--text-primary);
  }
}

.topbar-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-badge {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  padding: 4px 10px;
  background: var(--bg-glass);
  border-radius: var(--radius-sm);
}

.back-nav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-size: 13px;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-glass-strong);
    color: var(--accent-light);
  }
}

.back-arrow {
  font-size: 14px;
}

.back-label {
  font-weight: 500;
}

.settings-wrap {
  position: relative;
}

.settings-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-glass-strong);
  }
}

.settings-icon {
  font-size: 16px;
  transition: transform var(--transition-normal);

  &.spinning {
    animation: spin 0.8s ease;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
}

.settings-popover-wrap {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 200;
}

.pop-enter-active,
.pop-leave-active {
  transition: all var(--transition-normal);
  transform-origin: top right;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-size: 20px;
  margin-right: 8px;
  flex-shrink: 0;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: var(--bg-glass-strong);
    color: var(--accent-light);
  }
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .topbar {
    padding: 0 12px;
    gap: 8px;
  }

  .search-box {
    max-width: none;
    flex: 1;
    padding: 0 10px;
  }

  .search-input {
    height: 38px;
    font-size: 16px;
  }

  .time-badge {
    display: none;
  }

  .topbar-title {
    font-size: 15px;
  }

  .back-nav {
    padding: 8px 14px;
    font-size: 14px;
  }

  .topbar-actions {
    gap: 8px;
  }

  .settings-popover-wrap {
    right: -40px;
    width: 260px;
  }
}
</style>
