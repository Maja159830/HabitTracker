import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }  // Dodaj to!
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('../views/Habits.vue'),
    meta: { requiresAuth: true }  // Dodaj to!
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  console.log('🛡️ Router guard - navigating from', from.path, 'to', to.path)
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('token') // Lub z Vuex
  
  console.log('Requires auth?', requiresAuth)
  console.log('Is authenticated?', !!isAuthenticated)
  
  if (requiresAuth && !isAuthenticated) {
    console.log('🔐 Redirecting to login - not authenticated')
    next('/login')
  } else {
    console.log('✅ Access granted')
    next()
  }
})

export default router