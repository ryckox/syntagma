import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface RulesetType {
  id: number
  name: string
  description: string
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface Topic {
  id: number
  name: string
  description: string
  type_id: number
  type_name: string
  type_color: string
  created_at: string
  updated_at: string
}

export interface TableOfContentItem {
  id?: number
  level: number
  title: string
  content: string
  order_index: number
}

export interface ChangeHistoryItem {
  id: number
  change_type: 'created' | 'updated' | 'deleted' | 'published' | 'archived'
  change_summary: string
  version: number
  created_at: string
  changed_by_name: string
}

export interface Ruleset {
  id: number
  title: string
  content: string
  status: 'draft' | 'published' | 'archived'
  version: number
  type_name: string
  type_color: string
  type_icon: string
  topics: Topic[]
  created_by_name: string
  created_at: string
  updated_at: string
  tableOfContents?: TableOfContentItem[]
  changeHistory?: ChangeHistoryItem[]
}

export const useRulesetStore = defineStore('ruleset', () => {
  const rulesets = ref<Ruleset[]>([])
  const types = ref<RulesetType[]>([])
  const topics = ref<Topic[]>([])
  const isLoading = ref(false)
  const currentRuleset = ref<Ruleset | null>(null)
  
  // Pagination
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalRulesets: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  // Regelwerk-Typen laden
  async function loadTypes() {
    try {
      const response = await axios.get('/api/types')
      types.value = response.data
    } catch (error) {
      console.error('Fehler beim Laden der Typen:', error)
    }
  }

  // Themen laden
  async function loadTopics(typeId?: number) {
    try {
      const params = typeId ? { type_id: typeId } : {}
      const response = await axios.get('/api/topics', { params })
      topics.value = response.data
    } catch (error) {
      console.error('Fehler beim Laden der Themen:', error)
    }
  }

  // Regelwerke laden
  async function loadRulesets(filters?: {
    type?: number
    topic?: number
    status?: string
    page?: number
    pageSize?: number
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    isLoading.value = true
    try {
      const params = {
        page: filters?.page || 1,
        pageSize: filters?.pageSize || 10,
        ...filters
      }
      const response = await axios.get('/api/rulesets', { params })
      rulesets.value = response.data.rulesets
      
      // Pagination-Daten aktualisieren
      if (response.data.pagination) {
        pagination.value = {
          currentPage: response.data.pagination.page,
          pageSize: response.data.pagination.pageSize,
          totalRulesets: response.data.pagination.totalRulesets,
          totalPages: response.data.pagination.totalPages,
          hasNextPage: response.data.pagination.hasNextPage,
          hasPreviousPage: response.data.pagination.hasPreviousPage
        }
      }
      
      return response.data.pagination
    } catch (error) {
      console.error('Fehler beim Laden der Regelwerke:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Einzelnes Regelwerk laden
  async function loadRuleset(id: number) {
    isLoading.value = true
    try {
      const response = await axios.get(`/api/rulesets/${id}`)
      currentRuleset.value = response.data
      return response.data
    } catch (error) {
      console.error('Fehler beim Laden des Regelwerks:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Neues Regelwerk erstellen
  async function createRuleset(data: {
    title: string
    type_id: number
    topic_ids: number[]
    content: string
    status?: string
    tableOfContents?: TableOfContentItem[]
  }) {
    try {
      const response = await axios.post('/api/rulesets', data)
      rulesets.value.unshift(response.data)
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Erstellen'
      return { success: false, error: message }
    }
  }

  // Regelwerk aktualisieren
  async function updateRuleset(id: number, data: {
    title?: string
    type_id?: number
    topic_ids?: number[]
    content?: string
    status?: string
    tableOfContents?: TableOfContentItem[]
    changeSummary?: string
  }) {
    try {
      const response = await axios.put(`/api/rulesets/${id}`, data)
      
      // Local state aktualisieren
      const index = rulesets.value.findIndex(r => r.id === id)
      if (index !== -1) {
        rulesets.value[index] = response.data
      }
      
      if (currentRuleset.value?.id === id) {
        currentRuleset.value = { ...currentRuleset.value, ...response.data }
      }

      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Aktualisieren'
      return { success: false, error: message }
    }
  }

  // Regelwerk löschen
  async function deleteRuleset(id: number) {
    try {
      await axios.delete(`/api/rulesets/${id}`)
      rulesets.value = rulesets.value.filter(r => r.id !== id)
      
      if (currentRuleset.value?.id === id) {
        currentRuleset.value = null
      }

      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Löschen'
      return { success: false, error: message }
    }
  }

  // Typ erstellen
  async function createType(data: {
    name: string
    description: string
    color?: string
    icon?: string
  }) {
    try {
      const response = await axios.post('/api/types', data)
      types.value.push(response.data)
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Erstellen'
      return { success: false, error: message }
    }
  }

  // Typ aktualisieren
  async function updateType(id: number, data: {
    name?: string
    description?: string
    color?: string
    icon?: string
  }) {
    try {
      const response = await axios.put(`/api/types/${id}`, data)
      const index = types.value.findIndex(type => type.id === id)
      if (index !== -1) {
        types.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Aktualisieren'
      return { success: false, error: message }
    }
  }

  // Typ löschen
  async function deleteType(id: number) {
    try {
      await axios.delete(`/api/types/${id}`)
      const index = types.value.findIndex(type => type.id === id)
      if (index !== -1) {
        types.value.splice(index, 1)
      }
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Löschen'
      return { success: false, error: message }
    }
  }

  // Thema erstellen
  async function createTopic(data: {
    name: string
    description: string
    type_id: number
  }) {
    try {
      const response = await axios.post('/api/topics', data)
      topics.value.push(response.data)
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Erstellen'
      return { success: false, error: message }
    }
  }

  // Thema aktualisieren
  async function updateTopic(id: number, data: {
    name?: string
    description?: string
    type_id?: number
  }) {
    try {
      const response = await axios.put(`/api/topics/${id}`, data)
      const index = topics.value.findIndex(topic => topic.id === id)
      if (index !== -1) {
        topics.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Aktualisieren'
      return { success: false, error: message }
    }
  }

  // Thema löschen
  async function deleteTopic(id: number) {
    try {
      await axios.delete(`/api/topics/${id}`)
      const index = topics.value.findIndex(topic => topic.id === id)
      if (index !== -1) {
        topics.value.splice(index, 1)
      }
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Löschen'
      return { success: false, error: message }
    }
  }

  return {
    rulesets,
    types,
    topics,
    isLoading,
    currentRuleset,
    pagination,
    loadTypes,
    loadTopics,
    loadRulesets,
    loadRuleset,
    createRuleset,
    updateRuleset,
    deleteRuleset,
    createType,
    updateType,
    deleteType,
    createTopic,
    updateTopic,
    deleteTopic
  }
})
