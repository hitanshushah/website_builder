<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
      <!-- Header -->
      <div class="mb-4">
        <div class="flex items-center gap-3 mb-2">
          <div :class="willHide ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-green-100 dark:bg-green-900'" class="w-10 h-10 rounded-lg flex items-center justify-center">
            <UIcon 
              :name="willHide ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
              class="w-5 h-5" 
              :class="willHide ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'"
            />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ willHide ? 'Hide from Website' : 'Show on Website' }}
          </h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ willHide 
            ? 'This item will be hidden from your public website but will remain in your content.'
            : 'This item will be visible on your public website.'
          }}
        </p>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <div :class="willHide ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'" class="p-4 rounded-lg">
          <div class="flex items-start gap-3">
            <UIcon 
              name="i-heroicons-information-circle" 
              class="w-5 h-5 mt-0.5 flex-shrink-0"
              :class="willHide ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'"
            />
            <div class="text-sm" :class="willHide ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'">
              <p class="font-medium mb-1">{{ itemType }}: {{ itemName }}</p>
              <p class="text-xs">
                {{ willHide 
                  ? 'Visitors to your website will not be able to see this item.'
                  : 'This item will appear on your public profile.'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end space-x-3">
        <UButton 
          color="neutral" 
          variant="outline" 
          @click="emit('cancel')"
          class="cursor-pointer"
        >
          Cancel
        </UButton>
        <UButton 
          :color="willHide ? 'warning' : 'success'"
          @click="emit('confirm')"
          class="cursor-pointer"
        >
          {{ willHide ? 'Hide from Website' : 'Show on Website' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  itemType: string
  itemName: string
  willHide: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

