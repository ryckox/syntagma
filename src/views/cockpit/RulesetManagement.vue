<template>
  <div>
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Regelwerke verwalten</h1>
        <p class="mt-2 text-gray-600">Erstellen, bearbeiten und verwalten Sie Ihre Regelwerke</p>
      </div>
      <router-link :to="{ name: 'NewRuleset' }" class="btn-primary">
        <PlusIcon class="h-5 w-5 mr-2" />
        Neues Regelwerk
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="filters.status" @change="loadRulesets" class="select">
              <option value="">Alle Status</option>
              <option value="published">Veröffentlicht</option>
              <option value="draft">Entwurf</option>
              <option value="archived">Archiviert</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Typ</label>
            <select v-model="filters.type" @change="loadRulesets" class="select">
              <option value="">Alle Typen</option>
              <option v-for="type in rulesetStore.types" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Thema</label>
            <select v-model="filters.topic" @change="loadRulesets" class="select">
              <option value="">Alle Themen</option>
              <option v-for="topic in filteredTopics" :key="topic.id" :value="topic.id">
                {{ topic.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Suche</label>
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              placeholder="Titel suchen..."
              class="input"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="rulesetStore.isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Regelwerke werden geladen...</p>
    </div>

    <!-- Rulesets Table -->
    <div v-else class="card">
      <!-- Header with pagination info -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          {{ getPaginationText() }}
        </div>
        <div class="flex items-center space-x-2">
          <label for="pageSize" class="text-sm text-gray-700">Zeilen pro Seite:</label>
          <select
            id="pageSize"
            v-model="pageSize"
            @change="changePageSize"
            class="select text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Titel
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Typ & Thema
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Version
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Aktualisiert
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ruleset in displayedRulesets" :key="ruleset.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900 break-words">{{ ruleset.title }}</div>
                  <div class="text-sm text-gray-500">{{ ruleset.created_by_name }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div
                    class="h-8 w-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                    :style="{ backgroundColor: ruleset.type_color + '20', color: ruleset.type_color }"
                  >
                    <component :is="getIcon(ruleset.type_icon)" class="h-5 w-5" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ ruleset.type_name }}</div>
                    <div class="text-sm text-gray-500 break-words">{{ getTopicNames(ruleset.topics) }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="badge"
                  :class="{
                    'badge-green': ruleset.status === 'published',
                    'badge-yellow': ruleset.status === 'draft',
                    'badge-gray': ruleset.status === 'archived'
                  }"
                >
                  {{ getStatusText(ruleset.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                v{{ ruleset.version }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(ruleset.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <router-link
                    :to="{ name: 'RulesetDetail', params: { id: ruleset.id } }"
                    class="text-primary-600 hover:text-primary-900"
                    title="Anzeigen"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </router-link>
                  <router-link
                    :to="{ name: 'EditRuleset', params: { id: ruleset.id } }"
                    class="text-gray-600 hover:text-gray-900"
                    title="Bearbeiten"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </router-link>
                  <router-link
                    :to="{ name: 'ManageRuleset', params: { id: ruleset.id } }"
                    class="text-blue-600 hover:text-blue-900"
                    title="Anhänge und Links verwalten"
                  >
                    <PaperClipIcon class="h-5 w-5" />
                  </router-link>
                  <button
                    @click="confirmDelete(ruleset)"
                    class="text-red-600 hover:text-red-900"
                    title="Löschen"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="rulesetStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <!-- Mobile Pagination -->
            <button
              @click="previousPage"
              :disabled="!rulesetStore.pagination.hasPreviousPage"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            <button
              @click="nextPage"
              :disabled="!rulesetStore.pagination.hasNextPage"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Seite {{ rulesetStore.pagination.currentPage }} von {{ rulesetStore.pagination.totalPages }}
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <!-- Previous Button -->
                <button
                  @click="previousPage"
                  :disabled="!rulesetStore.pagination.hasPreviousPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Previous</span>
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                
                <!-- Page Numbers -->
                <template v-for="page in getPageNumbers()" :key="page">
                  <button
                    v-if="page !== '...'"
                    @click="goToPage(page as number)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === rulesetStore.pagination.currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <span
                    v-else
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                </template>
                
                <!-- Next Button -->
                <button
                  @click="nextPage"
                  :disabled="!rulesetStore.pagination.hasNextPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Next</span>
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

        <!-- Empty State -->
        <div v-if="displayedRulesets.length === 0" class="text-center py-12">
          <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Regelwerke gefunden</h3>
          <p class="mt-1 text-sm text-gray-500">
            Erstellen Sie Ihr erstes Regelwerk oder passen Sie die Filter an.
          </p>
          <div class="mt-6">
            <router-link :to="{ name: 'NewRuleset' }" class="btn-primary">
              <PlusIcon class="h-5 w-5 mr-2" />
              Neues Regelwerk
            </router-link>
          </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showDeleteModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <ExclamationTriangleIcon class="mx-auto h-16 w-16 text-red-600" />
          <h3 class="text-lg font-medium text-gray-900 mt-5">Regelwerk löschen</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Sind Sie sicher, dass Sie das Regelwerk "{{ rulesetToDelete?.title }}" löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
          <div class="flex justify-center space-x-4 px-4 py-3">
            <button
              @click="showDeleteModal = false"
              class="btn-outline"
            >
              Abbrechen
            </button>
            <button
              @click="deleteRuleset"
              class="btn-danger"
              :disabled="isDeleting"
            >
              {{ isDeleting ? 'Löschen...' : 'Löschen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRulesetStore, type Ruleset } from '@/stores/ruleset'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  DocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperClipIcon
} from '@heroicons/vue/24/outline'

const rulesetStore = useRulesetStore()

const filters = reactive({
  status: '',
  type: '',
  topic: ''
})

const searchQuery = ref('')
const pageSize = ref(10)
const showDeleteModal = ref(false)
const rulesetToDelete = ref<Ruleset | null>(null)
const isDeleting = ref(false)

const filteredTopics = computed(() => {
  if (!filters.type) return rulesetStore.topics
  return rulesetStore.topics.filter(topic => 
    topic.type_id === parseInt(filters.type)
  )
})

const displayedRulesets = computed(() => {
  return rulesetStore.rulesets
})

onMounted(async () => {
  await Promise.all([
    rulesetStore.loadTypes(),
    rulesetStore.loadTopics(),
    loadRulesets()
  ])
})

watch(() => filters.type, () => {
  filters.topic = ''
})

async function loadRulesets() {
  const filterParams: any = {
    page: rulesetStore.pagination.currentPage,
    pageSize: pageSize.value
  }
  
  if (filters.status) filterParams.status = filters.status
  if (filters.type) filterParams.type = parseInt(filters.type)
  if (filters.topic) filterParams.topic = parseInt(filters.topic)
  if (searchQuery.value) filterParams.search = searchQuery.value

  await rulesetStore.loadRulesets(filterParams)
}

// Debounced search
let searchTimeout: number
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadRulesets()
  }, 300)
}

// Pagination functions
function changePageSize() {
  rulesetStore.pagination.currentPage = 1
  loadRulesets()
}

function previousPage() {
  if (rulesetStore.pagination.hasPreviousPage) {
    rulesetStore.pagination.currentPage--
    loadRulesets()
  }
}

function nextPage() {
  if (rulesetStore.pagination.hasNextPage) {
    rulesetStore.pagination.currentPage++
    loadRulesets()
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= rulesetStore.pagination.totalPages) {
    rulesetStore.pagination.currentPage = page
    loadRulesets()
  }
}

function getPageNumbers() {
  const current = rulesetStore.pagination.currentPage
  const total = rulesetStore.pagination.totalPages
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else {
    if (total > 1) rangeWithDots.push(total)
  }

  return rangeWithDots
}

function getPaginationText() {
  const { currentPage, pageSize, totalRulesets } = rulesetStore.pagination
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalRulesets)
  return `${start} - ${end} von ${totalRulesets} Regelwerken`
}

function getTopicNames(topics: any[]) {
  return topics?.map(topic => topic.name).join(', ') || ''
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

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    'published': 'Veröffentlicht',
    'draft': 'Entwurf',
    'archived': 'Archiviert'
  }
  return texts[status] || status
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function confirmDelete(ruleset: Ruleset) {
  rulesetToDelete.value = ruleset
  showDeleteModal.value = true
}

async function deleteRuleset() {
  if (!rulesetToDelete.value) return

  isDeleting.value = true
  
  const result = await rulesetStore.deleteRuleset(rulesetToDelete.value.id)
  
  if (result.success) {
    showDeleteModal.value = false
    rulesetToDelete.value = null
    // Optionally show success message
  } else {
    // Show error message
    alert('Fehler beim Löschen: ' + result.error)
  }
  
  isDeleting.value = false
}
</script>
