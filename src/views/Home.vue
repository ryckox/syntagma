<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <AppNavigation />

    <!-- Hero Section -->
    <div class="bg-primary-600">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            <span class="block">Regelwerke</span>
            <span class="block text-primary-200">transparent verwalten</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-primary-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Syntagma bietet eine zentrale Plattform zur Zusammenführung, schnellen Dokumentation und transparenten Darstellung von Regelwerken für Datenschutz, IT-Sicherheit und Dienstvereinbarungen.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <router-link
                to="/search"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Regelwerke durchsuchen
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Kategorien
          </h2>
          <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Entdecken Sie die verschiedenen Arten von Regelwerken in unserer Plattform
          </p>
        </div>

        <div class="mt-12">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="type in rulesetStore.types"
              :key="type.id"
              class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 cursor-pointer"
              @click="searchByType(type.id)"
            >
              <div class="flex-shrink-0">
                <div
                  class="h-10 w-10 rounded-lg flex items-center justify-center"
                  :style="{ backgroundColor: type.color + '20', color: type.color }"
                >
                  <component :is="getIcon(type.icon)" class="h-6 w-6" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <span class="absolute inset-0" aria-hidden="true" />
                <p class="text-sm font-medium text-gray-900">{{ type.name }}</p>
                <p class="text-sm text-gray-500 truncate">{{ type.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Rulesets -->
    <div class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Aktuelle Regelwerke
          </h2>
          <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Die neuesten veröffentlichten Regelwerke
          </p>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="ruleset in recentRulesets"
            :key="ruleset.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="$router.push({ name: 'RulesetDetail', params: { id: ruleset.id } })"
          >
            <div class="p-6">
              <div class="flex items-center">
                <div
                  class="h-8 w-8 rounded-lg flex items-center justify-center mr-3"
                  :style="{ backgroundColor: ruleset.type_color + '20', color: ruleset.type_color }"
                >
                  <component :is="getIcon(ruleset.type_icon)" class="h-5 w-5" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500">{{ ruleset.type_name }}</p>
                  <p class="text-xs text-gray-400">{{ ruleset.topic_name }}</p>
                </div>
                <span class="badge-green">v{{ ruleset.version }}</span>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">{{ ruleset.title }}</h3>
              <p class="mt-2 text-sm text-gray-600 line-clamp-3">
                {{ truncateContent(ruleset.content) }}
              </p>
              <div class="mt-4 flex items-center text-sm text-gray-500">
                <span>{{ formatDate(ruleset.updated_at) }}</span>
                <span class="mx-2">•</span>
                <span>{{ ruleset.created_by_name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 text-center" v-if="recentRulesets.length === 0">
          <p class="text-gray-500">Noch keine Regelwerke veröffentlicht.</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center text-gray-500">
          <p>&copy; 2025 Syntagma. Regelwerk-Verwaltungsplattform.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRulesetStore, type Ruleset } from '@/stores/ruleset'
import { 
  ShieldCheckIcon, 
  ComputerDesktopIcon, 
  UserGroupIcon,
  DocumentIcon 
} from '@heroicons/vue/24/outline'
import AppNavigation from '@/components/AppNavigation.vue'

const router = useRouter()
const rulesetStore = useRulesetStore()
const recentRulesets = ref<Ruleset[]>([])

onMounted(async () => {
  // Typen laden
  await rulesetStore.loadTypes()
  
  // Aktuelle Regelwerke laden
  const result = await rulesetStore.loadRulesets({ limit: 6 })
  if (result) {
    recentRulesets.value = rulesetStore.rulesets
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

function searchByType(typeId: number) {
  router.push({ 
    name: 'Search', 
    query: { type: typeId.toString() } 
  })
}

function truncateContent(content: string, maxLength = 150) {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}


</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
