<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content" :class="{ 'sidebar-collapsed': app.sidebarCollapsed }">
      <TopBar />
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore'
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'

const app = useAppStore()
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal);
  min-width: 0;

  &.sidebar-collapsed {
    margin-left: 64px;
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px 32px;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
