import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('syntagma_token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Axios Interceptor für Token
  if (token.value) {
    setAuthHeader(token.value)
  }

  function setAuthHeader(authToken: string) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  function removeAuthHeader() {
    delete axios.defaults.headers.common['Authorization']
  }

  async function login(username: string, password: string) {
    isLoading.value = true
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      })

      const { token: authToken, user: userData } = response.data
      
      token.value = authToken
      user.value = userData
      
      localStorage.setItem('syntagma_token', authToken)
      setAuthHeader(authToken)
      
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Anmeldung fehlgeschlagen'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function validateToken() {
    if (!token.value) return false

    try {
      const response = await axios.get('/api/auth/validate')
      user.value = response.data.user
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('syntagma_token')
    removeAuthHeader()
  }

  async function register(userData: {
    username: string
    email: string
    password: string
    role?: 'admin' | 'user'
  }) {
    isLoading.value = true
    try {
      await axios.post('/api/auth/register', userData)
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registrierung fehlgeschlagen'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    validateToken,
    register
  }
})
