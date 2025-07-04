<template>
  <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditMode ? 'Regelwerk bearbeiten' : 'Neues Regelwerk erstellen' }}
          </h1>
          <p class="mt-2 text-gray-600">
            {{ isEditMode ? 'Bearbeiten Sie die Details und den Inhalt des Regelwerks.' : 'Erstellen Sie ein neues Regelwerk mit Metadaten und strukturiertem Inhalt.' }}
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="saveRuleset"
            :disabled="loading || !isFormValid"
            class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Speichern...
            </span>
            <span v-else>{{ isEditMode ? 'Änderungen speichern' : 'Regelwerk erstellen' }}</span>
          </button>
          <button
            @click="$router.go(-1)"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>

    <!-- Metadata Section -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Grundinformationen</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Title -->
        <div class="lg:col-span-2">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Titel <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="ruleset.title"
            type="text"
            required
            placeholder="z.B. Allgemeine Datenschutzrichtlinie"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Version (Read-only) -->
        <div>
          <label for="version" class="block text-sm font-medium text-gray-700 mb-2">
            Version 
            <span class="text-xs text-gray-500">(automatisch verwaltet)</span>
          </label>
          <input
            id="version"
            :value="isEditMode ? ruleset.version : 'wird bei Veröffentlichung gesetzt'"
            type="text"
            readonly
            placeholder="wird automatisch gesetzt"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status <span class="text-red-500">*</span></label>
          <div class="flex space-x-4 mt-2">
            <label class="flex items-center">
              <input
                v-model="ruleset.status"
                type="radio"
                value="draft"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Entwurf</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="ruleset.status"
                type="radio"
                value="published"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Veröffentlicht</span>
            </label>
          </div>
        </div>

        <!-- Type Selection -->
        <div>
          <label for="type_id" class="block text-sm font-medium text-gray-700 mb-2">
            Typ <span class="text-red-500">*</span>
          </label>
          <select
            id="type_id"
            v-model="ruleset.type_id"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Typ auswählen</option>
            <option v-for="type in types" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>

        <!-- Topic Selection -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Themen <span class="text-red-500">*</span>
            <span class="text-xs text-gray-500">(Mehrfachauswahl möglich)</span>
          </label>
          <div class="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
            <div v-if="filteredTopics.length === 0" class="text-sm text-gray-500 text-center py-2">
              {{ ruleset.type_id ? 'Keine Themen für diesen Typ verfügbar' : 'Wählen Sie zuerst einen Typ aus' }}
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label 
                v-for="topic in filteredTopics" 
                :key="topic.id"
                class="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
              >
                <input
                  :id="`topic-${topic.id}`"
                  v-model="ruleset.topic_ids"
                  :value="String(topic.id)"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">{{ topic.name }}</span>
              </label>
            </div>
          </div>
          <p v-if="ruleset.topic_ids && ruleset.topic_ids.length > 0" class="mt-1 text-xs text-green-600">
            {{ ruleset.topic_ids.length }} Thema(en) ausgewählt
          </p>
          

        </div>
      </div>
    </div>

    <!-- Content Editor (Full Width) -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <!-- Editor Header -->
      <div class="border-b border-gray-200 px-6 py-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Inhalt</h2>
          <div class="flex items-center space-x-4">
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
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Inhaltsverzeichnis
              </button>
            </div>
            
            <!-- Markdown Hilfe Button -->
            <button
              @click="showMarkdownHelp = true"
              class="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Markdown Hilfe"
            >
              <QuestionMarkCircleIcon class="h-5 w-5" />
              <span class="text-sm">Hilfe</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Editor Content -->
      <div>
        <!-- Markdown Editor -->
        <div v-if="editorMode === 'markdown'" class="h-full">
          <!-- Toolbar -->
          <div class="border-b border-gray-200 px-6 py-3">
            <div class="flex space-x-4">
              <button @click="insertMarkdown('# ', '')" class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                H1
              </button>
              <button @click="insertMarkdown('## ', '')" class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                H2
              </button>
              <button @click="insertMarkdown('### ', '')" class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                H3
              </button>
              <span class="text-gray-300">|</span>
              <button @click="insertMarkdown('**', '**')" class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded font-bold">
                B
              </button>
              <button @click="insertMarkdown('*', '*')" class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded italic">
                I
              </button>
              <span class="text-gray-300">|</span>
              <button @click="insertMarkdown('- ', '')" class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                Liste
              </button>
              <button @click="insertMarkdown('[', '](url)')" class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                Link
              </button>
            </div>
          </div>
          
          <textarea
            ref="contentEditor"
            v-model="ruleset.content"
            placeholder="Geben Sie hier den Inhalt des Regelwerks ein...

