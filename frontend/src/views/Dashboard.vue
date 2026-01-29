<template>
  <div class="dashboard">
    <div class="welcome-section">
      <h1>Welcome back, {{ user?.username || 'User' }}! 👋</h1>
      <p>Track your progress and build better habits every day.</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <p class="stat-label">Total Habits</p>
          <p class="stat-value">{{ totalHabits }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p class="stat-label">Completed Today</p>
          <p class="stat-value">{{ completedToday }}/{{ totalHabits }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <p class="stat-label">Current Streak</p>
          <p class="stat-value">0 days</p>
        </div>
      </div>
    </div>
    
    <div class="habits-section">
      <div class="section-header">
        <h2>Recent Habits</h2>
        <button @click="showCreateModal = true" class="btn-primary">
          + New Habit
        </button>
      </div>
      
      <div v-if="habits.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No habits yet. Create your first habit to get started!</p>
        <button @click="showCreateModal = true" class="btn-primary">
          Create First Habit
        </button>
      </div>
      
      <div v-else class="habits-list">
        <div v-for="habit in habits.slice(0, 5)" :key="habit.id || habit._id" class="habit-item">
          <div class="habit-header">
            <div>
              <h3>{{ habit.title }}</h3>
              <p class="habit-description">{{ habit.description }}</p>
            </div>
            <span class="habit-icon">{{ habit.icon || '📝' }}</span>
          </div>
          
          <div class="habit-footer">
            <span class="habit-category" :style="getCategoryStyle(habit.category)">
              {{ habit.category }}
            </span>
            <span class="habit-date">
              Created: {{ formatDate(habit.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- tworzenie nowego nawyku -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Create New Habit</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="createHabit" class="modal-form">
          <div class="form-group">
            <label for="habit-title">Habit Title *</label>
            <input
              id="habit-title"
              v-model="newHabit.title"
              type="text"
              required
              placeholder="e.g., Morning Exercise"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="habit-description">Description</label>
            <textarea
              id="habit-description"
              v-model="newHabit.description"
              placeholder="What do you want to achieve?"
              class="form-input"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="habit-category">Category</label>
            <select
              id="habit-category"
              v-model="newHabit.category"
              class="form-input"
            >
              <option value="health">Health</option>
              <option value="work">Work</option>
              <option value="learning">Learning</option>
              <option value="sport">Sport</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="habit-frequency">Frequency</label>
            <select
              id="habit-frequency"
              v-model="newHabit.frequency"
              class="form-input"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="habit-goal">Goal (times per day)</label>
            <input
              id="habit-goal"
              v-model.number="newHabit.goal"
              type="number"
              min="1"
              class="form-input"
            />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="!newHabit.title" class="btn-primary">
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- panel do debugowania -->
    <div v-if="user" class="debug-panel">
      <h3>Debug Panel</h3>
      
      <div class="debug-buttons">
        <button @click="testBackendConnection" class="debug-btn debug-btn-purple">
          Test Backend Connection
        </button>
        
        <button @click="testCreateHabit" class="debug-btn debug-btn-green">
          Test Create Habit
        </button>
        
        <button @click="handleLogout" class="debug-btn debug-btn-red">
          Logout
        </button>
      </div>
      
      <div class="debug-info">
        <p>User: {{ user?.username }} ({{ user?.email }})</p>
        <p>Token: {{ $store.state.token ? 'Present' : 'Missing' }}</p>
        <p>Habits: {{ habits.length }}</p>
        <p>Backend URL: http://localhost:5001/api</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Dashboard',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const showCreateModal = ref(false)
    const newHabit = ref({
      title: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      goal: 1
    })
    
    // właściwości obliczeniowe
    const user = computed(() => store.state.user)
    const habits = computed(() => store.state.habits)
    const totalHabits = computed(() => habits.value.length)
    const completedToday = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return habits.value.filter(habit => 
        habit.streaks?.some(streak => 
          new Date(streak.date).toISOString().split('T')[0] === today && streak.completed
        )
      ).length
    })
    
    // metody
    const getCategoryStyle = (category) => {
      const colors = {
        health: { bg: '#dcfce7', text: '#166534' },
        work: { bg: '#fef3c7', text: '#92400e' },
        learning: { bg: '#dbeafe', text: '#1e40af' },
        sport: { bg: '#fce7f3', text: '#9d174d' },
        other: { bg: '#f3f4f6', text: '#374151' }
      }
      const style = colors[category] || colors.other
      return {
        backgroundColor: style.bg,
        color: style.text
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      } catch (error) {
        return 'Invalid date'
      }
    }
    
    const closeModal = () => {
      showCreateModal.value = false
      newHabit.value = {
        title: '',
        description: '',
        category: 'health',
        frequency: 'daily',
        goal: 1
      }
    }
    
    const createHabit = async () => {
      try {
        console.log('🔄 Creating habit...', newHabit.value)
        
        // Walidacja
        if (!newHabit.value.title || newHabit.value.title.trim() === '') {
          alert('Please enter a habit title')
          return
        }
        
        // Sprawdź czy użytkownik jest zalogowany
        if (!store.getters.isAuthenticated) {
          alert('You need to be logged in to create a habit')
          router.push('/login')
          return
        }
        
        // Przygotuj dane do wysłania
        const habitData = {
          title: newHabit.value.title.trim(),
          description: newHabit.value.description.trim(),
          category: newHabit.value.category,
          frequency: newHabit.value.frequency,
          goal: parseInt(newHabit.value.goal) || 1
        }
        
        console.log('📤 Sending habit data:', habitData)
        
        // Wywołaj akcję store
        const result = await store.dispatch('createHabit', habitData)
        
        console.log('✅ Habit created successfully:', result)
        
        // Zamknij modal i wyczyść formularz
        closeModal()
        
        // Pokaż komunikat sukcesu
        alert('Habit created successfully!')
        
      } catch (error) {
        console.error('❌ Error creating habit:', error)
        
        // Przyjazny komunikat błędu
        let errorMessage = 'Failed to create habit'
        
        if (error.message) {
          errorMessage = error.message
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        
        alert(`Error: ${errorMessage}`)
        
        // Jeśli błąd autoryzacji, przekieruj do logowania
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          store.dispatch('logout')
          router.push('/login')
        }
      }
    }
    
    const testCreateHabit = async () => {
      try {
        console.log('🧪 Testing habit creation...')
        
        const testData = {
          title: 'Test Habit',
          description: 'This is a test habit',
          category: 'health',
          frequency: 'daily',
          goal: 1
        }
        
        const result = await store.dispatch('createHabit', testData)
        console.log('✅ Test successful:', result)
        alert('Test successful! Habit created.')
        
      } catch (error) {
        console.error('❌ Test failed:', error)
        alert(`Test failed: ${error.message}`)
      }
    }
    
    const testBackendConnection = async () => {
      try {
        console.log('🔗 Testing backend connection...')
        const result = await store.dispatch('testBackendConnection')
        console.log('✅ Backend connection successful:', result)
        alert('Backend is working!')
      } catch (error) {
        console.error('❌ Backend connection failed:', error)
        alert(`Cannot connect to backend: ${error.message}\n\nMake sure backend is running on port 5001.`)
      }
    }
    
    const handleLogout = () => {
      store.dispatch('logout')
      router.push('/login')
    }
    
    // Lifecycle
    onMounted(async () => {
      console.log('🏠 Dashboard mounted')
      console.log('User:', store.state.user)
      console.log('Is authenticated:', store.getters.isAuthenticated)
      console.log('Token exists:', !!store.state.token)
      
      if (store.getters.isAuthenticated) {
        try {
          console.log('🔄 Fetching habits...')
          await store.dispatch('fetchHabits')
          console.log(`✅ Loaded ${store.state.habits.length} habits`)
        } catch (error) {
          console.error('❌ Failed to fetch habits:', error)
          
          // Jeśli błąd autoryzacji, wyloguj
          if (error.message.includes('401') || error.message.includes('unauthorized')) {
            store.dispatch('logout')
            router.push('/login')
          }
        }
      } else {
        console.log('⚠️ Not authenticated, redirecting to login...')
        router.push('/login')
      }
    })
    
    return {
      user,
      habits,
      totalHabits,
      completedToday,
      showCreateModal,
      newHabit,
      getCategoryStyle,
      formatDate,
      closeModal,
      createHabit,
      testCreateHabit,
      testBackendConnection,
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.welcome-section h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.welcome-section p {
  opacity: 0.9;
  font-size: 1.1rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 10px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
}

.habits-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #1f2937;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.habit-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: border-color 0.2s;
}

.habit-item:hover {
  border-color: #3b82f6;
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.habit-header h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.habit-description {
  color: #6b7280;
  line-height: 1.5;
}

.habit-icon {
  font-size: 2rem;
}

.habit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.habit-category {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.habit-date {
  color: #9ca3af;
  font-size: 0.875rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-input {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.debug-panel {
  margin-top: 3rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.debug-panel h3 {
  color: #374151;
  margin-bottom: 1rem;
}

.debug-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.debug-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.debug-btn-purple {
  background: #8b5cf6;
  color: white;
}

.debug-btn-purple:hover {
  background: #7c3aed;
}

.debug-btn-green {
  background: #10b981;
  color: white;
}

.debug-btn-green:hover {
  background: #059669;
}

.debug-btn-red {
  background: #ef4444;
  color: white;
}

.debug-btn-red:hover {
  background: #dc2626;
}

.debug-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.debug-info p {
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .habit-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
  }
  
  .debug-buttons {
    flex-direction: column;
  }
  
  .debug-btn {
    width: 100%;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.loading::after {
  content: '';
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>