<template>
  <div class="space-y-6">
    <!-- Header mit Suche und Aktionen -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Themen verwalten</h1>
        <p class="text-sm text-gray-600 mt-1">{{ filteredTopics.length }} von {{ topics.length }} Themen</p>
      </div>
      
      <!-- Suchfeld und Filter -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Themen durchsuchen..."
            class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <!-- Typ-Filter -->
        <select
          v-model="typeFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Alle Typen</option>
          <option v-for="type in types" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
        
        <button
          @click="showCreateDialog = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap"
        >
          <PlusIcon class="h-5 w-5" />
          <span>Neues Thema</span>
        </button>
      </div>
    </div>

    <!-- Topics List -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <button
                  @click="toggleSort('name')"
                  class="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>Name</span>
                  <svg v-if="sortField === 'name'" class="h-4 w-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                  <svg v-else class="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                </button>
              </th>
              <th class="px-6 py-3 text-left">
                <button
                  @click="toggleSort('type_name')"
                  class="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>Typ</span>
                  <svg v-if="sortField === 'type_name'" class="h-4 w-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                  <svg v-else class="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Beschreibung
              </th>
              <th class="px-6 py-3 text-left">
                <button
                  @click="toggleSort('ruleset_count')"
                  class="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>Regelwerke</span>
                  <svg v-if="sortField === 'ruleset_count'" class="h-4 w-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                  <svg v-else class="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                </button>
              </th>
              <th class="px-6 py-3 text-left hidden lg:table-cell">
                <button
                  @click="toggleSort('created_at')"
                  class="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>Erstellt</span>
                  <svg v-if="sortField === 'created_at'" class="h-4 w-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                  <svg v-else class="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                </button>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredTopics.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <div v-if="searchQuery || typeFilter" class="space-y-2">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <p class="text-lg font-medium">Keine Themen gefunden</p>
                  <p class="text-sm">Versuchen Sie andere Suchbegriffe oder Filter</p>
                  <button 
                    @click="clearFilters"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
                <div v-else class="space-y-2">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="text-lg font-medium">Noch keine Themen vorhanden</p>
                  <p class="text-sm">Erstellen Sie Ihr erstes Thema, um zu beginnen</p>
                </div>
              </td>
            </tr>
            <tr v-for="topic in filteredTopics" :key="topic.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <div class="text-sm font-medium text-gray-900">{{ topic.name }}</div>
                  <div class="md:hidden text-xs text-gray-500 mt-1">{{ topic.description || 'Keine Beschreibung' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :style="{ 
                    backgroundColor: topic.type_color + '15', 
                    color: topic.type_color,
                    borderColor: topic.type_color + '30'
                  }"
                >
                  {{ topic.type_name }}
                </span>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <div class="text-sm text-gray-500 max-w-xs truncate">{{ topic.description || 'Keine Beschreibung' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ topic.ruleset_count || 0 }} {{ topic.ruleset_count === 1 ? 'Regelwerk' : 'Regelwerke' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                {{ formatDate(topic.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="editTopic(topic)"
                    class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    Bearbeiten
                  </button>
                  <button
                    @click="deleteTopic(topic.id)"
                    class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <div
      v-if="showCreateDialog || editingTopic"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeDialog"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingTopic ? 'Thema bearbeiten' : 'Neues Thema erstellen' }}
          </h3>
          <form @submit.prevent="saveTopic" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="type_id" class="block text-sm font-medium text-gray-700">Typ</label>
              <select
                id="type_id"
                v-model="form.type_id"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Typ auswählen...</option>
                <option v-for="type in types" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Beschreibung</label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeDialog"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {{ loading ? 'Speichern...' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useTopicsStore } from '@/stores/topics'
import { useTypesStore } from '@/stores/types'

const topicsStore = useTopicsStore()
const typesStore = useTypesStore()

const showCreateDialog = ref(false)
const editingTopic = ref(null)
const form = ref({
  name: '',
  description: '',
  type_id: null
})

// Search and filter state
const searchQuery = ref('')
const typeFilter = ref('')
const sortField = ref('name')
const sortDirection = ref('asc')

// Computed properties from stores
const topics = computed(() => topicsStore.topics)
const types = computed(() => typesStore.types)
const loading = computed(() => topicsStore.loading)

// Filtered and sorted topics
const filteredTopics = computed(() => {
  let filtered = topics.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(topic => 
      topic.name.toLowerCase().includes(query) ||
      topic.description?.toLowerCase().includes(query) ||
      topic.type_name.toLowerCase().includes(query)
    )
  }

  // Apply type filter
  if (typeFilter.value) {
    filtered = filtered.filter(topic => topic.type_id === Number(typeFilter.value))
  }

  // Apply sorting
  return [...filtered].sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]

    // Handle different data types
    if (sortField.value === 'created_at') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    } else if (sortField.value === 'ruleset_count') {
      aValue = Number(aValue || 0)
      bValue = Number(bValue || 0)
    } else {
      aValue = String(aValue || '').toLowerCase()
      bValue = String(bValue || '').toLowerCase()
    }

    if (aValue < bValue) {
      return sortDirection.value === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection.value === 'asc' ? 1 : -1
    }
    return 0
  })
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE')
}

// Sorting functions
const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
}

const editTopic = (topic) => {
  editingTopic.value = topic
  form.value = { 
    name: topic.name, 
    description: topic.description || '',
    type_id: topic.type_id
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingTopic.value = null
  form.value = { name: '', description: '', type_id: null }
  topicsStore.clearError()
}

const saveTopic = async () => {
  if (!form.value.type_id) {
    alert('Bitte wählen Sie einen Typ aus.')
    return
  }

  try {
    if (editingTopic.value) {
      const result = await topicsStore.updateTopic(editingTopic.value.id, form.value)
      if (result) {
        closeDialog()
      }
    } else {
      const result = await topicsStore.createTopic(form.value)
      if (result) {
        closeDialog()
      }
    }
    
    if (topicsStore.error) {
      alert(topicsStore.error)
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Themas:', error)
    alert('Fehler beim Speichern des Themas')
  }
}

const deleteTopic = async (id) => {
  if (confirm('Möchten Sie dieses Thema wirklich löschen?')) {
    const success = await topicsStore.deleteTopic(id)
    if (!success && topicsStore.error) {
      alert(topicsStore.error)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    topicsStore.fetchTopics(),
    typesStore.fetchTypes()
  ])
})
</script>
