<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Audit-Log</h1>
          <p class="mt-2 text-gray-600">Übersicht über alle Regelwerk-Änderungen (nur für Admins)</p>
        </div>
        <button
          @click="refreshAuditLog"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Aktualisieren
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="card mb-6">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Filter</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="action-filter" class="block text-sm font-medium text-gray-700 mb-2">
              Aktion
            </label>
            <select
              id="action-filter"
              v-model="filters.action"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Alle Aktionen</option>
              <option value="created">Erstellt</option>
              <option value="updated">Aktualisiert</option>
              <option value="published">Veröffentlicht</option>
              <option value="archived">Archiviert</option>
              <option value="deleted">Gelöscht</option>
            </select>
          </div>
          <div>
            <label for="start-date" class="block text-sm font-medium text-gray-700 mb-2">
              Von Datum
            </label>
            <input
              id="start-date"
              type="date"
              v-model="filters.startDate"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
          <div>
            <label for="end-date" class="block text-sm font-medium text-gray-700 mb-2">
              Bis Datum
            </label>
            <input
              id="end-date"
              type="date"
              v-model="filters.endDate"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
          <div>
            <label for="ruleset-search" class="block text-sm font-medium text-gray-700 mb-2">
              Regelwerk suchen
            </label>
            <input
              id="ruleset-search"
              type="text"
              v-model="filters.rulesetSearch"
              placeholder="Regelwerk-Titel eingeben..."
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
        </div>
        <div class="mt-4">
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Filter anwenden
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Fehler beim Laden des Audit-Logs</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">Audit-Log wird geladen...</p>
    </div>

    <!-- Audit Log Table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktion
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Regelwerk
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Benutzer
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zeitstempel
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Geänderte Felder
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="entry in auditLogs"
              :key="entry.id"
              class="hover:bg-gray-50"
            >
              <!-- Action -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="['px-2 py-1 text-xs font-medium rounded-full', getActionBadgeClasses(entry.action)]"
                >
                  {{ getActionLabel(entry.action) }}
                </span>
              </td>

              <!-- Ruleset -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ entry.ruleset_title || `Regelwerk #${entry.ruleset_id}` }}
                </div>
                <div class="text-sm text-gray-500">ID: {{ entry.ruleset_id }}</div>
              </td>

              <!-- User -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ entry.user_name }}</div>
                <div class="text-sm text-gray-500">{{ entry.ip_address }}</div>
              </td>

              <!-- Timestamp -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(entry.timestamp) }}</div>
                <div class="text-sm text-gray-500">{{ formatTime(entry.timestamp) }}</div>
              </td>

              <!-- Version -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span v-if="entry.version_before && entry.version_after">
                  {{ entry.version_before }} → {{ entry.version_after }}
                </span>
                <span v-else-if="entry.version_after">
                  {{ entry.version_after }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>

              <!-- Changed Fields -->
              <td class="px-6 py-4">
                <div v-if="Object.keys(entry.field_changes).length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="field in Object.keys(entry.field_changes).slice(0, 3)"
                    :key="field"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {{ getFieldLabel(field) }}
                  </span>
                  <span
                    v-if="Object.keys(entry.field_changes).length > 3"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    +{{ Object.keys(entry.field_changes).length - 3 }} weitere
                  </span>
                </div>
                <span v-else class="text-sm text-gray-400">Keine</span>
              </td>

              <!-- Details Button -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="toggleDetails(entry.id)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  {{ expandedEntries.includes(entry.id) ? 'Weniger' : 'Details' }}
                </button>
              </td>
            </tr>

            <!-- Expanded Details Row -->
            <tr
              v-for="entry in auditLogs.filter(e => expandedEntries.includes(e.id))"
              :key="`details-${entry.id}`"
              class="bg-gray-50"
            >
              <td colspan="7" class="px-6 py-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Field Changes -->
                  <div v-if="Object.keys(entry.field_changes).length > 0">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Feldänderungen</h4>
                    <div class="space-y-3">
                      <div
                        v-for="(change, field) in entry.field_changes"
                        :key="field"
                        class="border border-gray-200 rounded-lg p-3 bg-white"
                      >
                        <div class="text-sm font-medium text-gray-700 mb-2">
                          {{ getFieldLabel(field) }}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div class="text-xs text-gray-500 mb-1">Vorher:</div>
                            <div class="bg-red-50 p-2 rounded border text-red-900">
                              {{ formatValue(change.from) }}
                            </div>
                          </div>
                          <div>
                            <div class="text-xs text-gray-500 mb-1">Nachher:</div>
                            <div class="bg-green-50 p-2 rounded border text-green-900">
                              {{ formatValue(change.to) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Technical Details -->
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Technische Details</h4>
                    <div class="bg-white border border-gray-200 rounded-lg p-3">
                      <div class="space-y-2 text-sm">
                        <div>
                          <span class="font-medium text-gray-700">Benutzer:</span>
                          {{ entry.user_name }}
                        </div>
                        <div>
                          <span class="font-medium text-gray-700">IP-Adresse:</span>
                          {{ entry.ip_address }}
                        </div>
                        <div>
                          <span class="font-medium text-gray-700">User-Agent:</span>
                          <div class="text-xs text-gray-500 break-all">{{ entry.user_agent }}</div>
                        </div>
                        <div>
                          <span class="font-medium text-gray-700">Zeitstempel:</span>
                          {{ new Date(entry.timestamp).toLocaleString('de-DE') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && auditLogs.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Audit-Log-Einträge</h3>
        <p class="mt-1 text-sm text-gray-500">Es wurden keine Einträge mit den aktuellen Filtern gefunden.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="mt-8 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Zeige {{ ((pagination.currentPage - 1) * pagination.pageSize) + 1 }} bis
        {{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} von
        {{ pagination.total }} Einträgen
      </div>
      <div class="flex space-x-2">
        <button
          @click="changePage(pagination.currentPage - 1)"
          :disabled="pagination.currentPage <= 1"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Vorherige
        </button>
        <button
          @click="changePage(pagination.currentPage + 1)"
          :disabled="pagination.currentPage >= pagination.totalPages"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Nächste
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface AuditLogEntry {
  id: number
  ruleset_id: number
  action: string
  field_changes: Record<string, any>
  old_values: Record<string, any>
  new_values: Record<string, any>
  version_before: string | null
  version_after: string | null
  timestamp: string
  user_name: string
  user_email?: string
  ip_address: string
  user_agent: string
  ruleset_title?: string
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
  totalPages: number
}

const authStore = useAuthStore()

const auditLogs = ref<AuditLogEntry[]>([])
const pagination = ref<Pagination | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const expandedEntries = ref<number[]>([])
const filters = ref({
  action: '',
  startDate: '',
  endDate: '',
  rulesetSearch: '',
  page: '1'
})

onMounted(async () => {
  await loadAuditLog()
})

async function loadAuditLog() {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    
    // Filter anwenden
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value) {
        params.append(key, value)
      }
    })

    const response = await fetch(`http://localhost:3001/api/rulesets/audit-log?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    auditLogs.value = data.auditLogs || []
    pagination.value = data.pagination
  } catch (err: any) {
    console.error('Fehler beim Laden des Audit-Logs:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function refreshAuditLog() {
  await loadAuditLog()
}

async function applyFilters() {
  filters.value.page = '1' // Reset to first page when applying filters
  await loadAuditLog()
}

async function changePage(page: number) {
  if (pagination.value && page >= 1 && page <= pagination.value.totalPages) {
    filters.value.page = page.toString()
    await loadAuditLog()
  }
}

function toggleDetails(entryId: number) {
  const index = expandedEntries.value.indexOf(entryId)
  if (index > -1) {
    expandedEntries.value.splice(index, 1)
  } else {
    expandedEntries.value.push(entryId)
  }
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    created: 'Erstellt',
    updated: 'Aktualisiert', 
    published: 'Veröffentlicht',
    archived: 'Archiviert',
    deleted: 'Gelöscht'
  }
  return labels[action] || action
}

function getActionBadgeClasses(action: string): string {
  const classes: Record<string, string> = {
    created: 'bg-green-100 text-green-800',
    updated: 'bg-blue-100 text-blue-800',
    published: 'bg-purple-100 text-purple-800',
    archived: 'bg-yellow-100 text-yellow-800',
    deleted: 'bg-red-100 text-red-800'
  }
  return classes[action] || 'bg-gray-100 text-gray-800'
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    title: 'Titel',
    content: 'Inhalt',
    status: 'Status',
    type_id: 'Typ',
    topic_ids: 'Themen',
    tableOfContents: 'Inhaltsverzeichnis'
  }
  return labels[field] || field
}

function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  }
  return String(value)
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