Beispiel:
# Hauptüberschrift
## Unterüberschrift

Dies ist ein Absatz mit **fettem Text** und *kursivem Text*.

- Listenpunkt 1
- Listenpunkt 2

[Link-Text](https://example.com)"
            class="w-full h-[700px] p-6 border-0 focus:ring-0 resize-none font-mono text-sm leading-relaxed"
          ></textarea>
        </div>

        <!-- Table of Contents -->
        <div v-if="editorMode === 'toc'" class="p-6">
          <div v-if="generatedTableOfContents.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Automatisch generiertes Inhaltsverzeichnis</h3>
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <p class="text-sm text-gray-600 mb-3">
                Das Inhaltsverzeichnis wird automatisch aus den Markdown-Überschriften (# ## ###) erstellt und beim Speichern mitgespeichert.
              </p>
            </div>
            <div class="space-y-3">
              <div
                v-for="(item, index) in generatedTableOfContents"
                :key="index"
                :class="[
                  'border border-gray-200 rounded-lg p-4',
                  item.level === 1 ? 'bg-blue-50 border-blue-200' : 
                  item.level === 2 ? 'bg-green-50 border-green-200 ml-4' : 
                  'bg-yellow-50 border-yellow-200 ml-8'
                ]"
              >
                <div class="flex items-center mb-2">
                  <span :class="[
                    'w-6 h-6 rounded text-xs font-bold flex items-center justify-center mr-2',
                    item.level === 1 ? 'bg-blue-600 text-white' :
                    item.level === 2 ? 'bg-green-600 text-white' :
                    'bg-yellow-600 text-white'
                  ]">
                    H{{ item.level }}
                  </span>
                  <h4 :class="[
                    'font-semibold',
                    item.level === 1 ? 'text-lg text-blue-900' :
                    item.level === 2 ? 'text-base text-green-900' :
                    'text-sm text-yellow-900'
                  ]">
                    {{ item.title }}
                  </h4>
                </div>
                <div v-if="item.content" class="text-sm text-gray-700 bg-white rounded p-3 border-l-4 border-gray-300">
                  <p class="whitespace-pre-wrap">{{ item.content.substring(0, 200) }}{{ item.content.length > 200 ? '...' : '' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 italic text-center py-12">
            Kein Inhaltsverzeichnis verfügbar. Fügen Sie Überschriften mit # ## ### zu Ihrem Markdown hinzu.
          </div>
        </div>
      </div>
    </div>

    <!-- WICHTIG: Anhänge und Links Sektion - IMMER GANZ UNTEN! -->
    <div v-if="isEditMode && rulesetId" class="bg-white shadow-sm rounded-lg p-6 mt-8" style="order: 999;">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🔗 Anhänge & Externe Links</h3>
      <RulesetAttachments :ruleset-id="parseInt(rulesetId)" />
    </div>
    <div v-else class="bg-white shadow-sm rounded-lg p-6 mt-8" style="order: 999;">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🔗 Anhänge & Externe Links</h3>
      <div class="text-sm text-gray-500 italic text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
        Anhänge und externe Links können nach dem Speichern des Regelwerks hinzugefügt werden.
      </div>
    </div>

    <!-- Markdown Hilfe Modal -->
    <div v-if="showMarkdownHelp" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showMarkdownHelp = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900">Markdown Syntax Hilfe</h3>
              <button
                @click="showMarkdownHelp = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div class="max-h-96 overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Überschriften -->
                <div class="space-y-4">
                  <h4 class="font-semibold text-gray-900">Überschriften</h4>
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="font-mono text-sm text-gray-800">
                      # Überschrift 1<br>
                      ## Überschrift 2<br>
                      ### Überschrift 3
                    </div>
                  </div>
                  
                  <h4 class="font-semibold text-gray-900">Text-Formatierung</h4>
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="font-mono text-sm text-gray-800">
                      **Fett**<br>
                      *Kursiv*<br>
                      `Code`<br>
                      ~~Durchgestrichen~~
                    </div>
                  </div>
                  
                  <h4 class="font-semibold text-gray-900">Listen</h4>
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="font-mono text-sm text-gray-800">
                      - Ungeordnete Liste<br>
                      - Element 2<br>
                      <br>
                      1. Geordnete Liste<br>
                      2. Element 2
                    </div>
                  </div>
                </div>
                
                <!-- Links und Code -->
                <div class="space-y-4">
                  <h4 class="font-semibold text-gray-900">Links</h4>
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="font-mono text-sm text-gray-800">
                      [Link-Text](https://example.com)<br>
                      [E-Mail](mailto:test@example.com)
                    </div>
                  </div>
                  
                  <h4 class="font-semibold text-gray-900">Code-Blöcke</h4>
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="font-mono text-sm text-gray-800">
                      ```javascript<br>
                      function example() {<br>
                      &nbsp;&nbsp;return "Hello World";<br>
                      }<br>
                      ```
                    </div>
                  </div>
                  
                  <h4 class="font-semibold text-gray-900">Tabellen</h4>
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="font-mono text-sm text-gray-800">
                      | Spalte 1 | Spalte 2 |<br>
                      |----------|----------|<br>
                      | Wert 1   | Wert 2   |
                    </div>
                  </div>
                  
                  <h4 class="font-semibold text-gray-900">Zitate</h4>
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="font-mono text-sm text-gray-800">
                      > Dies ist ein Zitat
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-2">💡 Tipp</h4>
                <p class="text-sm text-blue-800">
                  Das Inhaltsverzeichnis wird automatisch aus den Überschriften (# ## ###) generiert. 
                  Verwenden Sie strukturierte Überschriften für eine bessere Navigation.
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="showMarkdownHelp = false"
              class="btn-primary w-full sm:w-auto"
            >
              Verstanden
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive, triggerRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTypesStore } from '@/stores/types'
import { useTopicsStore } from '@/stores/topics'
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import RulesetAttachments from '@/components/RulesetAttachments.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const typesStore = useTypesStore()
const topicsStore = useTopicsStore()

const rulesetId = computed(() => route.params.id)
const isEditMode = computed(() => !!rulesetId.value)
const loading = ref(false)
const editorMode = ref('markdown')
const contentEditor = ref(null)
const showMarkdownHelp = ref(false)

const ruleset = ref({
  title: '',
  content: '',
  type_id: '',
  topic_ids: [],
  version: '',
  status: 'draft',
  description: '',
  effective_date: '',
  is_active: true
})

const types = computed(() => typesStore.types)
const topics = computed(() => topicsStore.topics)

// Watcher für type_id Änderungen
watch(() => ruleset.value.type_id, (newTypeId, oldTypeId) => {
  if (newTypeId !== oldTypeId) {
    // Reset selected topics when type changes
    ruleset.value.topic_ids = []
  }
})

// Debug watcher für topic_ids - entfernt
// watch(() => ruleset.value.topic_ids, (newVal, oldVal) => {
//   console.log('topic_ids changed!', 'old:', oldVal, 'new:', newVal)
// }, { deep: true })

// Computed properties
const filteredTopics = computed(() => {
  if (!ruleset.value.type_id) return topics.value || []
  const filtered = (topics.value || []).filter(topic => String(topic.type_id) === String(ruleset.value.type_id))
  return filtered
})

const isFormValid = computed(() => {
  return ruleset.value.title && 
         ruleset.value.type_id && 
         ruleset.value.topic_ids && 
         ruleset.value.topic_ids.length > 0 && 
         ruleset.value.content
})

// Automatische TOC-Generierung aus Markdown
const generatedTableOfContents = computed(() => {
  if (!ruleset.value.content) return []
  
  const lines = ruleset.value.content.split('\n')
  const toc = []
  let currentSection = null
  let sectionContent = []
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    // Check for headers
    const h1Match = trimmedLine.match(/^# (.+)$/)
    const h2Match = trimmedLine.match(/^## (.+)$/)
    const h3Match = trimmedLine.match(/^### (.+)$/)
    
    if (h1Match || h2Match || h3Match) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = sectionContent.join('\n').trim()
        toc.push(currentSection)
      }
      
      // Start new section
      const level = h1Match ? 1 : h2Match ? 2 : 3
      const title = h1Match ? h1Match[1] : h2Match ? h2Match[1] : h3Match[1]
      
      currentSection = {
        level,
        title: title.trim(),
        content: ''
      }
      sectionContent = []
    } else if (currentSection && trimmedLine) {
      // Add content to current section
      sectionContent.push(line)
    }
  })
  
  // Don't forget the last section
  if (currentSection) {
    currentSection.content = sectionContent.join('\n').trim()
    toc.push(currentSection)
  }
  
  return toc
})

// Methods
async function fetchMetadata() {
  try {
    await Promise.all([
      typesStore.fetchTypes(),
      topicsStore.fetchTopics()
    ])
  } catch (error) {
    console.error('Fehler beim Laden der Metadaten:', error)
  }
}

async function loadRuleset() {
  if (!isEditMode.value) return
  
  try {
    const headers = authStore.token ? {
      'Authorization': `Bearer ${authStore.token}`
    } : {}

    const response = await fetch(`http://localhost:3001/api/rulesets/${rulesetId.value}`, { headers })
    if (response.ok) {
      const data = await response.json()
      
      const mappedTopicIds = data.topics && Array.isArray(data.topics) 
        ? data.topics.map(topic => String(topic.id)) 
        : []
      
      // Erst alle anderen Eigenschaften setzen OHNE topic_ids
      ruleset.value.title = data.title || ''
      ruleset.value.content = data.content || ''
      ruleset.value.type_id = String(data.type_id) || ''
      ruleset.value.version = data.version || '1.0'
      ruleset.value.status = data.status || 'draft'
      ruleset.value.description = data.description || ''
      ruleset.value.effective_date = data.effective_date || ''
      ruleset.value.is_active = data.is_active !== undefined ? data.is_active : true
      
      // Warten auf Vue Reaktivität
      await nextTick()
      
      // topic_ids separat mit push() setzen - das funktioniert besser für Vue Reaktivität
      ruleset.value.topic_ids.splice(0) // Array komplett leeren
      for (const topicId of mappedTopicIds) {
        ruleset.value.topic_ids.push(topicId)
      }
      
      // Erneut warten und dann prüfen
      await nextTick()
    } else if (response.status === 401) {
      console.error('Authentication required')
      authStore.logout()
      router.push('/cockpit')
    } else if (response.status === 403) {
      console.error('Access forbidden')
      alert('Sie haben keine Berechtigung, dieses Regelwerk zu bearbeiten.')
      router.push('/cockpit/rulesets')
    }
  } catch (error) {
    console.error('Fehler beim Laden des Regelwerks:', error)
  }
}

function insertMarkdown(before, after) {
  const textarea = contentEditor.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = ruleset.value.content.substring(start, end)
  const replacement = before + selectedText + after

  ruleset.value.content = 
    ruleset.value.content.substring(0, start) + 
    replacement + 
    ruleset.value.content.substring(end)

  // Restore cursor position
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + before.length,
      start + before.length + selectedText.length
    )
  }, 0)
}

