import { createStore } from 'vuex'
import axios from 'axios'

// KONFIGURACJA AXIOS
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000, // 10 sekund timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// INTERCEPTORY

// Request interceptor - dodaje token do każdego requestu
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      data: config.data || 'no data'
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token added to headers')
    } else {
      console.log('⚠️ No token found in localStorage')
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - obsługa błędów
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response [${response.status}]:`, {
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      responseData: error.response?.data
    })
    
    // Obsługa typowych błędów
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.log('🔐 401 Unauthorized - clearing auth data')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          
          // Tylko przekieruj jeśli nie jesteśmy na stronie logowania
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
          break
          
        case 400:
          console.log('⚠️ 400 Bad Request')
          break
          
        case 404:
          console.log('🔍 404 Not Found')
          break
          
        case 500:
          console.log('🔥 500 Server Error')
          break
          
        default:
          console.log(`📡 ${error.response.status} Error`)
      }
    } else if (error.request) {
      // Request wysłany ale nie ma odpowiedzi
      console.error('📡 Network Error - no response received:', error.request)
    } else {
      // Inny błąd
      console.error('⚡ Request Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// VUEX STORE
export default createStore({
  state: {
    // autentyfikacja
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    
    habits: [],
    
    loading: false,
    error: null
  },
  
  mutations: {
    // AUTH MUTATIONS
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
        console.log('💾 Token saved to localStorage')
      } else {
        localStorage.removeItem('token')
        console.log('🗑️ Token removed from localStorage')
      }
    },
    
    SET_USER(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        console.log('💾 User saved to localStorage:', user.username)
      } else {
        localStorage.removeItem('user')
        console.log('🗑️ User removed from localStorage')
      }
    },
    
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
      state.habits = []
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      console.log('🧹 All auth data cleared')
    },
    
    // HABITS MUTATIONS
    SET_HABITS(state, habits) {
      state.habits = habits
      console.log(`📋 ${habits.length} habits loaded to store`)
    },
    
    ADD_HABIT(state, habit) {
      state.habits.unshift(habit)
      console.log('➕ Habit added to store:', habit.title)
    },
    
    UPDATE_HABIT(state, updatedHabit) {
      const index = state.habits.findIndex(h => 
        h._id === updatedHabit._id || h.id === updatedHabit.id
      )
      if (index !== -1) {
        state.habits.splice(index, 1, updatedHabit)
        console.log('✏️ Habit updated in store:', updatedHabit.title)
      }
    },
    
    DELETE_HABIT(state, habitId) {
      const initialLength = state.habits.length
      state.habits = state.habits.filter(h => 
        h._id !== habitId && h.id !== habitId
      )
      if (state.habits.length < initialLength) {
        console.log('🗑️ Habit deleted from store:', habitId)
      }
    },
    
    // UI MUTATIONS
    SET_LOADING(state, loading) {
      state.loading = loading
      console.log(loading ? '⏳ Loading started' : '✅ Loading finished')
    },
    
    SET_ERROR(state, error) {
      state.error = error
      if (error) {
        console.error('❌ Error set in store:', error)
      }
    },
    
    CLEAR_ERROR(state) {
      state.error = null
      console.log('🧹 Error cleared from store')
    }
  },
  
  actions: {
    // AUTH ACTIONS
    
    async login({ commit, dispatch }, credentials) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        console.log('🔐 Attempting login with email:', credentials.email)
        
        // Wysłanie requestu do backendu
        const response = await api.post('/auth/login', credentials)
        
        const { token, user } = response.data
        
        if (!token || !user) {
          throw new Error('Invalid response from server')
        }
        
        // Zapis w store i localStorage
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        
        console.log('✅ Login successful! User:', user.username)
        
        // Pobierz nawyki użytkownika
        await dispatch('fetchHabits')
        
        return {
          success: true,
          token,
          user
        }
        
      } catch (error) {
        // Szczegółowa obsługa błędów
        let errorMessage = 'Login failed'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check if backend is running.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Server might be busy.'
        }
        
        console.error('❌ Login error:', errorMessage)
        commit('SET_ERROR', errorMessage)
        
        throw new Error(errorMessage)
        
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        console.log('📝 Attempting registration for:', userData.email)
        
        // Walidacja po stronie frontendu
        if (!userData.username || !userData.email || !userData.password) {
          throw new Error('Please fill in all fields')
        }
        
        if (userData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        
        // Wysłanie requestu do backendu
        const response = await api.post('/auth/register', userData)
        
        const { token, user } = response.data
        
        if (!token || !user) {
          throw new Error('Invalid response from server')
        }
        
        // Zapis w store i localStorage
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        
        console.log('✅ Registration successful! User:', user.username)
        
        return {
          success: true,
          token,
          user
        }
        
      } catch (error) {
        let errorMessage = 'Registration failed'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check if backend is running.'
        }
        
        console.error('❌ Registration error:', errorMessage)
        commit('SET_ERROR', errorMessage)
        
        throw new Error(errorMessage)
        
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    logout({ commit }) {
      console.log('👋 Logging out user...')
      commit('CLEAR_AUTH')
    },
    
    // ========== HABITS ACTIONS ==========
    
    async fetchHabits({ commit, state }) {
      try {
        // Jeśli użytkownik nie jest zalogowany, nie pobieraj
        if (!state.token) {
          console.log('⚠️ Not authenticated, skipping habits fetch')
          commit('SET_HABITS', [])
          return []
        }
        
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        console.log('🔄 Fetching habits from backend...')
        
        // Pobierz nawyki z backendu
        const response = await api.get('/habits')
        
        const habits = response.data.data || response.data || []
        
        // Zapisz w store
        commit('SET_HABITS', habits)
        
        console.log(`✅ Successfully fetched ${habits.length} habits`)
        
        return habits
        
      } catch (error) {
        let errorMessage = 'Failed to fetch habits'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Make sure backend is running on port 5001.'
        }
        
        console.error('❌ Fetch habits error:', errorMessage)
        commit('SET_ERROR', errorMessage)
        
        // W przypadku błędu 401 (unauthorized) wyczyść auth
        if (error.response?.status === 401) {
          console.log('🔐 401 received, clearing auth data')
          commit('CLEAR_AUTH')
        }
        
        throw new Error(errorMessage)
        
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createHabit({ commit, state }, habitData) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        console.log('➕ Creating new habit:', habitData.title)
        
        // Walidacja frontend
        if (!habitData.title || habitData.title.trim() === '') {
          throw new Error('Habit title is required')
        }
        
        // Wyślij do backendu
        const response = await api.post('/habits', habitData)
        
        const habit = response.data.data || response.data
        
        if (!habit) {
          throw new Error('Invalid response from server')
        }
        
        // Dodaj do store
        commit('ADD_HABIT', habit)
        
        console.log('✅ Habit created successfully:', habit.title)
        
        return {
          success: true,
          data: habit,
          message: 'Habit created successfully!'
        }
        
      } catch (error) {
        let errorMessage = 'Failed to create habit'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check your connection.'
        }
        
        console.error('❌ Create habit error:', {
          message: errorMessage,
          details: error.response?.data
        })
        
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
        
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateHabit({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        console.log(`✏️ Updating habit ${id} with data:`, data)
        
        // Wyślij update do backendu
        const response = await api.put(`/habits/${id}`, data)
        
        const updatedHabit = response.data.data || response.data
        
        // Aktualizuj w store
        commit('UPDATE_HABIT', updatedHabit)
        
        console.log('✅ Habit updated successfully:', updatedHabit.title)
        
        return {
          success: true,
          data: updatedHabit
        }
        
      } catch (error) {
        let errorMessage = 'Failed to update habit'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        console.error('❌ Update habit error:', errorMessage)
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
        
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteHabit({ commit }, habitId) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        console.log(`🗑️ Deleting habit: ${habitId}`)
        
        // Usuń z backendu
        await api.delete(`/habits/${habitId}`)
        
        // Usuń z store
        commit('DELETE_HABIT', habitId)
        
        console.log('✅ Habit deleted successfully')
        
        return {
          success: true,
          message: 'Habit deleted successfully'
        }
        
      } catch (error) {
        let errorMessage = 'Failed to delete habit'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        console.error('❌ Delete habit error:', errorMessage)
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
        
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async trackHabit({ commit }, { id, date, completed }) {
      try {
        console.log(`📝 Tracking habit ${id}:`, { date, completed })
        
        // Domyślna data to dzisiaj
        const trackDate = date || new Date().toISOString().split('T')[0]
        const trackCompleted = completed !== undefined ? completed : true
        
        // Wyślij do backendu
        const response = await api.post(`/habits/${id}/track`, {
          date: trackDate,
          completed: trackCompleted
        })
        
        const updatedHabit = response.data.data || response.data
        
        // Aktualizuj w store
        commit('UPDATE_HABIT', updatedHabit)
        
        console.log('✅ Habit tracked successfully')
        
        return {
          success: true,
          data: updatedHabit,
          message: 'Habit updated'
        }
        
      } catch (error) {
        let errorMessage = 'Failed to track habit'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        console.error('❌ Track habit error:', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    // ========== DEBUG/UTILITY ACTIONS ==========
    
    async testBackendConnection({ commit }) {
      try {
        commit('SET_LOADING', true)
        
        console.log('🔧 Testing backend connection...')
        
        const response = await api.get('/health')
        
        console.log('✅ Backend connection successful:', response.data)
        
        return {
          success: true,
          data: response.data
        }
        
      } catch (error) {
        console.error('❌ Backend connection failed:', error.message)
        throw new Error('Cannot connect to backend. Make sure it is running on port 5001.')
        
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  },
  
  getters: {
    // ========== AUTH GETTERS ==========
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    
    // ========== HABITS GETTERS ==========
    userHabits: state => state.habits,
    totalHabits: state => state.habits.length,
    
    getHabitById: state => id => {
      return state.habits.find(h => h._id === id || h.id === id)
    },
    
    // ========== STATS GETTERS ==========
    completedToday: state => {
      const today = new Date().toISOString().split('T')[0]
      return state.habits.filter(habit => {
        return habit.streaks?.some(streak => {
          const streakDate = new Date(streak.date).toISOString().split('T')[0]
          return streakDate === today && streak.completed === true
        })
      }).length
    },
    
    currentStreak: state => {
      if (state.habits.length === 0) return 0
      
      let longestStreak = 0
      
      state.habits.forEach(habit => {
        if (habit.streaks && habit.streaks.length > 0) {
          const sortedStreaks = [...habit.streaks]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .filter(s => s.completed)
          
          let currentStreak = 0
          let lastDate = null
          
          for (const streak of sortedStreaks) {
            const currentDate = new Date(streak.date)
            
            if (!lastDate || 
                (lastDate.getTime() - currentDate.getTime()) === 86400000) { // 1 dzień
              currentStreak++
            } else {
              break
            }
            
            lastDate = currentDate
          }
          
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak
          }
        }
      })
      
      return longestStreak
    },
    
    habitsByCategory: state => {
      const categories = {}
      state.habits.forEach(habit => {
        const category = habit.category || 'other'
        if (!categories[category]) {
          categories[category] = []
        }
        categories[category].push(habit)
      })
      return categories
    },
    
    categoryStats: state => {
      const stats = {}
      state.habits.forEach(habit => {
        const category = habit.category || 'other'
        stats[category] = (stats[category] || 0) + 1
      })
      return stats
    },
    
    // ========== UI GETTERS ==========
    isLoading: state => state.loading,
    errorMessage: state => state.error,
    
    // ========== UTILITY GETTERS ==========
    today: () => new Date().toISOString().split('T')[0],
    
    last7Days: () => {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        days.push(date.toISOString().split('T')[0])
      }
      return days
    }
  }
})