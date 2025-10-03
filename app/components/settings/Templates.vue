<script setup lang="ts">
import type { Template } from '~/types'

const emit = defineEmits<{
  selectTemplate: [identifier: string]
}>()

const templates = ref<Template[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchTemplates = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $fetch<Template[]>('/api/templates')
    templates.value = response
  } catch (err) {
    console.error('Error fetching templates:', err)
    error.value = 'Failed to load templates. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTemplates()
})

const selectTemplate = (identifier: string) => {
  emit('selectTemplate', identifier)
}
</script>

<template>
  <div class="w-full">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose a Template</h2>
      <p class="text-gray-600 dark:text-gray-400">Select a template for your website.</p>
    </div>

    <!-- Loading State - 3 Skeletons -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 mb-4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
      <p class="text-red-700 dark:text-red-400 mb-4">{{ error }}</p>
      <UButton @click="fetchTemplates" color="red" variant="outline">
        Try Again
      </UButton>
    </div>

    <!-- Template Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="template in templates" 
        :key="template.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group"
      >
        <!-- Thumbnail -->
        <div class="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img 
            v-if="template.thumbnail"
            :src="template.thumbnail" 
            :alt="template.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="w-16 h-16 text-gray-400" />
          </div>
          
          <!-- Premium Badge -->
          <div v-if="template.is_premium" class="absolute top-2 right-2">
            <span class="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
              Premium
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ template.name }}</h3>
          <p v-if="template.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ template.description }}
          </p>
          
          <UButton 
            @click="selectTemplate(template.identifier)"
            color="primary"
            variant="solid"
            block
          >
            Select Template
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>