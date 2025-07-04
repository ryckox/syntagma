<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <div class="flex-grow">
      <router-view />
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppFooter from '@/components/AppFooter.vue'

const authStore = useAuthStore()

onMounted(() => {
  // Token beim App-Start validieren
  if (authStore.token) {
    authStore.validateToken()
  }
})
</script>