async function saveRuleset() {
  if (!isFormValid.value) return
  
  if (!authStore.isAuthenticated) {
    alert('Sie müssen angemeldet sein, um Regelwerke zu speichern.')
    router.push('/cockpit')
    return
  }
  
  loading.value = true
  
  try {
    const data = {
      title: ruleset.value.title,
      type_id: parseInt(ruleset.value.type_id),
      topic_ids: (ruleset.value.topic_ids || []).map(id => parseInt(id)),
      content: ruleset.value.content,
      status: ruleset.value.status,
      tableOfContents: generatedTableOfContents.value
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    }
    
    let response
    if (isEditMode.value) {
      response = await fetch(`http://localhost:3001/api/rulesets/${rulesetId.value}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      })
    } else {
      response = await fetch('http://localhost:3001/api/rulesets', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })
    }
    
    if (!response.ok) {
      let errorMessage = 'Fehler beim Speichern'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {}
      
      if (response.status === 401) {
        alert('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.')
        authStore.logout()
        router.push('/cockpit')
        return
      } else if (response.status === 403) {
        alert('Sie haben keine Berechtigung für diese Aktion.')
        return
      }
      
      throw new Error(errorMessage)
    }
    
    // Erfolg
    alert('Regelwerk erfolgreich gespeichert!')
    router.push('/cockpit/rulesets')
    
  } catch (error) {
    console.error('Fehler beim Speichern des Regelwerks:', error)
    alert(`Fehler beim Speichern: ${error.message}`)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Prüfen ob Benutzer authentifiziert ist
  if (!authStore.isAuthenticated) {
    router.push('/cockpit')
    return
  }
  
  // Erst Metadaten laden, dann Regelwerk
  await fetchMetadata()
  await loadRuleset()
})
</script>

<style scoped>
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

.prose h1 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
}

.prose h3 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.prose ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose a {
  color: #2563eb;
  text-decoration: underline;
}

.prose a:hover {
  color: #1d4ed8;
}
</style>
