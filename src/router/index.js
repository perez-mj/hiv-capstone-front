// /src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', name: 'Login', component: () => import('@/pages/Login.vue') },
      { path: 'register', name: 'Register', component: () => import('@/pages/Register.vue') }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/pages/admin/Dashboard.vue') },
      { path: 'patients', name: 'Patients', component: () => import('@/pages/admin/Patients.vue') },
      {path: '/enroll',name: 'enroll', component: () => import('@/pages/admin/Enrollment.vue'), meta: { requiresAuth: true }},
      {
        path: 'settings',
        component: () => import('@/pages/admin/settings/SettingsLayout.vue'),
        children: [
          { path: '', redirect: 'profile' },
          { path: 'profile', name: 'Profile', component: () => import('@/pages/admin/settings/Profile.vue') },
          { path: 'security', name: 'Security', component: () => import('@/pages/admin/settings/Security.vue') },
          { path: 'notifications', name: 'Notifications', component: () => import('@/pages/admin/settings/Notifications.vue') },
          { path: 'system', name: 'System', component: () => import('@/pages/admin/settings/System.vue') }
        ]
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // \u2705 FIX: Add proper auth checking
  const isAuthenticated = authStore.isAuthenticated && authStore.token
  
  console.log('\U0001f6e1\ufe0f Route guard:', { 
    to: to.path, 
    requiresAuth: to.meta.requiresAuth,
    isAuthenticated 
  })
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('\U0001f512 Redirecting to login - not authenticated')
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated) {
    console.log('\u27a1\ufe0f Redirecting to dashboard - already authenticated')
    next('/admin/dashboard')
  } else {
    console.log('\u2705 Allowing navigation to:', to.path)
    next()
  }
})

export default router
