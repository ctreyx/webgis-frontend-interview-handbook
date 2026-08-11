<template>
  <div class="settings-popover">
    <!-- 主题选择 -->
    <div class="settings-section">
      <div class="settings-label">🎨 选择皮肤</div>
      <div class="theme-grid">
        <button
          v-for="t in app.THEMES"
          :key="t.key"
          class="theme-item"
          :class="{ active: app.theme === t.key }"
          @click="app.setTheme(t.key)"
        >
          <span class="theme-swatch" :style="{ background: swatchColor(t.key) }">
            <span class="theme-icon">{{ t.icon }}</span>
          </span>
          <span class="theme-name">{{ t.name }}</span>
        </button>
      </div>
      <div class="theme-desc">{{ activeTheme?.desc }}</div>
    </div>

    <div class="settings-divider"></div>

    <!-- 答案显示设置 -->
    <div class="settings-section">
      <div class="settings-label">⚙️ 答案显示</div>
      <div class="setting-row" @click="app.toggleShowAnswerDefault">
        <div class="setting-info">
          <span class="setting-name">默认显示答案</span>
          <span class="setting-desc">开启后，详情页答案直接显示；关闭则需手动点击「显示答案」</span>
        </div>
        <div class="switch" :class="{ on: app.showAnswerDefault }">
          <span class="switch-thumb"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

const app = useAppStore()

const activeTheme = computed(() =>
  app.THEMES.find(t => t.key === app.theme)
)

function swatchColor(key: string) {
  const map: Record<string, string> = {
    space: 'linear-gradient(135deg, #6366f1, #a855f7)',
    ocean: 'linear-gradient(135deg, #3b82f6, #38bdf8)',
    forest: 'linear-gradient(135deg, #22c55e, #4ade80)',
    sunset: 'linear-gradient(135deg, #f97316, #fb923c)',
    midnight: 'linear-gradient(135deg, #e879f9, #a855f7)',
  }
  return map[key] || map.space
}
</script>

<style lang="scss" scoped>
.settings-popover {
  width: 300px;
  padding: 16px;
}

.settings-section {
  margin-bottom: 8px;
}

.settings-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.theme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  background: none;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-card-hover);
  }

  &.active {
    background: var(--bg-glass-strong);
    outline: 1px solid var(--accent);
  }
}

.theme-swatch {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);

  .theme-item:hover & { transform: scale(1.08); }
}

.theme-icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
}

.theme-name {
  font-size: 11px;
  color: var(--text-secondary);
}

.theme-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 10px;
  text-align: center;
}

.settings-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 14px 0;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);

  &:hover { background: var(--bg-card-hover); }
}

.setting-info {
  flex: 1;
}

.setting-name {
  display: block;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.setting-desc {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.5;
}

.switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--bg-glass-strong);
  border: 1px solid var(--border-medium);
  position: relative;
  transition: all var(--transition-normal);
  flex-shrink: 0;

  &.on {
    background: var(--accent);
    border-color: var(--accent);
  }
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--transition-normal);
  box-shadow: var(--shadow-sm);

  .switch.on & {
    transform: translateX(20px);
  }
}
</style>
