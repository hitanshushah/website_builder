<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
        <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-4">
          <!-- Header -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Achievements</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Enter your achievements one by one</p>
          </div>
  
          <!-- Single Achievement Input -->
          <UFormField label="Achievement" required>
            <div class="flex space-x-2">
              <UInput
                v-model="currentAchievement"
                placeholder="Enter an achievement"
                class="flex-1"
                @keyup.enter="addAchievement"
              />
              <UButton type="button" color="primary" @click="addAchievement" :disabled="!currentAchievement.trim()">
                Add
              </UButton>
            </div>
          </UFormField>
  
          <!-- Added Achievements List -->
          <div v-if="achievements.length" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Achievements Added:</h4>
            <div class="max-h-48 overflow-y-auto space-y-1">
              <div
                v-for="(achievement, index) in achievements"
                :key="index"
                class="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded"
              >
                <span>{{ index + 1 }}. {{ achievement.description }}</span>
                <UButton type="button" size="sm" color="error" @click="removeAchievement(index)">
                  Remove
                </UButton>
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
            <UButton type="button" color="primary" :loading="loading" :disabled="loading || (!achievements.length && !currentAchievement.trim())" @click="submitForm">
              {{ loading ? 'Saving...' : 'Save Achievements' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useUserStore } from '../../../stores/user'
  
  const emit = defineEmits<{
    (e: 'save', data: { achievements: Array<{ description: string }> }): void
    (e: 'close'): void
  }>()
  
  const userStore = useUserStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()
  
  // Required dummy state for <UForm>
  const state = reactive({})
  
  const currentAchievement = ref('')
  const achievements = reactive<Array<{ description: string }>>([])
  
  const addAchievement = () => {
    const trimmed = currentAchievement.value.trim()
    if (!trimmed) return
    achievements.push({ description: trimmed })
    currentAchievement.value = ''
  }
  
  const removeAchievement = (index: number) => {
    achievements.splice(index, 1)
  }
  
  const submitForm = async () => {
    try {
      loading.value = true
      error.value = null
  
      // Determine what to send
      let toSend: Array<{ description: string }> = []
  
      if (achievements.length > 0) {
        // Send only added achievements
        toSend = [...achievements]
      } else if (currentAchievement.value.trim()) {
        // No added achievements, send current input
        toSend = [{ description: currentAchievement.value.trim() }]
      }
  
      if (!toSend.length) {
        error.value = 'Please enter at least one achievement'
        return
      }
  
      const userId = userStore.user?.id
      if (!userId) throw new Error('User not authenticated')
  
      const achievementData = { userId, achievements: toSend }
  
      const response = await $fetch('/api/achievements', {
        method: 'POST',
        body: achievementData
      })
  
      if (response.success) {
        toast.add({
          title: 'Achievements saved successfully',
          color: 'success'
        })
        emit('save', { achievements: toSend })
  
        // Reset form
        currentAchievement.value = ''
        achievements.splice(0)
        emit('close')
      }
    } catch (err: any) {
      console.error(err)
      toast.add({ title: 'Failed to save achievements', color: 'error' })
      error.value = err.message || 'Failed to save achievements'
    } finally {
      loading.value = false
    }
  }
  </script>
  