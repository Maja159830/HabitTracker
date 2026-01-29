<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/dashboard" class="logo">
          🎯 HabitTracker
        </router-link>
        
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-link">
            Dashboard
          </router-link>
          <router-link to="/habits" class="nav-link">
            My Habits
          </router-link>
        </div>
      </div>
      
      <div class="nav-right">
        <span class="username">Hi, {{ user?.username || 'User' }}</span>
        <button @click="logout" class="logout-btn">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'Navbar',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const user = computed(() => store.state.user)
    
    const logout = () => {
      store.dispatch('logout')
      router.push('/login')
    }
    
    return { user, logout }
  }
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.nav-link.router-link-active {
  color: #3b82f6;
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: #6b7280;
  font-size: 0.875rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn:hover {
  background: #fecaca;
}
</style>