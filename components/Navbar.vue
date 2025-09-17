<template>
  <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Website Buider
        </h1>
        <div v-if="userStore.isLoggedIn" class="flex items-center gap-4">
          <!-- User Profile Dropdown -->
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Avatar 
                v-if="userProfile?.profile_photo_url"
                :image="userProfile.profile_photo_url"
                size="normal" 
                shape="circle"
                class="border-2 border-gray-200 dark:border-gray-600"
              />
              <Avatar 
                v-else
                :label="userStore.user?.username?.charAt(0) || 'U'" 
                size="normal" 
                shape="circle"
                class="bg-primary border-2 border-gray-200 dark:border-gray-600"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ userStore.user?.username }}
              </span>
              <i class="pi pi-chevron-down text-xs text-gray-500"></i>
            </button>
            
            <!-- Dropdown Menu -->
            <div 
              v-if="showUserMenu" 
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
              <div class="py-1">
                <!-- User Info -->
                <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center gap-3">
                    <Avatar 
                      v-if="userProfile?.profile_photo_url"
                      :image="userProfile.profile_photo_url"
                      size="normal" 
                      shape="circle"
                      class="border-2 border-gray-200 dark:border-gray-600"
                    />
                    <Avatar 
                      v-else
                      :label="userStore.user?.username?.charAt(0) || 'U'" 
                      size="normal" 
                      shape="circle"
                      class="bg-primary border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {{ userStore.user?.username }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ userStore.user?.email }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Logout Button -->
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <i class="pi pi-sign-out"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import Avatar from 'primevue/avatar'
import type { UserProfile } from '../types'

interface Props {
  userProfile?: UserProfile | null
}

const props = defineProps<Props>()
const userStore = useUserStore()
const showUserMenu = ref(false)

const config = useRuntimeConfig()

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  userStore.clearUser()
  showUserMenu.value = false
  const logoutUrl = config.public.authentikLogoutUrl
  
  if (logoutUrl) {
    // Open logout URL in the same window
    window.location.href = logoutUrl
  } else {
    // Fallback to home page if no logout URL is configured
    navigateTo('/')
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
