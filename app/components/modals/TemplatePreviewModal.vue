<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="bg-primary-100 dark:bg-primary-900 w-10 h-10 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-eye" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ templateName }}</h3>
            <p v-if="templateDescription" class="text-sm text-gray-600 dark:text-gray-400">{{ templateDescription }}</p>
          </div>
        </div>
        <UButton 
          color="neutral" 
          variant="ghost" 
          icon="i-heroicons-x-mark"
          @click="emit('close')"
          class="cursor-pointer"
        />
      </div>

      <!-- Image Content -->
      <div class="p-6 overflow-auto max-h-[calc(90vh-120px)]">
        <div class="flex justify-center">
          <img 
            v-if="imageUrl"
            :src="imageUrl" 
            :alt="templateName"
            class="max-w-full h-auto rounded-lg shadow-lg"
          />
          <div v-else class="flex flex-col items-center justify-center py-12 text-center">
            <UIcon name="i-lucide-image" class="w-16 h-16 text-gray-400 mb-4" />
            <p class="text-gray-600 dark:text-gray-400">No preview image available</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  templateName: string
  templateDescription?: string
  imageUrl?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>
