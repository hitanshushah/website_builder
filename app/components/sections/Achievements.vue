<template>
  <div class="space-y-4">
    <div v-if="!achievements || achievements.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🏆</span>
      <p>No achievements data available</p>
    </div>

    <UCard 
      v-for="achievement in achievements" 
      :key="achievement.id"
      class="bg-white dark:bg-gray-800"
    >
      <div class="p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-3 flex-1">
            <div class="bg-yellow-100 dark:bg-yellow-900 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Achievement</h4>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ achievement.description }}
              </p>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <UButton size="sm" variant="ghost" color="neutral" @click="editAchievement(achievement)">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
            </UButton>
            <UButton size="sm" variant="ghost" color="error" @click="deleteAchievement(achievement)">
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </UButton>
          </div>
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
</script>
