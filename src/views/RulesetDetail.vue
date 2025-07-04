<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <AppNavigation />

    <div v-if="ruleset" class="w-full py-8 px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="max-w-7xl mx-auto mb-6">
        <ol class="flex items-center space-x-4 text-sm">
          <li>
            <router-link to="/" class="text-gray-500 hover:text-gray-700">Startseite</router-link>
          </li>
          <li>
            <ChevronRightIcon class="h-4 w-4 text-gray-400" />
          </li>
          <li>
            <router-link to="/search" class="text-gray-500 hover:text-gray-700">Regelwerke</router-link>
          </li>
          <li>
            <ChevronRightIcon class="h-4 w-4 text-gray-400" />
          </li>
          <li class="text-gray-900 font-medium">{{ ruleset.title }}</li>
        </ol>
      </nav>

      <!-- Ruleset Header - Full Width -->
      <div class="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="h-12 w-12 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: ruleset.type_color + '20', color: ruleset.type_color }"
            >
              <component :is="getIcon(ruleset.type_icon)" class="h-8 w-8" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ ruleset.title }}</h1>
              <div class="flex items-center space-x-4 mt-2">
                <span class="text-sm text-gray-500">{{ ruleset.type_name }}</span>
                <span class="text-gray-400">•</span>
                <span class="text-sm text-gray-500">{{ getTopicNames(ruleset.topics) }}</span>
                <span class="text-gray-400">•</span>
                <span class="badge-green">Version {{ ruleset.version }}</span>
              </div>
            </div>
          </div>
          
          <!-- Edit Button for Admins -->
          <div v-if="authStore.isAdmin" class="flex space-x-2">
            <router-link
              :to="{ name: 'EditRuleset', params: { id: ruleset.id } }"
              class="btn-outline"
            >
              <PencilIcon class="h-4 w-4 mr-2" />
              Bearbeiten
            </router-link>
          </div>
        </div>

        <!-- Metadata -->
        <div class="mt-4 flex items-center space-x-6 text-sm text-gray-500">
          <span>Erstellt: {{ formatDate(ruleset.created_at) }}</span>
          <span>•</span>
          <span>Aktualisiert: {{ formatDate(ruleset.updated_at) }}</span>
          <template v-if="authStore.isAuthenticated">
            <span>•</span>
            <span>Autor: {{ ruleset.created_by_name }}</span>
          </template>
        </div>
      </div>

      <!-- Main Content Area - Two Column Layout -->
      <div class="max-w-7xl mx-auto">
        <div class="flex gap-8">
          <!-- Table of Contents Sidebar -->
          <div v-if="ruleset.tableOfContents && ruleset.tableOfContents.length > 0" class="w-80 flex-shrink-0">
            <div class="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Inhaltsverzeichnis</h2>
              <nav>
                <ul class="space-y-2">
                  <li
                    v-for="(item, index) in ruleset.tableOfContents"
                    :key="item.id || index"
                    :class="[
                      'block',
                      item.level === 1 ? 'font-medium text-gray-900' : 'ml-4 text-gray-600',
                      item.level === 3 ? 'ml-8 text-gray-500' : ''
                    ]"
                  >
                    <a
                      :href="`#section-${index}`"
                      class="hover:text-primary-600 transition-colors block py-1 px-2 rounded hover:bg-gray-50"
                      @click="scrollToSection(index)"
                    >
                      {{ item.title }}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- Content Area -->
          <div class="flex-1 min-w-0">
            <div class="bg-white rounded-lg shadow-sm p-8">
              <!-- Table of Contents Sections -->
              <div v-if="ruleset.tableOfContents && ruleset.tableOfContents.length > 0" class="prose max-w-none">
                <div
                  v-for="(item, index) in ruleset.tableOfContents"
                  :key="item.id || index"
                  :id="`section-${index}`"
                  class="mb-8 scroll-mt-8"
                >
                  <component
                    :is="getHeadingTag(item.level)"
                    class="scroll-mt-8 border-b border-gray-200 pb-2"
                  >
                    {{ item.title }}
                  </component>
                  <div v-if="item.content" v-html="formatContent(item.content)" class="mt-4"></div>
                </div>
              </div>

              <!-- Main Content -->
              <div v-else class="prose max-w-none">
                <div v-html="formatContent(ruleset.content)"></div>
              </div>
            </div>

            <!-- Change History (Admin only) -->
            <div v-if="authStore.isAdmin && ruleset.changeHistory && ruleset.changeHistory.length > 0" class="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Änderungshistorie</h2>
              <div class="space-y-4">
                <div
                  v-for="change in ruleset.changeHistory"
                  :key="change.id"
                  class="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div class="flex-shrink-0">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': change.change_type === 'created',
                        'bg-blue-100 text-blue-800': change.change_type === 'updated',
                        'bg-yellow-100 text-yellow-800': change.change_type === 'published',
                        'bg-red-100 text-red-800': change.change_type === 'deleted',
                        'bg-gray-100 text-gray-800': change.change_type === 'archived'
                      }"
                    >
                      {{ getChangeTypeText(change.change_type) }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{{ change.change_summary }}</p>
                    <div class="mt-1 text-xs text-gray-500">
                      <span>{{ formatDate(change.created_at) }}</span>
                      <template v-if="authStore.isAuthenticated">
                        <span> • {{ change.changed_by_name }}</span>
                      </template>
                      <span> • Version {{ change.version }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="w-full py-16 px-4 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Regelwerk wird geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else class="w-full py-16 px-4 text-center">
      <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-lg font-medium text-gray-900">Regelwerk nicht gefunden</h3>
      <p class="mt-1 text-gray-500">Das angeforderte Regelwerk existiert nicht oder Sie haben keine Berechtigung darauf zuzugreifen.</p>
      <div class="mt-6">
        <router-link to="/search" class="btn-primary">
          Zurück zur Suche
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { type Ruleset } from '@/stores/ruleset'
import AppNavigation from '@/components/AppNavigation.vue'
import {
  ChevronRightIcon,
  PencilIcon,
  DocumentIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()



const ruleset = ref<Ruleset | null>(null)
const isLoading = ref(true)

const props = defineProps<{
  id: string
}>()

onMounted(async () => {
  const rulesetId = parseInt(props.id)
  if (isNaN(rulesetId)) {
    isLoading.value = false
    return
  }

  try {
    // Direct fetch instead of store to match Search.vue approach
    const response = await fetch(`http://localhost:3001/api/rulesets/${rulesetId}`)
    if (response.ok) {
      const data = await response.json()
      ruleset.value = data
    }
  } catch (error) {
    console.error('Error loading ruleset:', error)
  } finally {
    isLoading.value = false
  }
})

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

function getHeadingTag(level: number) {
  return `h${Math.min(level + 1, 6)}`
}

function getChangeTypeText(type: string) {
  const texts: Record<string, string> = {
    'created': 'Erstellt',
    'updated': 'Aktualisiert',
    'published': 'Veröffentlicht',
    'deleted': 'Gelöscht',
    'archived': 'Archiviert'
  }
  return texts[type] || type
}

function formatContent(content: string) {
  // Simple text formatting - could integrate Markdown parsing here
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function scrollToSection(index: number) {
  const element = document.getElementById(`section-${index}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function getTopicNames(topics: any[]) {
  return topics?.map(topic => topic.name).join(', ') || ''
}
</script>

<style scoped>
.prose p {
  margin-bottom: 1rem;
}

.prose h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.prose h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.prose h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.badge-green {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #dcfce7;
  color: #166534;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: white;
  transition: background-color 0.2s;
}

.btn-outline:hover {
  background-color: #f9fafb;
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
</style>
