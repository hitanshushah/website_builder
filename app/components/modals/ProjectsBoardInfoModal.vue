<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
        <!-- Header -->
        <div class="mb-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-blue-100 dark:bg-blue-900 w-10 h-10 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-code-bracket" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Cannot see your information here?</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Go to Projects Board to add your profile picture, documents, bio, designation, projects, and other information.
          </p>
        </div>
  
        <!-- Content -->
        <div class="mb-6">
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-blue-800 dark:text-blue-200">
                <p class="font-medium mb-1">What you can do in Projects Board:</p>
                <ul class="space-y-1 text-xs">
                  <li>• Profile picture</li>
                  <li>• Address details</li>
                  <li>• Social media links and website URLs</li>
                  <li>• Documents (resume, cover letter, other)</li>
                  <li>• Bio and Professional designation</li>
                  <li>• Create and manage projects</li>
                  <li>• Add project links and descriptions</li>
                  <li>• Upload project documents and media</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Buttons -->
        <div class="flex justify-end space-x-3">
          <UButton 
            color="neutral" 
            variant="outline" 
            @click="emit('close')"
            class="cursor-pointer"
          >
            Close
          </UButton>
          <UButton 
            color="primary" 
            @click="goToProjectsBoard"
            class="cursor-pointer"
          >
            Go to Projects Board
          </UButton>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const emit = defineEmits<{
    (e: 'close'): void
  }>()
  
  
  const goToProjectsBoard = () => {
    // Navigate to projects board
    window.open('https://projectsboard.live', '_blank')
    emit('close')
  }
  </script>
  