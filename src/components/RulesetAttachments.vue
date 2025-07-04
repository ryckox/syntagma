<template>
  <div class="space-y-6">
    <!-- Anhänge Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
          <PaperClipIcon class="h-5 w-5 mr-2 text-gray-500" />
          Anhänge
        </h3>
        <button
          v-if="canEdit"
          @click="showUploadModal = true"
          class="btn-secondary"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Datei hinzufügen
        </button>
      </div>
      
      <!-- Attachments List -->
      <div v-if="attachments.length > 0" class="space-y-3">
        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-primary-100 rounded flex items-center justify-center">
              <DocumentIcon class="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">{{ attachment.original_filename }}</div>
              <div class="text-xs text-gray-500">
                {{ formatFileSize(attachment.file_size) }} • 
                {{ formatDate(attachment.created_at) }}
                <span v-if="attachment.uploaded_by_name"> • von {{ attachment.uploaded_by_name }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="downloadAttachment(attachment.id, attachment.original_filename)"
              class="text-primary-600 hover:text-primary-700"
              title="Herunterladen"
            >
              <ArrowDownTrayIcon class="h-5 w-5" />
            </button>
            <button
              v-if="canEdit"
              @click="deleteAttachment(attachment.id)"
              class="text-red-600 hover:text-red-700"
              title="Löschen"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <PaperClipIcon class="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Keine Anhänge vorhanden</p>
      </div>
    </div>

    <!-- Externe Links Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
          <LinkIcon class="h-5 w-5 mr-2 text-gray-500" />
          Externe Links
        </h3>
        <button
          v-if="canEdit"
          @click="showLinkModal = true"
          class="btn-secondary"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Link hinzufügen
        </button>
      </div>
      
      <!-- Links List -->
      <div v-if="links.length > 0" class="space-y-3">
        <div
          v-for="link in links"
          :key="link.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
              <component :is="getLinkIcon(link.link_type)" class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">{{ link.title }}</div>
              <div class="text-xs text-gray-500">
                {{ link.url }}
                <span v-if="link.description"> • {{ link.description }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 hover:text-primary-700"
              title="Link öffnen"
            >
              <ArrowTopRightOnSquareIcon class="h-5 w-5" />
            </a>
            <button
              v-if="canEdit"
              @click="editLink(link)"
              class="text-gray-600 hover:text-gray-700"
              title="Bearbeiten"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              v-if="canEdit"
              @click="deleteLink(link.id)"
              class="text-red-600 hover:text-red-700"
              title="Löschen"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <LinkIcon class="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Keine externen Links vorhanden</p>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showUploadModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Datei hochladen</h3>
            
            <div class="mt-2">
              <input
                ref="fileInput"
                type="file"
                @change="handleFileSelect"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              />
              <p class="mt-1 text-xs text-gray-500">
                Erlaubte Dateitypen: PDF, Word, Excel, PowerPoint, Textdateien, Bilder (max. 10MB)
              </p>
            </div>
            
            <div v-if="selectedFile" class="mt-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-2">
                <DocumentIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-900">{{ selectedFile.name }}</span>
                <span class="text-xs text-gray-500">({{ formatFileSize(selectedFile.size) }})</span>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="uploadFile"
              :disabled="!selectedFile || isUploading"
              class="btn-primary w-full sm:w-auto sm:ml-3"
            >
              {{ isUploading ? 'Uploading...' : 'Hochladen' }}
            </button>
            <button
              @click="showUploadModal = false"
              class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Link Modal -->
    <div v-if="showLinkModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeLinkModal"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingLink ? 'Link bearbeiten' : 'Neuen Link hinzufügen' }}
            </h3>
            
            <form @submit.prevent="saveLink" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  v-model="linkForm.title"
                  type="text"
                  required
                  class="input"
                  placeholder="Link-Titel"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  v-model="linkForm.url"
                  type="url"
                  required
                  class="input"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung (optional)</label>
                <textarea
                  v-model="linkForm.description"
                  class="input"
                  rows="2"
                  placeholder="Kurze Beschreibung des Links"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select v-model="linkForm.link_type" class="select">
                  <option value="external">Externe Website</option>
                  <option value="portal">Portal/System</option>
                  <option value="document">Dokument</option>
                  <option value="system">Internes System</option>
                </select>
              </div>
            </form>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="saveLink"
              :disabled="!linkForm.title || !linkForm.url || isSavingLink"
              class="btn-primary w-full sm:w-auto sm:ml-3"
            >
              {{ isSavingLink ? 'Speichern...' : 'Speichern' }}
            </button>
            <button
              @click="closeLinkModal"
              class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import {
  PaperClipIcon,
  LinkIcon,
  PlusIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ServerIcon
} from '@heroicons/vue/24/outline'

interface Attachment {
  id: number
  filename: string
  original_filename: string
  mime_type: string
  file_size: number
  file_path: string
  uploaded_by_name?: string
  created_at: string
}

