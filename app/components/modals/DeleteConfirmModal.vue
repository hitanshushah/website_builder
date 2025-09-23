<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
      <!-- Header -->
      <div class="mb-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="bg-red-100 dark:bg-red-900 w-10 h-10 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Delete {{ itemType }}</h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this {{ itemType.toLowerCase() }}? This action cannot be undone.
        </p>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div class="text-sm text-red-800 dark:text-red-200">
              <p class="font-medium mb-1">This will permanently remove:</p>
              <ul class="space-y-1 text-xs">
                <li>• {{ itemName }}</li>
                <li>• All associated data</li>
                <li>• This action cannot be undone</li>
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
          @click="emit('cancel')"
          :disabled="loading"
        >
          Cancel
        </UButton>
        <UButton 
          color="error" 
          @click="confirmDelete"
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? 'Deleting...' : 'Delete' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  itemType: string
  itemName: string
  itemId: number
  deleteApi: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'deleted'): void
}>()

const loading = ref(false)
const toast = useToast()

const confirmDelete = async () => {
  try {
    loading.value = true
    
    const response = await $fetch<{success: boolean}>(props.deleteApi, {
      method: 'DELETE',
      query: { id: props.itemId }
    })
    
    if (response.success) {
      toast.add({
        title: `${props.itemType} deleted successfully`,
        color: 'success'
      })
      emit('deleted')
    }
  } catch (err: any) {
    console.error(`Error deleting ${props.itemType.toLowerCase()}:`, err)
    toast.add({
      title: `Failed to delete ${props.itemType.toLowerCase()}`,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
