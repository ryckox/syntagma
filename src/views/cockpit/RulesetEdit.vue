<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <nav class="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <router-link to="/cockpit" class="hover:text-gray-700">Cockpit</router-link>
          <ChevronRightIcon class="h-4 w-4" />
          <router-link to="/cockpit/rulesets" class="hover:text-gray-700">Regelwerke</router-link>
          <ChevronRightIcon class="h-4 w-4" />
          <span class="text-gray-900">{{ ruleset?.title || 'Regelwerk bearbeiten' }}</span>
        </nav>
        
        <div v-if="ruleset" class="flex items-start justify-between">
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
          
          <div class="flex space-x-2">
            <router-link
              :to="{ name: 'RulesetDetail', params: { id: ruleset.id } }"
              class="btn-secondary"
            >
              <EyeIcon class="h-4 w-4 mr-2" />
              Anzeigen
            </router-link>
            <router-link
              :to="{ name: 'EditRuleset', params: { id: ruleset.id } }"
              class="btn-primary"
            >
              <PencilIcon class="h-4 w-4 mr-2" />
              Bearbeiten
            </router-link>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Regelwerk wird geladen...</p>
      </div>

      <!-- Main Content -->
      <div v-else-if="ruleset" class="space-y-6">
        <!-- Content Preview -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Inhalt (Vorschau)</h2>
          <div class="prose max-w-none">
            <div v-html="formatContent(ruleset.content.substring(0, 500))" class="text-gray-700"></div>
            <div v-if="ruleset.content.length > 500" class="text-gray-500 mt-2">
              ... ({{ Math.ceil((ruleset.content.length - 500) / 100) }} weitere Zeilen)
            </div>
          </div>
        </div>

        <!-- Attachments and Links Management -->
        <RulesetAttachments :ruleset-id="ruleset.id" />

        <!-- Metadata -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Metadaten</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1">
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
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Version</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ ruleset.version }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Erstellt von</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ ruleset.created_by_name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Letzte Änderung</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(ruleset.updated_at) }}</dd>
            </div>
          </div>
        </div>

        <!-- Change History -->
        <div v-if="ruleset.changeHistory && ruleset.changeHistory.length > 0" class="bg-white rounded-lg shadow-sm p-6">
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
                    'bg-red-100 text-red-800': change.change_type === 'deleted',
                    'bg-purple-100 text-purple-800': change.change_type === 'published',
                    'bg-gray-100 text-gray-800': change.change_type === 'archived'
                  }"
                >
                  {{ getChangeTypeText(change.change_type) }}
                </span>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-gray-900">
                    Version {{ change.version }}
                  </h4>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(change.created_at) }}
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-600">{{ change.change_summary }}</p>
                <p class="mt-1 text-xs text-gray-500">von {{ change.changed_by_name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Regelwerk nicht gefunden</h3>
        <p class="mt-1 text-sm text-gray-500">Das angeforderte Regelwerk konnte nicht geladen werden.</p>
        <div class="mt-6">
          <router-link to="/cockpit/rulesets" class="btn-primary">
            Zurück zur Übersicht
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRulesetStore, type Ruleset } from '@/stores/ruleset'
import RulesetAttachments from '@/components/RulesetAttachments.vue'
import {
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  DocumentIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const rulesetStore = useRulesetStore()

const ruleset = ref<Ruleset | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  const rulesetId = parseInt(route.params.id as string)
  if (isNaN(rulesetId)) {
    isLoading.value = false
    return
  }

  const data = await rulesetStore.loadRuleset(rulesetId)
  if (data) {
    ruleset.value = data
  }
  isLoading.value = false
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

function getTopicNames(topics: any[]) {
  return topics?.map(topic => topic.name).join(', ') || ''
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    'published': 'Veröffentlicht',
    'draft': 'Entwurf',
    'archived': 'Archiviert'
  }
  return texts[status] || status
}

function getChangeTypeText(changeType: string) {
  const texts: Record<string, string> = {
    'created': 'Erstellt',
    'updated': 'Aktualisiert',
    'deleted': 'Gelöscht',
    'published': 'Veröffentlicht',
    'archived': 'Archiviert'
  }
  return texts[changeType] || changeType
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

function formatContent(content: string) {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}
</script>
