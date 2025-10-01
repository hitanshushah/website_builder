<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-4">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Achievement</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your achievement details</p>
        </div>

        <!-- Achievement Description -->
        <UFormField label="Achievement" required>
          <UTextarea
            v-model="state.description"
            placeholder="Enter achievement description"
            :rows="4"
            class="flex-1 w-full"
          />
        </UFormField>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-4">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="button" color="primary" :loading="loading" :disabled="loading || !state.description.trim()" @click="submitForm">
            {{ loading ? 'Updating...' : 'Update Achievement' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Achievement } from '@/types'

const props = defineProps<{
  achievement: Achievement
}>()

const emit = defineEmits<{
  (e: 'updated', achievement: Achievement): void
  (e: 'close'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Reactive state for UForm
const state = reactive({
  description: props.achievement.description || ''
})

const submitForm = async () => {
  try {
    loading.value = true
    error.value = null

    if (!state.description.trim()) {
      error.value = 'Achievement description is required'
      return
    }

    const response = await $fetch('/api/achievements', {
      method: 'PUT',
      body: {
        id: props.achievement.id,
        description: state.description.trim()
      }
    })

    if (response.success) {
      toast.add({
        title: 'Achievement updated successfully',
        color: 'success'
      })
      emit('updated', response.achievement)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error updating achievement:', err)
    
    toast.add({
      title: 'Failed to update achievement',
      color: 'error'
    })
    
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'Achievement not found'
    } else {
      error.value = err.data?.message || err.message || 'Failed to update achievement'
    }
  } finally {
    loading.value = false
  }
}
</script>
