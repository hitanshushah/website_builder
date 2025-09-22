<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Your Website</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Professional Portfolio Template</p>
      </div>
      <UBadge color="green" variant="soft" class="ml-4">
        Published
      </UBadge>
    </div>

    <!-- Website Preview -->
    <div class="mb-6">
      <UCard class="overflow-hidden">
        <!-- Browser Header -->
        <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300">Live Preview</span>
        </div>
        
        <!-- Website Content Preview -->
        <div class="p-8 bg-white dark:bg-gray-800">
          <!-- Hero Section -->
          <div class="text-center mb-8">
            <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4"></div>
            <div class="h-1 bg-black dark:bg-white mb-2"></div>
            <div class="h-0.5 bg-gray-400 dark:bg-gray-500 mb-6"></div>
          </div>
          
          <!-- Content Blocks -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-100 dark:bg-gray-700 h-20 rounded"></div>
            <div class="bg-gray-100 dark:bg-gray-700 h-20 rounded"></div>
          </div>
          
          <!-- Text Lines -->
          <div class="mt-4 space-y-2">
            <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-3 mb-6">
      <UButton variant="outline" color="gray" class="flex-1">
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
        Change Website
      </UButton>
      <UButton color="primary" class="flex-1 bg-gradient-to-r from-purple-500 to-blue-600">
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 mr-2" />
        Go to Website
      </UButton>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-3 gap-4 text-sm">
      <div>
        <span class="text-gray-500 dark:text-gray-400">Template:</span>
        <p class="font-medium text-gray-900 dark:text-white">Professional</p>
      </div>
      <div>
        <span class="text-gray-500 dark:text-gray-400">Status:</span>
        <p class="font-medium text-green-600 dark:text-green-400">Live</p>
      </div>
      <div>
        <span class="text-gray-500 dark:text-gray-400">Updated:</span>
        <p class="font-medium text-gray-900 dark:text-white">2 hours ago</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic can be added here if needed
</script>
