import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import axios from 'axios'
import './style.css'
import App from './App.vue'

// Axios Base URL konfigurieren
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Axios Response Interceptor für Fehlerbehandlung
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token ungültig, Benutzer ausloggen
      localStorage.removeItem('syntagma_token')
      delete axios.defaults.headers.common['Authorization']
      
      // Zur Login-Seite weiterleiten falls nicht bereits dort
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
