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

      <!-- Nav Buttons -->
      <div class="flex items-center space-x-1">
        <UButton 
          :variant="currentRoute === '/' ? 'solid' : 'ghost'"
          :color="currentRoute === '/' ? 'neutral' : 'gray'"
          class="px-4 py-2 rounded-lg cursor-pointer"
          :class="currentRoute === '/' ? 'text-white dark:text-black' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
          @click="navigateTo('/')"
        >
          <UIcon name="i-heroicons-home" class="w-4 h-4 mr-2" :class="currentRoute === '/' ? 'text-white dark:text-black' : ''" />
          Dashboard
        </UButton>
        
        <UButton 
          :variant="currentRoute === '/settings' ? 'solid' : 'ghost'"
          :color="currentRoute === '/settings' ? 'neutral' : 'gray'"
          class="px-4 py-2 rounded-lg cursor-pointer"
          :class="currentRoute === '/settings' ? 'text-white dark:text-black' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
          @click="navigateTo('/settings')"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2" :class="currentRoute === '/settings' ? 'text-white dark:text-black' : ''" />
          Website Settings
        </UButton>
        
        <UButton 
          variant="ghost" 
          color="gray" 
          class="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 mr-2" />
          Live Website
        </UButton>
      </div>

      <!-- Right Side -->
      <div class="flex items-center space-x-4">
        <UButton 
          variant="ghost" 
          color="gray" 
          size="sm"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <UIcon name="i-heroicons-bell" class="w-5 h-5" />
        </UButton>
        
        <UButton 
          variant="ghost" 
          color="gray" 
          size="sm"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
        </UButton>
        
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center dark:bg-white">
          <span class="text-white font-medium text-sm dark:text-black">JD</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>
