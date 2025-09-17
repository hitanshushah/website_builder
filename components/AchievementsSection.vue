<template>
  <div class="w-full">
    <div v-if="achievements.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-trophy text-4xl mb-4"></i>
      <p>No achievements available</p>
    </div>
    <div v-else class="space-y-6">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
        style="padding: 5px;"
      >

        <!-- Achievement Description -->
        <div class="flex items-start justify-between">
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed ml-5 flex-1">{{ achievement.description }}</p>
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            text
            rounded
            @click="deleteAchievement(achievement.id)"
            :title="`Delete achievement`"
            class="opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Dialog 
      v-model:visible="showConfirmModal" 
      modal 
      :header="confirmModalTitle" 
      :style="{ width: '400px' }"
    >
      <div class="text-center py-4">
        <p class="text-gray-700 dark:text-gray-300">
          {{ confirmModalMessage }}
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="Cancel" 
            severity="secondary" 
            @click="showConfirmModal = false"
          />
          <Button 
            label="Delete" 
            severity="danger"
            @click="confirmDelete"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Achievement } from '../types'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'

interface Props {
  achievements: Achievement[]
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Confirmation modal state
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const pendingDeleteId = ref<number | null>(null)

const deleteAchievement = (achievementId: number) => {
  const achievement = props.achievements.find(a => a.id === achievementId)
  if (!achievement) return

  pendingDeleteId.value = achievementId
  confirmModalTitle.value = 'Delete Achievement'
  confirmModalMessage.value = `Are you sure you want to delete this achievement?`
  showConfirmModal.value = true
}

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return

  try {
    const response = await $fetch<{success: boolean, message: string}>(`/api/achievements?id=${pendingDeleteId.value}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      emit('refresh')
    }
  } catch (error) {
    console.error('Error deleting achievement:', error)
    alert('Failed to delete achievement')
  } finally {
    showConfirmModal.value = false
    pendingDeleteId.value = null
  }
}
</script>
