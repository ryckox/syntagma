<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <AppNavigation />

    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Search Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Regelwerke suchen</h1>
        <p class="mt-2 text-gray-600">Durchsuchen Sie alle verfügbaren Regelwerke in Echtzeit</p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Regelwerk suchen... (z.B. Datenschutz, IT-Sicherheit, Arbeitszeit)"
            class="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            @input="handleSearchInput"
          >
          <!-- Clear Button -->
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Search Stats -->
      <div class="flex justify-center mb-6">
        <div class="bg-white px-4 py-2 rounded-full shadow-sm border">
          <span class="text-sm text-gray-600">
            {{ searchQuery ? `${filteredRulesets.length} von ${allRulesets.length} Regelwerken` : `${allRulesets.length} Regelwerke verfügbar` }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Regelwerke werden geladen...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRulesets.length === 0 && searchQuery" class="text-center py-12">
        <DocumentMagnifyingGlassIcon class="mx-auto h-16 w-16 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Keine Ergebnisse gefunden</h3>
        <p class="mt-2 text-gray-500">
          Versuchen Sie es mit anderen Suchbegriffen wie "{{ searchSuggestions[Math.floor(Math.random() * searchSuggestions.length)] }}"
        </p>
        <button
          @click="clearSearch"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Alle Regelwerke anzeigen
        </button>
      </div>

      <!-- Ruleset List -->
      <div v-else class="space-y-4">
        <div
          v-for="ruleset in filteredRulesets"
          :key="ruleset.id"
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 overflow-hidden"
          @click="openRuleset(ruleset.id)"
        >
          <div class="p-6">
            <div class="flex items-center justify-between">
              <!-- Left side: Icon, Title and Meta -->
              <div class="flex items-center space-x-4 flex-1 min-w-0">
                <div
                  class="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  :style="{ backgroundColor: ruleset.type_color + '15', color: ruleset.type_color }"
                >
                  <component :is="getIcon(ruleset.type_icon)" class="h-7 w-7" />
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-semibold text-gray-900 mb-1">
                    {{ ruleset.title }}
                  </h3>
                  <div class="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" 
                          :style="{ backgroundColor: ruleset.type_color + '10', color: ruleset.type_color }">
                      {{ ruleset.type_name }}
                    </span>
                    <span>{{ ruleset.topic_name }}</span>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Version {{ ruleset.version }}
                    </span>
                  </div>
                  <p class="text-gray-600 text-sm leading-relaxed line-clamp-2" 
                     v-html="getHighlightedText(truncateText(ruleset.content, 200))">
                  </p>
                </div>
              </div>

              <!-- Right side: Meta info and Action -->
              <div class="flex items-center space-x-6 ml-6">
                <div class="text-right text-xs text-gray-500">
                  <div>{{ formatDate(ruleset.updated_at) }}</div>
                  <div v-if="ruleset.created_by_name" class="mt-1">{{ ruleset.created_by_name }}</div>
                </div>
                
                <div class="flex items-center text-blue-600 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                  <span>Anzeigen</span>
                  <ChevronRightIcon class="h-4 w-4 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button (if needed for pagination) -->
      <div v-if="filteredRulesets.length >= 12 && !searchQuery" class="text-center mt-8">
        <button
          @click="loadMoreRulesets"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md transition-colors"
        >
          Weitere Regelwerke laden
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { type Ruleset } from '@/stores/ruleset'
import {
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  UserGroupIcon,
  DocumentIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import AppNavigation from '@/components/AppNavigation.vue'

const router = useRouter()

// Reactive data
const searchQuery = ref('')
const isLoading = ref(true)
const allRulesets = ref<Ruleset[]>([])

// Search suggestions for empty state
const searchSuggestions = [
  'Datenschutz',
  'IT-Sicherheit', 
  'Arbeitszeit',
  'Homeoffice',
  'Urlaubsregelung',
  'Compliance'
]

// Computed properties
const filteredRulesets = computed(() => {
  let results = allRulesets.value
  
  // Filter by search query if provided
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    results = results.filter(ruleset => {
      return (
        ruleset.title.toLowerCase().includes(query) ||
        ruleset.content?.toLowerCase().includes(query) ||
        ruleset.type_name?.toLowerCase().includes(query) ||
        ruleset.topic_name?.toLowerCase().includes(query) ||
        ruleset.created_by_name?.toLowerCase().includes(query)
      )
    })
  }
  
  // Sort by last updated (newest first)
  return results.sort((a, b) => {
    const dateA = new Date(a.updated_at).getTime()
    const dateB = new Date(b.updated_at).getTime()
    return dateB - dateA // Descending order (newest first)
  })
})

// Lifecycle
onMounted(async () => {
  await loadAllRulesets()
})

// Methods
async function loadAllRulesets() {
  isLoading.value = true
  console.log('Starting to load rulesets...')
  
  try {
    console.log('Fetching from API...')
    const response = await fetch('http://localhost:3001/api/rulesets')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API Response:', data)
    
    if (data.rulesets && Array.isArray(data.rulesets)) {
      allRulesets.value = data.rulesets
      console.log(`Successfully loaded ${allRulesets.value.length} rulesets`)
    } else {
      console.warn('Invalid response format:', data)
      allRulesets.value = []
    }
    
  } catch (error) {
    console.error('Error loading rulesets:', error)
    allRulesets.value = []
  } finally {
    isLoading.value = false
    console.log('Loading finished. Final allRulesets length:', allRulesets.value.length)
  }
}

function handleSearchInput() {
  // Debounce search input if needed
  // Could add analytics tracking here
}

function clearSearch() {
  searchQuery.value = ''
}

function openRuleset(id: number) {
  router.push({ name: 'RulesetDetail', params: { id: id.toString() } })
}

function getIcon(iconName: string) {
  const icons: Record<string, any> = {
    'shield-check': ShieldCheckIcon,
    'security': ShieldCheckIcon,
    'handshake': UserGroupIcon,
    'computer': ComputerDesktopIcon,
    'default': DocumentIcon
  }
  return icons[iconName] || icons.default
}

function truncateText(text: string, maxLength = 150) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function getHighlightedText(text: string) {
  if (!searchQuery.value.trim() || !text) return text
  
  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function loadMoreRulesets() {
  // Implement pagination if needed
  console.log('Load more rulesets')
}
</script>

<style scoped>
:deep(mark) {
  background-color: #fef3c7;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 500;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.input {
  display: block;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

/* Smooth animations */
.space-y-4 > * {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects */
.space-y-4 > *:hover {
  transform: translateY(-1px);
}
</style>
