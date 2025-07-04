<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <router-link to="/" class="flex justify-center">
        <h1 class="text-3xl font-bold text-primary-600">Syntagma</h1>
      </router-link>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Anmelden
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Melden Sie sich an, um auf das Administrations-Cockpit zuzugreifen
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Benutzername oder E-Mail
            </label>
            <div class="mt-1">
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                required
                class="input"
                :class="{ 'border-red-300': errors.username }"
                placeholder="Benutzername oder E-Mail eingeben"
              >
            </div>
            <p v-if="errors.username" class="mt-2 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Passwort
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                required
                class="input"
                :class="{ 'border-red-300': errors.password }"
                placeholder="Passwort eingeben"
              >
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="loginError" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Anmeldung fehlgeschlagen
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ loginError }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="btn-primary w-full justify-center"
            >
              <svg
                v-if="authStore.isLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ authStore.isLoading ? 'Anmelden...' : 'Anmelden' }}
            </button>
          </div>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Demo-Zugangsdaten</span>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3">
            <div class="bg-gray-50 p-3 rounded-md">
              <p class="text-xs font-medium text-gray-700 mb-1">Administrator:</p>
              <p class="text-sm text-gray-600">Benutzer: <code class="bg-gray-200 px-1 rounded">admin</code></p>
              <p class="text-sm text-gray-600">Passwort: <code class="bg-gray-200 px-1 rounded">admin123</code></p>
            </div>
            <div class="bg-gray-50 p-3 rounded-md">
              <p class="text-xs font-medium text-gray-700 mb-1">Standard-Benutzer:</p>
              <p class="text-sm text-gray-600">Benutzer: <code class="bg-gray-200 px-1 rounded">testuser</code></p>
              <p class="text-sm text-gray-600">Passwort: <code class="bg-gray-200 px-1 rounded">user123</code></p>
            </div>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="mt-6 text-center">
          <router-link
            to="/"
            class="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            ← Zurück zur Startseite
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const loginError = ref('')

async function handleLogin() {
  // Reset errors
  errors.username = ''
  errors.password = ''
  loginError.value = ''

  // Validate form
  if (!form.username.trim()) {
    errors.username = 'Benutzername ist erforderlich'
    return
  }

  if (!form.password.trim()) {
    errors.password = 'Passwort ist erforderlich'
    return
  }

  // Attempt login
  const result = await authStore.login(form.username, form.password)

  if (result.success) {
    // Redirect based on role
    const redirectPath = router.currentRoute.value.query.redirect as string
    
    if (redirectPath) {
      await router.push(redirectPath)
    } else if (authStore.isAdmin) {
      await router.push({ name: 'Dashboard' })
    } else {
      await router.push({ name: 'Welcome' })
    }
  } else {
    loginError.value = result.error || 'Anmeldung fehlgeschlagen'
  }
}
</script>
