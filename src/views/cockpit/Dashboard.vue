<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-2 text-gray-600">Übersicht über Ihre Syntagma-Plattform</p>
        </div>
        <button
          @click="loadDashboardData"
          :disabled="isLoading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DocumentTextIcon class="h-8 w-8 text-primary-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Regelwerke</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.rulesets }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TagIcon class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Typen</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.types }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <FolderIcon class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Themen</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.topics }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Benutzer</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.users }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Quick Actions Card -->
      <div class="card">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
          <div class="space-y-3">
            <router-link
              :to="{ name: 'NewRuleset' }"
              class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon class="h-5 w-5 text-primary-600 mr-3" />
              <span class="text-gray-900">Neues Regelwerk erstellen</span>
            </router-link>
            <router-link
              :to="{ name: 'TypeManagement' }"
              class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TagIcon class="h-5 w-5 text-green-600 mr-3" />
              <span class="text-gray-900">Typen verwalten</span>
            </router-link>
            <router-link
              :to="{ name: 'TopicManagement' }"
              class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderIcon class="h-5 w-5 text-yellow-600 mr-3" />
              <span class="text-gray-900">Themen verwalten</span>
            </router-link>
            <router-link
              :to="{ name: 'UserManagement' }"
              class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UsersIcon class="h-5 w-5 text-blue-600 mr-3" />
              <span class="text-gray-900">Benutzer verwalten</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h2>
          <div class="space-y-4" v-if="recentActivity.length > 0">
            <div
              v-for="activity in recentActivity"
              :key="`${activity.type}-${activity.id}`"
              class="flex items-start space-x-3"
            >
              <div class="flex-shrink-0">
                <component
                  :is="getActivityIcon(activity.type)"
                  class="h-5 w-5 text-gray-400"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(activity.date) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-gray-500 text-sm">Keine aktuellen Aktivitäten</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Overview -->
    <div class="card">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Regelwerk-Status</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ statusCounts.published }}</div>
            <div class="text-sm text-gray-500">Veröffentlicht</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ statusCounts.draft }}</div>
            <div class="text-sm text-gray-500">Entwürfe</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600">{{ statusCounts.archived }}</div>
            <div class="text-sm text-gray-500">Archiviert</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
  UsersIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  ArchiveBoxIcon
} from '@heroicons/vue/24/outline'

const stats = ref({
  rulesets: 0,
  types: 0,
  topics: 0,
  users: 0
})

const statusCounts = ref({
  published: 0,
  draft: 0,
  archived: 0
})

const recentActivity = ref<Array<{
  id: number
  type: 'created' | 'updated' | 'published'
  description: string
  date: string
}>>([])

const isLoading = ref(false)

onMounted(async () => {
  // Load dashboard data
  await loadDashboardData()
})

async function loadDashboardData() {
  isLoading.value = true
  try {
    // Load dashboard statistics directly from API
    const [statsResponse, typesResponse, topicsResponse] = await Promise.all([
      fetch('/api/dashboard/stats'),
      fetch('/api/types'),
      fetch('/api/topics')
    ])

    // Parse responses
    const [statsData, typesData, topicsData] = await Promise.all([
      statsResponse.json(),
      typesResponse.json(), 
      topicsResponse.json()
    ])

    // Update stats from direct API call or fallback to counting
    if (statsData && statsResponse.ok) {
      stats.value = {
        rulesets: statsData.totalRulesets || 0,
        types: statsData.totalTypes || typesData.length || 0,
        topics: statsData.totalTopics || topicsData.length || 0,
        users: statsData.totalUsers || 2
      }
      
      statusCounts.value = {
        published: statsData.publishedRulesets || 0,
        draft: statsData.draftRulesets || 0,
        archived: statsData.archivedRulesets || 0
      }
    } else {
      // Fallback: Get counts manually if stats API doesn't exist
      await loadDashboardDataFallback()
    }

    // Generate recent activity
    await loadRecentActivity()
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Try fallback method
    await loadDashboardDataFallback()
  } finally {
    isLoading.value = false
  }
}

async function loadDashboardDataFallback() {
  try {
    // Load all data with high limits to get total counts
    const [allRulesetsResponse, typesResponse, topicsResponse] = await Promise.all([
      fetch('/api/rulesets?pageSize=1000&page=1'), // Large page size to get all
      fetch('/api/types'),
      fetch('/api/topics')
    ])

    const [rulesetsData, typesData, topicsData] = await Promise.all([
      allRulesetsResponse.json(),
      typesResponse.json(),
      topicsResponse.json()
    ])

    // Count totals from pagination info or array lengths
    const totalRulesets = rulesetsData.pagination?.totalRulesets || rulesetsData.rulesets?.length || 0
    
    // Count by status
    const rulesets = rulesetsData.rulesets || []
    const statusCounts_local = {
      published: rulesets.filter((r: any) => r.status === 'published').length,
      draft: rulesets.filter((r: any) => r.status === 'draft').length,
      archived: rulesets.filter((r: any) => r.status === 'archived').length
    }

    // Update reactive data
    stats.value = {
      rulesets: totalRulesets,
      types: typesData.length || 0,
      topics: topicsData.length || 0,
      users: 2 // This would come from a user API call
    }

    statusCounts.value = statusCounts_local
    
  } catch (error) {
    console.error('Error in fallback loading:', error)
    // Set to zero as last resort
    stats.value = { rulesets: 0, types: 0, topics: 0, users: 0 }
    statusCounts.value = { published: 0, draft: 0, archived: 0 }
  }
}

async function loadRecentActivity() {
  try {
    // Load recent activity from API
    const response = await fetch('/api/rulesets?pageSize=5&page=1&sortBy=updated_at&sortOrder=desc')
    const data = await response.json()
    
    if (data.rulesets) {
      recentActivity.value = data.rulesets.map((ruleset: any) => ({
        id: ruleset.id,
        type: 'updated' as const,
        description: `Regelwerk "${ruleset.title}" wurde aktualisiert`,
        date: ruleset.updated_at
      }))
    }
  } catch (error) {
    console.error('Error loading recent activity:', error)
    recentActivity.value = []
  }
}



function getActivityIcon(type: string) {
  const icons: Record<string, any> = {
    'created': PlusIcon,
    'updated': PencilIcon,
    'published': EyeIcon,
    'archived': ArchiveBoxIcon
  }
  return icons[type] || PencilIcon
}

function formatDate(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return 'Heute'
  } else if (diffDays === 2) {
    return 'Gestern'
  } else if (diffDays <= 7) {
    return `Vor ${diffDays} Tagen`
  } else {
    return date.toLocaleDateString('de-DE')
  }
}
</script>
