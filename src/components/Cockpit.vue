<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Navigation -->
    <AppNavigation />
    
    <!-- Cockpit Sub-Navigation -->
    <nav class="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-200/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-14">
          <!-- Cockpit Label -->
          <div class="flex items-center space-x-2 mr-8">
            <div class="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-amber-800">Administration</span>
          </div>

          <!-- Cockpit Navigation Links -->
          <div class="hidden md:flex items-center space-x-1">
            <router-link
              :to="{ name: 'Dashboard' }"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:-translate-y-0.5"
              :class="$route.name === 'Dashboard' 
                ? 'text-amber-900 bg-amber-200/70 shadow-sm ring-1 ring-amber-300/50' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 hover:shadow-sm'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              <span class="ml-1.5">Dashboard</span>
            </router-link>
            
            <router-link
              :to="{ name: 'RulesetManagement' }"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:-translate-y-0.5"
              :class="$route.name?.toString().includes('Ruleset') 
                ? 'text-amber-900 bg-amber-200/70 shadow-sm ring-1 ring-amber-300/50' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 hover:shadow-sm'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="ml-1.5">Regelwerke</span>
            </router-link>
            
            <router-link
              :to="{ name: 'TypeManagement' }"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:-translate-y-0.5"
              :class="$route.name === 'TypeManagement' 
                ? 'text-amber-900 bg-amber-200/70 shadow-sm ring-1 ring-amber-300/50' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 hover:shadow-sm'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="ml-1.5">Typen</span>
            </router-link>
            
            <router-link
              :to="{ name: 'TopicManagement' }"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:-translate-y-0.5"
              :class="$route.name === 'TopicManagement' 
                ? 'text-amber-900 bg-amber-200/70 shadow-sm ring-1 ring-amber-300/50' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 hover:shadow-sm'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="ml-1.5">Themen</span>
            </router-link>
            
            <router-link
              :to="{ name: 'UserManagement' }"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:-translate-y-0.5"
              :class="$route.name === 'UserManagement' 
                ? 'text-amber-900 bg-amber-200/70 shadow-sm ring-1 ring-amber-300/50' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 hover:shadow-sm'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span class="ml-1.5">Benutzer</span>
            </router-link>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden ml-auto">
            <button
              @click="showMobileMenu = !showMobileMenu"
              class="p-2 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-if="showMobileMenu" class="md:hidden py-3 border-t border-amber-200/50">
          <div class="space-y-1">
            <router-link
              :to="{ name: 'Dashboard' }"
              class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="$route.name === 'Dashboard' 
                ? 'bg-amber-200/50 text-amber-900' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'"
              @click="showMobileMenu = false"
            >
              Dashboard
            </router-link>
            <router-link
              :to="{ name: 'RulesetManagement' }"
              class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="$route.name?.toString().includes('Ruleset')
                ? 'bg-amber-200/50 text-amber-900' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'"
              @click="showMobileMenu = false"
            >
              Regelwerke
            </router-link>
            <router-link
              :to="{ name: 'TypeManagement' }"
              class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="$route.name === 'TypeManagement'
                ? 'bg-amber-200/50 text-amber-900' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'"
              @click="showMobileMenu = false"
            >
              Typen
            </router-link>
            <router-link
              :to="{ name: 'TopicManagement' }"
              class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="$route.name === 'TopicManagement'
                ? 'bg-amber-200/50 text-amber-900' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'"
              @click="showMobileMenu = false"
            >
              Themen
            </router-link>
            <router-link
              :to="{ name: 'UserManagement' }"
              class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              :class="$route.name === 'UserManagement'
                ? 'bg-amber-200/50 text-amber-900' 
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'"
              @click="showMobileMenu = false"
            >
              Benutzer
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hauptinhalt -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <div class="px-4 sm:px-0 mb-6">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <div>
                <router-link :to="{ name: 'Dashboard' }" class="text-gray-400 hover:text-gray-500">
                  <HomeIcon class="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                  <span class="sr-only">Dashboard</span>
                </router-link>
              </div>
            </li>
            <li v-if="currentPageTitle">
              <div class="flex items-center">
                <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                <span class="ml-4 text-sm font-medium text-gray-500">{{ currentPageTitle }}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Page Content -->
      <div class="px-4 sm:px-0">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import AppNavigation from './AppNavigation.vue'

const router = useRouter()
const showMobileMenu = ref(false)

const currentPageTitle = computed(() => {
  const routeNames: Record<string, string> = {
    'Dashboard': 'Dashboard',
    'RulesetManagement': 'Regelwerke',
    'NewRuleset': 'Neues Regelwerk',
    'EditRuleset': 'Regelwerk bearbeiten',
    'TypeManagement': 'Typen verwalten',
    'TopicManagement': 'Themen verwalten',
    'UserManagement': 'Benutzer verwalten'
  }
  
  const routeName = router.currentRoute.value.name as string
  return routeNames[routeName] || routeName
})
</script>
