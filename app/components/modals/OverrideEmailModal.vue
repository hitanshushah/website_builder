<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
      <!-- Warning Icon -->
      <div class="flex items-center justify-center mb-4">
        <div class="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
        {{ isCurrentlyOverridden ? 'Restore Primary Email?' : 'Override Primary Email?' }}
      </h3>

      <!-- Warning Message -->
      <div class="mb-6 space-y-2">
        <p v-if="isCurrentlyOverridden" class="text-sm text-gray-600 dark:text-gray-400 text-center">
          Your secondary email is currently displayed on your website instead of your primary email.
        </p>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400 text-center">
          This will display your <span class="font-semibold text-gray-900 dark:text-white">secondary email</span> 
          on your website instead of your <span class="font-semibold text-gray-900 dark:text-white">registered email</span>.
        </p>
        
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mt-3">
          <p class="text-xs text-yellow-800 dark:text-yellow-300">
            <span class="font-semibold">{{ isCurrentlyOverridden ? 'Current:' : 'Primary Email:' }}</span> {{ primaryEmail }}
          </p>
          <p class="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
            <span class="font-semibold">{{ isCurrentlyOverridden ? 'Will Show:' : 'Secondary Email:' }}</span> {{ secondaryEmail }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <UButton 
          color="neutral" 
          variant="outline"
          class="flex-1 cursor-pointer"
          @click="$emit('cancel')"
        >
          Cancel
        </UButton>
        <UButton 
          :color="isCurrentlyOverridden ? 'primary' : 'warning'"
          class="flex-1 cursor-pointer"
          @click="$emit('confirm')"
        >
          {{ isCurrentlyOverridden ? 'Restore Primary' : 'Override Email' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  primaryEmail: string
  secondaryEmail: string
  isCurrentlyOverridden: boolean
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

