<template>
  <div class="space-y-4">
    <div v-if="!achievements || achievements.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🏆</span>
      <p>No achievements data available</p>
    </div>

  <UCard class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
    <div class="space-y-3">

      <div v-for="(achievement, index) in achievements" :key="achievement.id" class="flex justify-between items-start">
        <!-- Achievement Description with numbering -->
        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {{ index + 1 }}. {{ achievement.description }}
        </p>

        <!-- Action Buttons -->
        <ActionButtons 
          :item="achievement"
          item-type="Achievement"
          :item-name="achievement.description"
          @toggle-visibility="toggleVisibility"
          @edit="editAchievement"
          @delete="deleteAchievement"
        />
      </div>
    </div>
  </UCard>

  </div>

  <!-- Edit Achievement Modal -->
  <FormsAchievementEditForm 
    v-if="editingAchievement"
    :achievement="editingAchievement"
    @updated="handleAchievementUpdated"
    @close="closeEditModal"
  />

  <!-- Delete Confirmation Modal -->
  <ModalsDeleteConfirmModal 
    v-if="showDeleteModal"
    :item-type="deleteItemType"
    :item-name="deleteItemName"
    :item-id="deleteItemId"
    :delete-api="deleteApi"
    @cancel="closeDeleteModal"
    @deleted="handleDeleteSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Achievement } from '@/types'

const props = defineProps<{
  achievements: Achievement[]
}>()

const emit = defineEmits<{
  (e: 'deleted', achievementId: number): void
  (e: 'updated', achievement: Achievement): void
  (e: 'visibilityToggled', achievement: Achievement): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')
const editingAchievement = ref<Achievement | null>(null)

const deleteAchievement = (achievement: Achievement) => {
  deleteItemType.value = 'Achievement'
  deleteItemName.value = achievement.description
  deleteItemId.value = achievement.id
  deleteApi.value = '/api/achievements'
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  emit('deleted', deleteItemId.value)
}

const editAchievement = (achievement: Achievement) => {
  editingAchievement.value = achievement
}

const closeEditModal = () => {
  editingAchievement.value = null
}

const handleAchievementUpdated = (updatedAchievement: Achievement) => {
  editingAchievement.value = null
  emit('updated', updatedAchievement)
}

const toggleVisibility = async (achievement: Achievement) => {
  try {
    const response = await $fetch<{ success: boolean; achievement: Achievement }>('/api/achievements.toggle', {
      method: 'POST',
      body: { id: achievement.id }
    })
    
    if (response.success) {
      emit('visibilityToggled', response.achievement)
    }
  } catch (error) {
    console.error('Error toggling achievement visibility:', error)
  }
}
</script>
