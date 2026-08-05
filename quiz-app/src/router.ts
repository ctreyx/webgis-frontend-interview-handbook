import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'browse',
      component: () => import('@/views/BrowseView.vue'),
    },
    {
      path: '/question/:id',
      name: 'question',
      component: () => import('@/views/QuestionDetail.vue'),
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('@/views/QuizView.vue'),
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
    },
  ],
})

export default router
