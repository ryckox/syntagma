<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditMode ? 'Regelwerk bearbeiten' : 'Neues Regelwerk erstellen' }}
          </h1>
          
          <!-- Actions -->
          <div class="flex space-x-3">
            <button
              type="button"
              @click="showMarkdownHelp = true"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Markdown-Hilfe
            </button>
            
            <button
              type="button"
              @click="saveRuleset"
              :disabled="!canSave"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Speichern
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column: Form + Editor -->
        <div class="space-y-6">
          <!-- Basic Information -->
          <div class="bg-white shadow-sm rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Grundinformationen</h2>
            
            <div class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Titel *
                </label>
                <input
                  id="title"
                  v-model="ruleset.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titel des Regelwerks"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
                    Typ *
                  </label>
                  <select
                    id="type"
                    v-model="ruleset.type_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Typ auswählen</option>
                    <option v-for="type in types" :key="type.id" :value="type.id">
                      {{ type.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="topic" class="block text-sm font-medium text-gray-700 mb-2">
                    Thema *
                  </label>
                  <select
                    id="topic"
                    v-model="ruleset.topic_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Thema auswählen</option>
                    <option v-for="topic in topics" :key="topic.id" :value="topic.id">
                      {{ topic.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="version" class="block text-sm font-medium text-gray-700 mb-2">
                    Version *
                  </label>
                  <input
                    id="version"
                    v-model="ruleset.version"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="z.B. 1.0"
                  />
                </div>

                <div>
                  <label for="effective_date" class="block text-sm font-medium text-gray-700 mb-2">
                    Gültig ab
                  </label>
                  <input
                    id="effective_date"
                    v-model="ruleset.effective_date"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Kurzbeschreibung
                </label>
                <textarea
                  id="description"
                  v-model="ruleset.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kurze Beschreibung des Regelwerks"
                ></textarea>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="ruleset.is_active"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Aktiv</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Content Editor -->
          <div class="bg-white shadow-sm rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Inhalt</h3>
                
                <!-- Editor Mode Buttons -->
                <div class="flex space-x-2">
                  <button
                    @click="editorMode = 'markdown'"
                    :class="[
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      editorMode === 'markdown' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    ]"
                  >
                    Markdown
                  </button>
                  <button
                    @click="editorMode = 'toc'"
                    :class="[
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      editorMode === 'toc' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    ]"
                  >
                    Inhaltsverzeichnis
                  </button>
                </div>
              </div>
            </div>

            <div class="p-6">
              <!-- Markdown Editor -->
              <div v-if="editorMode === 'markdown'" class="min-h-[70vh]">
                <textarea
                  v-model="ruleset.content"
                  class="w-full h-[70vh] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                  placeholder="Inhalt des Regelwerks in Markdown-Format..."
                ></textarea>
              </div>

              <!-- Table of Contents Preview -->
              <div v-if="editorMode === 'toc'" class="min-h-[70vh]">
                <div class="prose prose-sm max-w-none">
                  <h4 class="text-lg font-medium mb-4">Inhaltsverzeichnis-Vorschau</h4>
                  <div v-if="tableOfContents.length > 0" class="space-y-2">
                    <div
                      v-for="(item, index) in tableOfContents"
                      :key="index"
                      :class="[
                        'block py-1 px-2 rounded hover:bg-gray-50 cursor-pointer',
                        `pl-${Math.min(item.level * 4, 16)}`
                      ]"
                    >
                      <span class="text-gray-600 text-sm mr-2">{{ item.level === 1 ? '●' : item.level === 2 ? '○' : '▸' }}</span>
                      <span :class="item.level === 1 ? 'font-medium' : 'text-gray-700'">
                        {{ item.text }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-gray-500 italic">
                    Keine Überschriften gefunden. Verwenden Sie # für Überschriften in Ihrem Markdown-Text.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Attachments -->
        <div>
          <RulesetAttachments 
            v-if="isEditMode && rulesetId" 
            :ruleset-id="rulesetId" 
          />
        </div>
      </div>
    </div>

    <!-- Markdown Help Modal -->
    <div v-if="showMarkdownHelp" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-w-2xl">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Markdown-Hilfe</h3>
            <button
              @click="showMarkdownHelp = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="text-sm text-gray-600 space-y-3 max-h-96 overflow-y-auto">
            <div>
              <h4 class="font-medium text-gray-900">Überschriften</h4>
              <pre class="bg-gray-100 p-2 rounded mt-1"># Überschrift 1
## Überschrift 2
### Überschrift 3</pre>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">Text-Formatierung</h4>
              <pre class="bg-gray-100 p-2 rounded mt-1">**Fett** oder __Fett__
*Kursiv* oder _Kursiv_
`Code`</pre>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">Listen</h4>
              <pre class="bg-gray-100 p-2 rounded mt-1">- Punkt 1
- Punkt 2
  - Unterpunkt

1. Nummeriert 1
2. Nummeriert 2</pre>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">Links und Bilder</h4>
              <pre class="bg-gray-100 p-2 rounded mt-1">[Link Text](http://example.com)
![Alt Text](bild-url.jpg)</pre>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">Tabellen</h4>
              <pre class="bg-gray-100 p-2 rounded mt-1">| Spalte 1 | Spalte 2 |
|----------|----------|
| Wert 1   | Wert 2   |</pre>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">Code-Blöcke</h4>
              <pre class="bg-gray-100 p-2 rounded mt-1">```javascript
function example() {
  console.log("Hello World");
}
```</pre>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <button
              @click="showMarkdownHelp = false"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRulesetStore } from '@/stores/ruleset'
import { useTypesStore } from '@/stores/types'
import { useTopicsStore } from '@/stores/topics'
import RulesetAttachments from '@/components/RulesetAttachments.vue'

const route = useRoute()
const router = useRouter()
const rulesetStore = useRulesetStore()
const typesStore = useTypesStore()
const topicsStore = useTopicsStore()

const rulesetId = computed(() => route.params.id)
const isEditMode = computed(() => !!rulesetId.value)
const editorMode = ref('markdown')
const showMarkdownHelp = ref(false)

// Reactive data
const ruleset = ref({
  title: '',
  description: '',
  content: '',
  type_id: '',
  topic_id: '',
  version: '',
  effective_date: '',
  is_active: true
})

const types = computed(() => typesStore.types)
const topics = computed(() => topicsStore.topics)

// Computed properties
const canSave = computed(() => {
  return ruleset.value.title && 
         ruleset.value.type_id && 
         ruleset.value.topic_id && 
         ruleset.value.version
})

const tableOfContents = computed(() => {
  if (!ruleset.value.content) return []
  
  const lines = ruleset.value.content.split('\n')
  const toc = []
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      toc.push({ level, text })
    }
  }
  
  return toc
})

// Methods
const loadRuleset = async () => {
  if (isEditMode.value) {
    try {
      const data = await rulesetStore.fetchRuleset(rulesetId.value)
      if (data) {
        ruleset.value = {
          title: data.title || '',
          description: data.description || '',
          content: data.content || '',
          type_id: data.type_id || '',
          topic_id: data.topic_id || '',
          version: data.version || '',
          effective_date: data.effective_date || '',
          is_active: data.is_active !== undefined ? data.is_active : true
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Regelwerks:', error)
    }
  }
}

const saveRuleset = async () => {
  if (!canSave.value) return
  
  try {
    let result
    if (isEditMode.value) {
      result = await rulesetStore.updateRuleset(rulesetId.value, ruleset.value)
    } else {
      result = await rulesetStore.createRuleset(ruleset.value)
    }
    
    if (result) {
      // Redirect to the ruleset detail page or management page
      if (isEditMode.value) {
        router.push({ name: 'RulesetDetail', params: { id: rulesetId.value } })
      } else {
        router.push({ name: 'RulesetManagement' })
      }
    }
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    typesStore.fetchTypes(),
    topicsStore.fetchTopics(),
    loadRuleset()
  ])
})
</script>
