import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface Topic {
  id: number
  name: string
  description?: string
  type_id: number
  type_name: string
  type_color: string
  ruleset_count: number
  created_at: string
  updated_at: string
}

export interface CreateTopicData {
  name: string
  description?: string
  type_id: number
}

export interface UpdateTopicData {
  name?: string
  description?: string
  type_id?: number
}

export const useTopicsStore = defineStore('topics', () => {
  const topics = ref<Topic[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const topicsByType = computed(() => {
    const grouped = topics.value.reduce((acc, topic) => {
      if (!acc[topic.type_id]) {
        acc[topic.type_id] = {
          type_name: topic.type_name,
          type_color: topic.type_color,
          topics: []
        }
      }
      acc[topic.type_id].topics.push(topic)
      return acc
    }, {} as Record<number, { type_name: string; type_color: string; topics: Topic[] }>)
    
    return grouped
  })

  const getTopicsByTypeId = computed(() => {
    return (typeId: number) => {
      return topics.value.filter(topic => topic.type_id === typeId)
    }
  })

  const getTopicById = computed(() => {
    return (id: number) => {
      return topics.value.find(topic => topic.id === id)
    }
  })

  // Actions
  const fetchTopics = async (typeId?: number) => {
    loading.value = true
    error.value = null
    
    try {
      const params = typeId ? { type_id: typeId } : {}
      const response = await axios.get('/api/topics', { params })
      topics.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Laden der Themen'
      console.error('Fehler beim Laden der Themen:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTopicById = async (id: number): Promise<Topic | null> => {
    try {
      const response = await axios.get(`/api/topics/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Laden des Themas'
      console.error('Fehler beim Laden des Themas:', err)
      return null
    }
  }

  const createTopic = async (topicData: CreateTopicData): Promise<Topic | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/topics', topicData)
      const newTopic = response.data
      topics.value.push(newTopic)
      return newTopic
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Erstellen des Themas'
      console.error('Fehler beim Erstellen des Themas:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateTopic = async (id: number, topicData: UpdateTopicData): Promise<Topic | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.put(`/api/topics/${id}`, topicData)
      const updatedTopic = response.data
      
      const index = topics.value.findIndex(topic => topic.id === id)
      if (index !== -1) {
        topics.value[index] = updatedTopic
      }
      
      return updatedTopic
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Aktualisieren des Themas'
      console.error('Fehler beim Aktualisieren des Themas:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteTopic = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      await axios.delete(`/api/topics/${id}`)
      topics.value = topics.value.filter(topic => topic.id !== id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Löschen des Themas'
      console.error('Fehler beim Löschen des Themas:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    topics,
    loading,
    error,
    
    // Computed
    topicsByType,
    getTopicsByTypeId,
    getTopicById,
    
    // Actions
    fetchTopics,
    fetchTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
    clearError
  }
})
