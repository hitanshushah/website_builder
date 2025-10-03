<script setup lang="ts">
const { data, loading, error, refetch } = useFetchTemplateData()
</script>

<template>
  <div class="w-full">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Website Templates</h2>
      <p class="text-gray-600 dark:text-gray-400">Preview your website with different templates.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Loading your data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
      <p class="text-red-700 dark:text-red-400 mb-4">{{ error }}</p>
      <UButton @click="refetch" color="red" variant="outline">
        Try Again
      </UButton>
    </div>

    <!-- Template Preview -->
    <div v-else-if="data" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <!-- Template Selector (for future multiple templates) -->
      <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Modern Template</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">A clean and professional design</p>
          </div>
          <UButton 
            icon="i-lucide-refresh-cw" 
            color="gray" 
            variant="outline"
            @click="refetch"
          >
            Refresh Data
          </UButton>
        </div>
      </div>

      <!-- Template Content -->
      <div class="relative">
        <!-- Scale container for preview -->
        <div class="w-full overflow-auto" style="max-height: 80vh;">
          <templatesModernTemplate :data="data" />
        </div>
      </div>
    </div>
  </div>
</template>