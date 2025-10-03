<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Disable default layout - render as standalone page
definePageMeta({
  layout: false
})

const route = useRoute()
const { data: templateData, loading } = useFetchTemplateData()

// Dynamically load template component
const templateComponent = computed(() => {
  const identifier = route.params.template as string
  if (!identifier) return null
  const name = identifier.charAt(0).toUpperCase() + identifier.slice(1)
  return defineAsyncComponent(() => import(`../../components/templates/${name}.vue`))
})
</script>

<template>
  <!-- No wrapping div, no layout, no navbar - pure template rendering -->
  
  <!-- Loading State -->
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400 text-lg">Loading your website...</p>
    </div>
  </div>

  <!-- Pure Template Content - renders as standalone website -->
  <component v-else-if="templateData && templateComponent" :is="templateComponent" :data="templateData" />
  
  <!-- Error State -->
  <div v-else class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center max-w-md mx-auto px-6">
      <div class="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Template Not Found</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">The requested template could not be loaded.</p>
      <UButton to="/settings" color="primary" size="lg">
        Back to Settings
      </UButton>
    </div>
  </div>
</template>
