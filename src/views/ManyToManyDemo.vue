<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Many-to-Many Themen Demo</h1>
    
    <!-- Info über die neue Funktionalität -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
      <div class="flex">
        <div class="flex-shrink-0">
          <InformationCircleIcon class="h-5 w-5 text-blue-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">
            Neue Funktionalität: Mehrfach-Themen-Zuordnung
          </h3>
          <div class="mt-2 text-sm text-blue-700">
            <p>Regelwerke können jetzt mehreren Themen gleichzeitig zugeordnet werden. Dies ermöglicht eine flexiblere Kategorisierung und bessere Auffindbarkeit.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Regelwerk erstellen -->
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Neues Regelwerk erstellen</h2>
      
      <form @submit.prevent="createRuleset" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Titel</label>
          <input 
            v-model="form.title" 
            type="text" 
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Typ</label>
            <select 
              v-model="form.type_id" 
              @change="loadTopicsForType"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Typ auswählen</option>
              <option v-for="type in types" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Themen (Mehrfachauswahl möglich)
            </label>
            <div class="mt-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              <div v-for="topic in availableTopics" :key="topic.id" class="flex items-center">
                <input
                  :id="`topic-${topic.id}`"
                  v-model="form.topic_ids"
                  :value="topic.id"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label :for="`topic-${topic.id}`" class="ml-2 text-sm text-gray-700">
                  {{ topic.name }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Inhalt</label>
          <textarea 
            v-model="form.content" 
            rows="4"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button 
            type="submit" 
            :disabled="isLoading"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Erstelle...' : 'Regelwerk erstellen' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Erstellte Regelwerke anzeigen -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Erstellte Regelwerke</h2>
      
      <div v-if="rulesets.length === 0" class="text-gray-500 text-center py-8">
        Noch keine Regelwerke erstellt.
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="ruleset in rulesets" 
          :key="ruleset.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">{{ ruleset.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ ruleset.content }}</p>
              
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ ruleset.type_name }}
                </span>
                <span 
                  v-for="topic in ruleset.topics" 
                  :key="topic.id"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {{ topic.name }}
                </span>
              </div>
            </div>

            <div class="ml-4">
              <span 
                :class="{
                  'bg-green-100 text-green-800': ruleset.status === 'published',
                  'bg-yellow-100 text-yellow-800': ruleset.status === 'draft',
                  'bg-gray-100 text-gray-800': ruleset.status === 'archived'
                }"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ ruleset.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Erfolgs-/Fehlermeldungen -->
    <div v-if="message" class="fixed inset-x-0 top-0 flex justify-center">
      <div 
        :class="{
          'bg-green-50 border-green-200 text-green-800': message.type === 'success',
          'bg-red-50 border-red-200 text-red-800': message.type === 'error'
        }"
        class="border rounded-lg p-4 m-4 max-w-md"
      >
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InformationCircleIcon } from '@heroicons/vue/24/outline'
import { useRulesetStore, type RulesetType, type Topic, type Ruleset } from '@/stores/ruleset'

const rulesetStore = useRulesetStore()

// Reactive data
const types = ref<RulesetType[]>([])
const availableTopics = ref<Topic[]>([])
const rulesets = ref<Ruleset[]>([])
const isLoading = ref(false)
const message = ref<{ text: string; type: 'success' | 'error' } | null>(null)

// Form data
const form = ref({
  title: '',
  type_id: '',
  topic_ids: [] as number[],
  content: '',
  status: 'draft' as const
})

// Load initial data
onMounted(async () => {
  await loadTypes()
  await loadRulesets()
})

async function loadTypes() {
  await rulesetStore.loadTypes()
  types.value = rulesetStore.types
}

async function loadTopicsForType() {
  if (form.value.type_id) {
    await rulesetStore.loadTopics(parseInt(form.value.type_id))
    availableTopics.value = rulesetStore.topics
    form.value.topic_ids = [] // Reset selected topics when type changes
  }
}

async function loadRulesets() {
  await rulesetStore.loadRulesets()
  rulesets.value = rulesetStore.rulesets
}

async function createRuleset() {
  if (!form.value.title || !form.value.type_id || form.value.topic_ids.length === 0 || !form.value.content) {
    showMessage('Bitte füllen Sie alle Felder aus und wählen Sie mindestens ein Thema.', 'error')
    return
  }

  isLoading.value = true
  
  try {
    const result = await rulesetStore.createRuleset({
      title: form.value.title,
      type_id: parseInt(form.value.type_id),
      topic_ids: form.value.topic_ids.map(id => parseInt(id.toString())),
      content: form.value.content,
      status: form.value.status
    })

    if (result.success) {
      showMessage('Regelwerk erfolgreich erstellt!', 'success')
      resetForm()
      await loadRulesets()
    } else {
      showMessage(result.error || 'Fehler beim Erstellen des Regelwerks', 'error')
    }
  } catch (error) {
    showMessage('Unerwarteter Fehler aufgetreten', 'error')
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  form.value = {
    title: '',
    type_id: '',
    topic_ids: [],
    content: '',
    status: 'draft'
  }
  availableTopics.value = []
}

function showMessage(text: string, type: 'success' | 'error') {
  message.value = { text, type }
  setTimeout(() => {
    message.value = null
  }, 5000)
}
</script>
