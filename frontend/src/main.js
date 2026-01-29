import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/main.css'

// Utwórz aplikację Vue
const app = createApp(App)

// Użyj pluginów
app.use(router)
app.use(store)

// Mount aplikacji
app.mount('#app')

console.log('🚀 Vue app started!')
console.log('Router installed:', !!app.config.globalProperties.$router)
console.log('Store installed:', !!app.config.globalProperties.$store)