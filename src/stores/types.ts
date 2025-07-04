import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface Type {
  id: number
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}

export interface CreateTypeData {
  name: string
  description?: string
  color: string
}

export interface UpdateTypeData {
  name?: string
  description?: string
  color?: string
}

export const useTypesStore = defineStore('types', () => {
  const types = ref<Type[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const getTypeById = computed(() => {
    return (id: number) => {
      return types.value.find(type => type.id === id)
    }
  })

  const typeOptions = computed(() => {
    return types.value.map(type => ({
      id: type.id,
      name: type.name,
      color: type.color
    }))
  })

  // Actions
  const fetchTypes = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('/api/types')
      types.value = response.data.map((type: any) => ({
        ...type,
        id: Number(type.id)
      }))
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Laden der Typen'
      console.error('Fehler beim Laden der Typen:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTypeById = async (id: number): Promise<Type | null> => {
    try {
      const response = await axios.get(`/api/types/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Laden des Typs'
      console.error('Fehler beim Laden des Typs:', err)
      return null
    }
  }

  const createType = async (typeData: CreateTypeData): Promise<Type | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/types', typeData)
      const newType = response.data
      types.value.push(newType)
      return newType
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Erstellen des Typs'
      console.error('Fehler beim Erstellen des Typs:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateType = async (id: number, typeData: UpdateTypeData): Promise<Type | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.put(`/api/types/${id}`, typeData)
      const updatedType = response.data
      
      const index = types.value.findIndex(type => type.id === id)
      if (index !== -1) {
        types.value[index] = updatedType
      }
      
      return updatedType
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Aktualisieren des Typs'
      console.error('Fehler beim Aktualisieren des Typs:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteType = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      await axios.delete(`/api/types/${id}`)
      types.value = types.value.filter(type => type.id !== id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Fehler beim Löschen des Typs'
      console.error('Fehler beim Löschen des Typs:', err)
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
    types,
    loading,
    error,
    
    // Computed
    getTypeById,
    typeOptions,
    
    // Actions
    fetchTypes,
    fetchTypeById,
    createType,
    updateType,
    deleteType,
    clearError
  }
})
