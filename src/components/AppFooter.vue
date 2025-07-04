<template>
  <footer class="bg-gray-800 text-white mt-auto border-t border-gray-700">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <p class="text-sm text-gray-300">
          Entwickelt und bereitgestellt von 
          <span class="font-semibold text-white hover:text-blue-300 transition-colors">Daniel Duarte</span>
        </p>
        <p class="text-xs text-gray-400 mt-2">
          © {{ currentYear }} Syntagma - Regelwerk-Platform
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
