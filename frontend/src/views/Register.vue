<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Create Account</h1>
      <p class="subtitle">Join HabitTracker today</p>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="username">Username</label>
          <input
            v-model="form.username"
            id="username"
            type="text"
            required
            placeholder="johndoe"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            v-model="form.email"
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            v-model="form.password"
            id="password"
            type="password"
            required
            placeholder="••••••••"
            class="form-input"
          />
          <small>Minimum 6 characters</small>
        </div>
        
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
        
        <div class="form-footer">
          <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
        </div>
      </form>
      
      <!-- Debug panel -->
      <div v-if="debug" class="debug-panel">
        <h4>Debug Info:</h4>
        <p>Username: {{ form.username }}</p>
        <p>Email: {{ form.email }}</p>
        <p>Backend URL: http://localhost:5001/api</p>
        
        <div class="debug-buttons">
          <button @click="testBackendConnection" class="btn btn-small btn-secondary">
            Test Backend
          </button>
          <button @click="autoFillTestData" class="btn btn-small btn-secondary">
            Auto-fill Test Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const form = ref({
      username: '',
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')
    const debug = ref(true)
    
    const handleRegister = async () => {
      try {
        loading.value = true
        error.value = ''
        
        console.log('📝 Attempting registration...')
        console.log('Form data:', form.value)
        
        // Walidacja frontend
        if (!form.value.username || !form.value.email || !form.value.password) {
          error.value = 'Please fill in all fields'
          return
        }
        
        if (form.value.password.length < 6) {
          error.value = 'Password must be at least 6 characters'
          return
        }
        
        // Wywołaj akcję Vuex
        const result = await store.dispatch('register', form.value)
        
        console.log('✅ Registration successful! Result:', result)
        console.log('Token in store:', store.state.token)
        console.log('User in store:', store.state.user)
        
        // Sprawdź localStorage
        console.log('LocalStorage token:', localStorage.getItem('token'))
        console.log('LocalStorage user:', localStorage.getItem('user'))
        
        // Pokaż komunikat sukcesu
        alert('Account created successfully! You are now logged in.')
        
        // Przekieruj do dashboard
        console.log('🔄 Redirecting to dashboard...')
        router.push('/dashboard')
        
      } catch (err) {
        console.error('❌ Registration error:', err)
        error.value = err.message || 'Registration failed. Please try again.'
        
        // Jeśli błąd sieci, sprawdź backend
        if (err.message.includes('Network Error') || err.message.includes('Cannot connect')) {
          error.value = 'Cannot connect to server. Make sure backend is running on port 5001.'
        }
        
        // Test: spróbuj przejść mimo błędu
        console.log('⚠️ Testing navigation anyway...')
        // router.push('/dashboard')
      } finally {
        loading.value = false
      }
    }
    
    const testBackendConnection = async () => {
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
    
    const autoFillTestData = () => {
      form.value = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }
      console.log('✅ Test data auto-filled')
    }
    
    return {
      form,
      loading,
      error,
      debug,
      handleRegister,
      testBackendConnection,
      autoFillTestData
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
}

.register-card h1 {
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

.register-form {
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

.form-group small {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
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

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 0.875rem;
  text-align: center;
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

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  width: auto;
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

/* Debug Panel */
.debug-panel {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 5px;
  border: 1px dashed #d1d5db;
}

.debug-panel h4 {
  margin-top: 0;
  color: #374151;
  font-size: 0.875rem;
}

.debug-panel p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.75rem;
}

.debug-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .register-card {
    padding: 2rem;
  }
  
  .debug-buttons {
    flex-direction: column;
  }
  
  .btn-small {
    width: 100%;
  }
}
</style>