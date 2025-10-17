<template>
  <nav class="bg-white border-b border-gray-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">W</span>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">Website Builder</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Professional CMS</p>
        </div>
      </div>

      <!-- Nav Buttons (Desktop only) -->
      <div class="hidden lg:flex items-center space-x-1">
        <UButton 
          :variant="currentRoute === '/' ? 'solid' : 'ghost'"
          :color="currentRoute === '/' ? 'neutral' : 'gray'"
          class="px-4 py-2 rounded-lg cursor-pointer"
          :class="currentRoute === '/' ? 'text-white dark:text-black' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
          @click="navigateTo('/')"
        >
          <UIcon name="i-heroicons-home" class="w-4 h-4 mr-2" />
          Dashboard
        </UButton>
        
        <UButton 
          :variant="currentRoute === '/settings' ? 'solid' : 'ghost'"
          :color="currentRoute === '/settings' ? 'neutral' : 'gray'"
          class="px-4 py-2 rounded-lg cursor-pointer"
          :class="currentRoute === '/settings' ? 'text-white dark:text-black' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
          @click="navigateTo('/settings')"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2" />
          Website Settings
        </UButton>

        <UButton 
          :variant="currentRoute === '/website' ? 'solid' : 'ghost'"
          :color="currentRoute === '/website' ? 'neutral' : 'gray'"
          class="px-4 py-2 rounded-lg cursor-pointer"
          :class="currentRoute === '/website' ? 'text-white dark:text-black' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
          @click="navigateTo('/website')"
        >
          <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 mr-2" />
          Live Website
        </UButton>

        <UButton 
          :variant="currentRoute === '/pricing' ? 'solid' : 'ghost'"
          :color="currentRoute === '/pricing' ? 'neutral' : 'gray'"
          size="md"
          class="cursor-pointer"
          :class="currentRoute === '/pricing' ? 'text-white dark:text-black' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
          icon="i-heroicons-credit-card"
          @click="navigateTo('/pricing')"
        >
          Pricing Plans
        </UButton>
      </div>

      <!-- Profile Dropdown (visible on all screens) -->
      <div class="flex items-center space-x-4">
        <UDropdownMenu :items="dropdownItems">
          <UButton variant="ghost" color="neutral" class="cursor-pointer">
            <UAvatar
              v-if="templateData?.userProfile?.profile_photo_url"
              :src="templateData.userProfile.profile_photo_url"
              size="2xl"
              rounded
            />
            <div 
              v-else
              class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center dark:bg-white"
            >
              <span class="text-white font-medium text-sm dark:text-black">{{ userInitials }}</span>
            </div>
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useFetchTemplateData } from '../composables/useTemplateData'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const currentRoute = computed(() => route.path)

const userStore = useUserStore()
const { data: templateData } = useFetchTemplateData(userStore.user?.id)

const config = useRuntimeConfig()
const logoutUrl = config.public.authentikLogoutUrl || '/logout'

const userInitials = computed(() => {
  const userProfile = templateData.value?.userProfile
  if (!userProfile) return 'U'
  return userProfile.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : userProfile.username?.charAt(0).toUpperCase() || 'U'
})

// Reactive window width for responsive behavior
const windowWidth = ref(0)

onMounted(() => {
  if (process.client) {
    windowWidth.value = window.innerWidth
    window.addEventListener('resize', () => {
      windowWidth.value = window.innerWidth
    })
  }
})

// Dropdown items - conditional based on screen size
const dropdownItems = computed(() => {
  const isMobile = windowWidth.value < 1024
  
  if (isMobile) {
    // On mobile, show all navigation items
    return [
      [
        { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
        { label: 'Website Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' },
        { label: 'Live Website', icon: 'i-heroicons-globe-alt', to: '/website' },
        { label: 'Pricing Plans', icon: 'i-heroicons-credit-card', to: '/pricing' }
      ],
      [
        { label: 'Logout', icon: 'i-lucide-log-out', to: logoutUrl }
      ]
    ]
  } else {
    // On desktop, only show logout
    return [
      [
        { label: 'Logout', icon: 'i-lucide-log-out', to: logoutUrl }
      ]
    ]
  }
})
</script>
