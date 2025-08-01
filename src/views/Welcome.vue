<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <!-- Hero Content -->
          <main class="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
            <div class="sm:text-center lg:text-left">
              <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span class="block xl:inline">Regelwerke</span>
                <span class="block text-blue-600 xl:inline">zentral verwalten</span>
              </h1>
              <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Syntagma ist Ihre zentrale Plattform zur Zusammenführung, schnellen Dokumentation und transparenten Darstellung von Regelwerken für Datenschutz, IT-Sicherheit und Dienstvereinbarungen.
              </p>
              
              <!-- Quick Search Section -->
              <div class="mt-6 sm:mt-8">
                <div class="relative max-w-xl mx-auto lg:mx-0">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Regelwerk suchen... (z.B. Datenschutz, IT-Sicherheit, Arbeitszeit)"
                    class="block w-full pl-12 pr-32 py-4 border border-gray-300 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base placeholder-gray-500"
                    @keyup.enter="performSearch"
                  >
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                      @click="performSearch"
                      :disabled="!searchQuery.trim()"
                      class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Suchen
                    </button>
                  </div>
                </div>
                <p class="mt-3 text-sm text-gray-500 text-center lg:text-left">
                  <span class="font-medium">Sofortige Suche:</span> Durchsuchen Sie alle verfügbaren Regelwerke in Echtzeit
                </p>
              </div>
              <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div class="rounded-md shadow">
                  <router-link
                    to="/search"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Alle Regelwerke ansehen
                  </router-link>
                </div>
                <div class="mt-3 sm:mt-0 sm:ml-3">
                  <router-link
                    to="/login"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Administration
                  </router-link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <!-- Hero Image/Illustration -->
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div class="h-56 w-full bg-gradient-to-r from-blue-400 to-blue-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
          <div class="text-center text-white">
            <svg class="mx-auto h-24 w-24 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <h3 class="text-2xl font-bold">Zentrale Verwaltung</h3>
            <p class="mt-2">Alle Regelwerke an einem Ort</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Alles was Sie für Regelwerk-Management benötigen
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Syntagma bietet eine umfassende Lösung für die Verwaltung und Darstellung Ihrer organisatorischen Regelwerke.
          </p>
        </div>

        <div class="mt-10">
          <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Volltext-Suche</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Finden Sie schnell relevante Inhalte mit unserer leistungsstarken Volltext-Suchfunktion.
              </dd>
            </div>

            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Benutzerverwaltung</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Rollenbasierte Zugriffskontrolle für Administratoren und öffentliche Nutzer.
              </dd>
            </div>

            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Versionierung</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Verfolgen Sie Änderungen mit vollständiger Versionskontrolle und Änderungshistorie.
              </dd>
            </div>

            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Kategorisierung</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Organisieren Sie Regelwerke nach Typen und Themen für bessere Übersichtlichkeit.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Quick Access Section -->
    <div class="bg-gray-50">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span class="block">Bereit loszulegen?</span>
          <span class="block text-blue-600">Erkunden Sie unsere Regelwerke.</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <router-link
              to="/search"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Durchsuchen
            </router-link>
          </div>
          <div class="ml-3 inline-flex rounded-md shadow">
            <router-link
              to="/login"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
            >
              Anmelden
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-white">Syntagma</h3>
          <p class="mt-4 text-gray-300">
            Zentrale Plattform für Regelwerk-Management
          </p>
          <div class="mt-8 flex justify-center space-x-6">
            <router-link to="/search" class="text-gray-300 hover:text-white">
              Suchen
            </router-link>
            <router-link to="/login" class="text-gray-300 hover:text-white">
              Administration
            </router-link>
          </div>
          <div class="mt-8 border-t border-gray-700 pt-8">
            <p class="text-gray-400 text-sm">
              © {{ new Date().getFullYear() }} Syntagma. Regelwerk-Verwaltungsplattform.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

function performSearch() {
  const query = searchQuery.value.trim()
  if (query) {
    // Navigate to search page with query parameter
    router.push({
      path: '/search',
      query: { q: query }
    })
  }
}

// Check if there's a search query in URL parameters on mount
onMounted(() => {
  const queryParam = route.query.q
  if (queryParam && typeof queryParam === 'string') {
    // If there's a query parameter, redirect to search page
    router.push({
      path: '/search',
      query: { q: queryParam }
    })
  }
})

console.log('Welcome component loaded successfully!')
</script>
