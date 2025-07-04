<template>
  <nav class="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo Section -->
        <div class="flex items-center space-x-4">
          <router-link 
            to="/" 
            class="flex items-center space-x-3 group"
          >
            <div class="relative">
              <div class="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <!-- Gloss effect -->
                <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-blue-800 group-hover:to-indigo-800 transition-all duration-300">
                Syntagma
              </span>
              <span class="text-xs text-gray-500 -mt-1 group-hover:text-gray-600 transition-colors duration-300">
                Regelwerk-Platform
              </span>
            </div>
          </router-link>
        </div>

        <!-- Main Navigation -->
        <div class="hidden md:flex items-center space-x-2">
          <router-link
            to="/"
            class="nav-link"
            :class="$route.path === '/' 
              ? 'nav-link-active' 
              : 'nav-link-inactive'"
          >
            <HomeIcon class="w-4 h-4" />
            <span class="ml-2">Start</span>
          </router-link>
          
          <router-link
            to="/search"
            class="nav-link"
            :class="$route.path === '/search' 
              ? 'nav-link-active' 
              : 'nav-link-inactive'"
          >
            <MagnifyingGlassIcon class="w-4 h-4" />
            <span class="ml-2">Regelwerke</span>
          </router-link>

          <!-- Admin Navigation -->
          <template v-if="authStore.isAuthenticated && authStore.isAdmin">
            <div class="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-3"></div>
            <router-link
              to="/cockpit"
              class="nav-link nav-link-admin"
              :class="$route.path.startsWith('/cockpit')
                ? 'nav-link-admin-active'
                : 'nav-link-admin-inactive'"
            >
              <Cog8ToothIcon class="w-4 h-4" />
              <span class="ml-2">Cockpit</span>
              <div class="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </router-link>
          </template>
        </div>

        <!-- User Actions -->
        <div class="flex items-center space-x-4">
          <template v-if="authStore.isAuthenticated">
            <!-- User Info -->
            <div class="hidden sm:flex items-center space-x-3">
              <div class="text-right text-sm">
                <div class="font-semibold text-gray-900">{{ authStore.user?.username }}</div>
                <div class="text-xs text-gray-500 flex items-center">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                  {{ authStore.isAdmin ? 'Administrator' : 'Benutzer' }}
                </div>
              </div>
              <div class="relative group">
                <div class="w-9 h-9 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span class="text-white text-sm font-bold">
                    {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <!-- Online indicator -->
                <div class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
            </div>
            
            <!-- Logout Button -->
            <button
              @click="logout"
              class="user-action-btn user-action-btn-secondary group"
              title="Abmelden"
            >
              <ArrowRightOnRectangleIcon class="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span class="hidden sm:inline ml-2">Abmelden</span>
            </button>
          </template>
          
          <template v-else>
            <router-link
              to="/login"
              class="user-action-btn user-action-btn-primary group"
            >
              <UserIcon class="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span class="ml-2">Anmelden</span>
            </router-link>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="mobile-menu-btn"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
      <div class="px-4 py-4 space-y-2">
        <router-link 
          to="/" 
          class="mobile-nav-item"
          active-class="router-link-active"
          @click="mobileMenuOpen = false"
        >
          <HomeIcon class="w-5 h-5" />
          <span class="ml-3">Start</span>
        </router-link>
        
        <router-link 
          to="/search" 
          class="mobile-nav-item"
          active-class="router-link-active"
          @click="mobileMenuOpen = false"
        >
          <MagnifyingGlassIcon class="w-5 h-5" />
          <span class="ml-3">Regelwerke</span>
        </router-link>
        
        <template v-if="authStore.isAuthenticated && authStore.isAdmin">
          <div class="border-t border-gray-200/50 my-3 pt-3">
            <router-link 
              to="/cockpit" 
              class="mobile-nav-item bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700"
              active-class="router-link-active"
              @click="mobileMenuOpen = false"
            >
              <Cog8ToothIcon class="w-5 h-5" />
              <span class="ml-3">Cockpit</span>
            </router-link>
          </div>
        </template>
        
        <div class="border-t border-gray-200/50 my-3 pt-3">
          <template v-if="authStore.isAuthenticated">
            <div class="px-4 py-3 text-sm text-gray-700 bg-gray-50/80 rounded-xl backdrop-blur-sm">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-xs font-bold">
                    {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <div class="font-medium">{{ authStore.user?.username }}</div>
                  <div class="text-xs text-gray-500">{{ authStore.isAdmin ? 'Administrator' : 'Benutzer' }}</div>
                </div>
              </div>
            </div>
            <button
              @click="logout"
              class="w-full mt-2 flex items-center px-4 py-3 text-sm text-red-600 hover:text-red-800 hover:bg-red-50/80 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
              <span class="ml-3">Abmelden</span>
            </button>
          </template>
          <template v-else>
            <router-link 
              to="/login" 
              class="mobile-nav-item bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
              active-class="router-link-active"
              @click="mobileMenuOpen = false"
            >
              <UserIcon class="w-5 h-5" />
              <span class="ml-3">Anmelden</span>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  Cog8ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const logout = async () => {
  await authStore.logout()
  mobileMenuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
/* Navigation Links */
.nav-link {
  @apply inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative backdrop-blur-sm;
}

.nav-link-inactive {
  @apply text-gray-600 hover:text-gray-900 hover:bg-white/70 hover:shadow-md hover:shadow-blue-100/50;
}

.nav-link-active {
  @apply text-blue-700 bg-white shadow-md shadow-blue-200/50 ring-1 ring-blue-100;
}

.nav-link:hover {
  transform: translateY(-1px);
}

.nav-link-active::before {
  content: '';
  @apply absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full;
}

/* Admin Navigation */
.nav-link-admin {
  @apply relative;
}

.nav-link-admin-inactive {
  @apply bg-gradient-to-r from-amber-50/80 to-orange-50/80 text-amber-700 hover:from-amber-100 hover:to-orange-100 hover:text-amber-800 backdrop-blur-sm;
}

.nav-link-admin-active {
  @apply bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 shadow-md shadow-amber-200/50 ring-1 ring-amber-200;
}

/* User Action Buttons */
.user-action-btn {
  @apply inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm;
}

.user-action-btn-primary {
  @apply bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/25;
}

.user-action-btn-secondary {
  @apply bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 focus:ring-gray-500 shadow-md hover:shadow-lg border border-gray-200/50;
}

.user-action-btn:hover {
  transform: translateY(-1px);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  @apply inline-flex items-center justify-center p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 backdrop-blur-sm;
}

.mobile-menu-btn:hover {
  transform: scale(1.05);
}

/* Mobile Navigation */
.mobile-nav-item {
  @apply flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-white/70 transition-all duration-200 backdrop-blur-sm;
}

.mobile-nav-item.router-link-active {
  @apply text-blue-700 bg-blue-50/80 backdrop-blur-sm;
}
</style>