interface ExternalLink {
  id: number
  title: string
  url: string
  description?: string
  link_type: string
  created_by_name?: string
  created_at: string
}

const props = defineProps<{
  rulesetId: number
}>()

const authStore = useAuthStore()

const attachments = ref<Attachment[]>([])
const links = ref<ExternalLink[]>([])

const showUploadModal = ref(false)
const showLinkModal = ref(false)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const isSavingLink = ref(false)

const editingLink = ref<ExternalLink | null>(null)
const linkForm = ref({
  title: '',
  url: '',
  description: '',
  link_type: 'external'
})

const canEdit = computed(() => authStore.isAuthenticated)

onMounted(() => {
  loadAttachments()
  loadLinks()
})

async function loadAttachments() {
  try {
    const response = await axios.get(`/api/rulesets/${props.rulesetId}/attachments`)
    attachments.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Anhänge:', error)
  }
}

async function loadLinks() {
  try {
    const response = await axios.get(`/api/rulesets/${props.rulesetId}/links`)
    links.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Links:', error)
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

async function uploadFile() {
  if (!selectedFile.value) return

  isUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    await axios.post(`/api/rulesets/${props.rulesetId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    showUploadModal.value = false
    selectedFile.value = null
    await loadAttachments()
  } catch (error: any) {
    console.error('Fehler beim Upload:', error)
    if (error.response?.status === 401) {
      alert('Sie müssen angemeldet sein, um Dateien hochzuladen.')
    } else if (error.response?.status === 403) {
      alert('Sie haben keine Berechtigung, Dateien hochzuladen.')
    } else {
      alert('Fehler beim Datei-Upload: ' + (error.response?.data?.error || 'Unbekannter Fehler'))
    }
  } finally {
    isUploading.value = false
  }
}

async function downloadAttachment(id: number, filename: string) {
  try {
    const response = await axios.get(`/api/attachments/${id}/download`, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Fehler beim Download:', error)
    alert('Fehler beim Download')
  }
}

async function deleteAttachment(id: number) {
  if (!confirm('Sind Sie sicher, dass Sie diesen Anhang löschen möchten?')) return

  try {
    await axios.delete(`/api/attachments/${id}`)
    await loadAttachments()
  } catch (error: any) {
    console.error('Fehler beim Löschen:', error)
    if (error.response?.status === 401) {
      alert('Sie müssen angemeldet sein, um Anhänge zu löschen.')
    } else if (error.response?.status === 403) {
      alert('Sie haben keine Berechtigung, Anhänge zu löschen.')
    } else {
      alert('Fehler beim Löschen des Anhangs: ' + (error.response?.data?.error || 'Unbekannter Fehler'))
    }
  }
}

function editLink(link: ExternalLink) {
  editingLink.value = link
  linkForm.value = {
    title: link.title,
    url: link.url,
    description: link.description || '',
    link_type: link.link_type
  }
  showLinkModal.value = true
}

async function saveLink() {
  isSavingLink.value = true

  try {
    if (editingLink.value) {
      await axios.put(`/api/links/${editingLink.value.id}`, linkForm.value)
    } else {
      await axios.post(`/api/rulesets/${props.rulesetId}/links`, linkForm.value)
    }

    closeLinkModal()
    await loadLinks()
  } catch (error: any) {
    console.error('Fehler beim Speichern:', error)
    if (error.response?.status === 401) {
      alert('Sie müssen angemeldet sein, um Links zu verwalten.')
    } else if (error.response?.status === 403) {
      alert('Sie haben keine Berechtigung, Links zu verwalten.')
    } else {
      alert('Fehler beim Speichern des Links: ' + (error.response?.data?.error || 'Unbekannter Fehler'))
    }
  } finally {
    isSavingLink.value = false
  }
}

async function deleteLink(id: number) {
  if (!confirm('Sind Sie sicher, dass Sie diesen Link löschen möchten?')) return

  try {
    await axios.delete(`/api/links/${id}`)
    await loadLinks()
  } catch (error: any) {
    console.error('Fehler beim Löschen:', error)
    if (error.response?.status === 401) {
      alert('Sie müssen angemeldet sein, um Links zu löschen.')
    } else if (error.response?.status === 403) {
      alert('Sie haben keine Berechtigung, Links zu löschen.')
    } else {
      alert('Fehler beim Löschen des Links: ' + (error.response?.data?.error || 'Unbekannter Fehler'))
    }
  }
}

function closeLinkModal() {
  showLinkModal.value = false
  editingLink.value = null
  linkForm.value = {
    title: '',
    url: '',
    description: '',
    link_type: 'external'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getLinkIcon(linkType: string) {
  const icons: Record<string, any> = {
    external: GlobeAltIcon,
    portal: ComputerDesktopIcon,
    document: DocumentIcon,
    system: ServerIcon
  }
  return icons[linkType] || GlobeAltIcon
}
</script>
