<template>
  <div class="habits-page">
    <div class="page-header">
      <h1>My Habits</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + New Habit
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      Loading habits...
    </div>
    
    <div v-else-if="habits.length === 0" class="empty-state">
      <p>📝 No habits yet. Create your first habit!</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Create First Habit
      </button>
    </div>
    
    <div v-else class="habits-grid">
      <div v-for="habit in habits" :key="habit.id || habit._id" class="habit-card">
        <div class="habit-header">
          <h3>{{ habit.title }}</h3>
          <span class="habit-icon">{{ habit.icon || '📝' }}</span>
        </div>
        
        <p class="habit-description">{{ habit.description }}</p>
        
        <div class="habit-meta">
          <span class="habit-category" :style="{ backgroundColor: getCategoryColor(habit.category) }">
            {{ habit.category }}
          </span>
          <span class="habit-frequency">Goal: {{ habit.goal || 1 }}/day</span>
        </div>
        
        <div class="habit-actions">
          <button @click="toggleHabit(habit)" class="btn btn-small">
            {{ isCompletedToday(habit) ? '✅ Done' : 'Mark Done' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- tworzenie nowego nawyku -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Create New Habit</h3>
          <button @click="showCreateModal = false" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="createHabit" class="modal-form">
          <div class="form-group">
            <label>Habit Title *</label>
            <input v-model="newHabit.title" required class="form-input" />
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newHabit.description" class="form-input"></textarea>
          </div>
          
          <div class="form-group">
            <label>Category</label>
            <select v-model="newHabit.category" class="form-input">
              <option value="health">Health</option>
              <option value="work">Work</option>
              <option value="learning">Learning</option>
              <option value="sport">Sport</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Habits',
  setup() {
    const store = useStore()
    
    const showCreateModal = ref(false)
    const newHabit = ref({
      title: '',
      description: '',
      category: 'health',
      goal: 1
    })
    
    const habits = computed(() => store.state.habits)
    const loading = computed(() => store.state.loading)
    
    const getCategoryColor = (category) => {
      const colors = {
        health: '#dcfce7',
        work: '#fef3c7',
        learning: '#dbeafe',
        sport: '#fce7f3',
        other: '#f3f4f6'
      }
      return colors[category] || '#f3f4f6'
    }
    
    const isCompletedToday = (habit) => {
      const today = new Date().toISOString().split('T')[0]
      return habit.streaks?.some(s => 
        new Date(s.date).toISOString().split('T')[0] === today && s.completed
      )
    }
    
    const toggleHabit = async (habit) => {
      const habitId = habit.id || habit._id
      const today = new Date().toISOString().split('T')[0]
      const completed = !isCompletedToday(habit)
      
      try {
        await store.dispatch('trackHabit', {
          id: habitId,
          date: today,
          completed
        })
      } catch (error) {
        alert('Failed to update habit: ' + error)
      }
    }
    
    const createHabit = async () => {
      try {
        await store.dispatch('createHabit', newHabit.value)
        showCreateModal.value = false
        newHabit.value = { title: '', description: '', category: 'health', goal: 1 }
      } catch (error) {
        alert('Failed to create habit: ' + error)
      }
    }
    
    onMounted(async () => {
      await store.dispatch('fetchHabits')
    })
    
    return {
      habits,
      loading,
      showCreateModal,
      newHabit,
      getCategoryColor,
      isCompletedToday,
      toggleHabit,
      createHabit
    }
  }
}
</script>

<style scoped>
.habits-page {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  color: #1f2937;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 2px dashed #d1d5db;
}

.empty-state p {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.habits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.habit-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.habit-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
  margin: 0;
}

.habit-icon {
  font-size: 1.5rem;
}

.habit-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.habit-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.habit-category {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1f2937;
}

.habit-frequency {
  font-size: 0.875rem;
  color: #6b7280;
}

.habit-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
}

.modal-form {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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
  border-radius: 5px;
  font-size: 1rem;
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
</style>
<template>
  <div style="padding: 2rem;">
    <h1 style="color: #3b82f6;">My Habits</h1>
    <p style="color: #666; margin: 1rem 0;">Manage your daily habits</p>
    
    <div style="margin: 1rem 0;">
      <button style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 1rem;">
        + Add Habit
      </button>
      <router-link 
        to="/dashboard" 
        style="padding: 0.5rem 1rem; background: #6b7280; color: white; text-decoration: none; border-radius: 5px;"
      >
        Back to Dashboard
      </router-link>
    </div>
    
    <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
      <p style="color: #9ca3af;">No habits yet. Create your first habit!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Habits'
}
</script>