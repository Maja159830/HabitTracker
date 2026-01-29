<template>
  <div class="login-page">
    <div class="login-card">
      <h1>HabitTracker Login</h1>
      <p class="subtitle">Sign in to your account</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            placeholder="test@example.com"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            placeholder="password123"
            class="form-input"
          />
        </div>
        
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Logging in...' : 'Sign In' }}
        </button>
        
        <div class="form-footer">
          <p>Don't have an account? <router-link to="/register">Register</router-link></p>
        </div>
      </form>
      
      <div class="debug-info">
        <h4>Debug:</h4>
        <p>Email: {{ email }}</p>
        <p>Backend: http://localhost:5001/api</p>
        <button @click="testBackend" class="btn btn-small">
          Test Backend Connection
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const email = ref('test@example.com')
    const password = ref('password123')
    const loading = ref(false)
    const error = ref('')
    
    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''
        
        console.log('🔐 Attempting login...')
        console.log('Email:', email.value)
        console.log('Is router available?', !!router)
        console.log('Is store available?', !!store)
        
        // Walidacja
        if (!email.value || !password.value) {
          error.value = 'Please enter email and password'
          return
        }
        
        // Wywołaj akcję Vuex
        const credentials = {
          email: email.value,
          password: password.value
        }
        
        console.log('📤 Sending login request:', credentials)
        
        const result = await store.dispatch('login', credentials)
        
        console.log('✅ Login successful! Result:', result)
        console.log('Token in store:', store.state.token)
        console.log('User in store:', store.state.user)
        console.log('Is authenticated?', store.getters.isAuthenticated)
        
        // Sprawdź localStorage
        console.log('LocalStorage token:', localStorage.getItem('token'))
        console.log('LocalStorage user:', localStorage.getItem('user'))
        
        // Przekieruj do dashboard
        console.log('🔄 Redirecting to dashboard...')
        router.push('/dashboard')
        
      } catch (err) {
        console.error('❌ Login error:', err)
        error.value = err.message || 'Login failed. Please check your credentials.'
        
        // Test: spróbuj przejść do dashboard mimo błędu
        console.log('⚠️ Trying to navigate to dashboard anyway...')
        router.push('/dashboard')
      } finally {
        loading.value = false
      }
    }
    
    const testBackend = async () => {
      try {
        console.log('🔧 Testing backend connection...')
        const response = await fetch('http://localhost:5001/api/health')
        const data = await response.json()
        console.log('✅ Backend health:', data)
        alert(`Backend is working!\nStatus: ${data.status}\nMessage: ${data.message}`)
      } catch (err) {
        console.error('❌ Backend test failed:', err)
        alert('Cannot connect to backend. Make sure it is running on port 5001.')
      }
    }
    
    return {
      email,
      password,
      loading,
      error,
      handleLogin,
      testBackend
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  width: auto;
  margin-top: 0.5rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 0.875rem;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer p {
  color: #6b7280;
  font-size: 0.875rem;
}

.form-footer a {
  color: #3b82f6;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 5px;
  font-size: 0.875rem;
}

.debug-info h4 {
  margin-top: 0;
  color: #374151;
}

.debug-info p {
  margin: 0.25rem 0;
  color: #6b7280;
}
</style>