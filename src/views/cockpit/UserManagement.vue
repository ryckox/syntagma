<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Benutzer verwalten</h1>
      <button
        @click="showCreateDialog = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
      >
        <PlusIcon class="h-5 w-5" />
        <span>Neuer Benutzer</span>
      </button>
    </div>

    <!-- Users List -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Benutzer
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              E-Mail
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rolle
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Erstellt
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-purple-100 text-purple-800': user.role === 'admin',
                  'bg-gray-100 text-gray-800': user.role === 'user'
                }"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-green-100 text-green-800': user.active,
                  'bg-red-100 text-red-800': !user.active
                }"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ user.active ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editUser(user)"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
              >
                Bearbeiten
              </button>
              <button
                @click="toggleUserStatus(user)"
                :class="{
                  'text-red-600 hover:text-red-900': user.active,
                  'text-green-600 hover:text-green-900': !user.active
                }"
                class="mr-3"
              >
                {{ user.active ? 'Deaktivieren' : 'Aktivieren' }}
              </button>
              <button
                @click="deleteUser(user.id)"
                class="text-red-600 hover:text-red-900"
                :disabled="user.id === currentUserId"
              >
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Dialog -->
    <div
      v-if="showCreateDialog || editingUser"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeDialog"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingUser ? 'Benutzer bearbeiten' : 'Neuen Benutzer erstellen' }}
          </h3>
          <form @submit.prevent="saveUser" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Benutzername</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">E-Mail</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div v-if="!editingUser">
              <label for="password" class="block text-sm font-medium text-gray-700">Passwort</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">Rolle</label>
              <select
                id="role"
                v-model="form.role"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">Benutzer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div class="flex items-center">
              <input
                id="active"
                v-model="form.active"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="active" class="ml-2 block text-sm text-gray-900">
                Benutzer ist aktiv
              </label>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeDialog"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {{ loading ? 'Speichern...' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const editingUser = ref(null)
const form = ref({
  username: '',
  email: '',
  password: '',
  role: 'user',
  active: true
})

const currentUserId = authStore.user?.id

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE')
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    user: 'Benutzer'
  }
  return labels[role] || role
}

const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/users')
    users.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error)
  }
}

const editUser = (user) => {
  editingUser.value = user
  form.value = {
    username: user.username,
    email: user.email,
    role: user.role,
    active: user.active,
    password: '' // Password not needed for editing
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingUser.value = null
  form.value = {
    username: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  }
}

const saveUser = async () => {
  loading.value = true
  try {
    if (editingUser.value) {
      const updateData = { ...form.value }
      delete updateData.password // Don't send password for updates
      await axios.put(`/api/users/${editingUser.value.id}`, updateData)
    } else {
      await axios.post('/api/users', form.value)
    }
    await fetchUsers()
    closeDialog()
  } catch (error) {
    console.error('Fehler beim Speichern des Benutzers:', error)
  } finally {
    loading.value = false
  }
}

const toggleUserStatus = async (user) => {
  try {
    await axios.put(`/api/users/${user.id}`, {
      ...user,
      active: !user.active
    })
    await fetchUsers()
  } catch (error) {
    console.error('Fehler beim Ändern des Benutzerstatus:', error)
  }
}

const deleteUser = async (id) => {
  if (id === currentUserId) {
    alert('Sie können sich nicht selbst löschen.')
    return
  }
  
  if (confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
    try {
      await axios.delete(`/api/users/${id}`)
      await fetchUsers()
    } catch (error) {
      console.error('Fehler beim Löschen des Benutzers:', error)
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
