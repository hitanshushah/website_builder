<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8">
      <UForm :state="state" @submit.prevent="submitForm" class="space-y-4">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Achievements</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Enter your achievements, one per line</p>
        </div>

        <!-- Achievements Textarea -->
        <UFormField label="Achievements" help="Enter each achievement on a new line" required>
          <UTextarea 
            v-model="state.achievementsText" 
            placeholder="Enter your achievements, one per line&#10;Example:&#10;Won first place in coding competition&#10;Published research paper in IEEE&#10;Led team of 5 developers"
            :rows="8"
            class="resize-none"
          />
        </UFormField>

        <!-- Preview Section -->
        <div v-if="parsedAchievements.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Preview ({{ parsedAchievements.length }} achievement{{ parsedAchievements.length !== 1 ? 's' : '' }}):</h4>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div 
              v-for="(achievement, index) in parsedAchievements" 
              :key="index"
              class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded"
            >
              {{ index + 1 }}. {{ achievement }}
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-4">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="submit" color="primary" :loading="loading" :disabled="loading || parsedAchievements.length === 0">
            {{ loading ? 'Adding...' : `Add ${parsedAchievements.length} Achievement${parsedAchievements.length !== 1 ? 's' : ''}` }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'

const emit = defineEmits<{
  (e: 'save', data: AchievementData): void
  (e: 'close'): void
}>()

type AchievementData = {
  achievements: Array<{ description: string }>
}

const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Reactive state for UForm
const state = reactive({
  achievementsText: ''
})

// Parse achievements from textarea
const parsedAchievements = computed(() => {
  if (!state.achievementsText.trim()) return []
  
  return state.achievementsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(description => ({ description }))
})

const submitForm = async () => {
  if (parsedAchievements.value.length === 0) {
    error.value = 'Please enter at least one achievement'
    return
  }

  try {
    loading.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Prepare data for API
    const achievementData = {
      userId,
      achievements: parsedAchievements.value
    }

    const response = await $fetch('/api/achievements', {
      method: 'POST',
      body: achievementData
    })

    if (response.success) {
      toast.add({
        title: 'Achievements saved successfully',
        color: 'success'
      })
      emit('save', { achievements: parsedAchievements.value })
      emit('close')
    }
  } catch (err: any) {
    console.error('Error saving achievements:', err)
    
    // Show error toast
    toast.add({
      title: 'Failed to save achievements',
      color: 'error'
    })
    
    // Handle specific error cases for form display
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'User profile not found. Please try logging in again.'
    } else if (err.statusCode === 500) {
      error.value = 'Server error. Please try again later.'
    } else {
      error.value = err.data?.message || err.message || 'Failed to save achievements'
    }
  } finally {
    loading.value = false
  }
}
</script>
