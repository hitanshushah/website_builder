<template>
  <div class="space-y-4">
    <div v-if="!education || education.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🎓</span>
      <p>No education data available</p>
    </div>

    <UCard 
      v-for="edu in education" 
      :key="edu.id"
      class="bg-white dark:bg-gray-800"
    >
      <div class="p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ edu.degree }}</h4>
            <p class="text-blue-600 dark:text-blue-400 font-medium mb-1">{{ edu.university_name }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ formatDateRange(edu.from_date, edu.end_date) }}
            </p>
            <p v-if="edu.location" class="text-sm text-gray-500 dark:text-gray-400 mb-2">
              📍 {{ edu.location }}
            </p>
            <p v-if="edu.cgpa" class="text-sm text-gray-600 dark:text-gray-400">
              CGPA: {{ edu.cgpa }}
            </p>
          </div>
          <div class="flex gap-2 ml-4">
            <UButton size="sm" variant="ghost" color="neutral">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
            </UButton>
            <UButton size="sm" variant="ghost" color="error" @click="deleteEducation(edu)">
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>

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
import type { Education } from '@/types'

const props = defineProps<{
  education: Education[]
}>()

const emit = defineEmits<{
  (e: 'deleted', educationId: number): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')

const deleteEducation = (education: Education) => {
  deleteItemType.value = 'Education'
  deleteItemName.value = `${education.degree} from ${education.university_name}`
  deleteItemId.value = education.id
  deleteApi.value = '/api/education'
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  emit('deleted', deleteItemId.value)
}

const formatDateRange = (fromDate?: string, endDate?: string) => {
  if (!fromDate) return 'Date not specified'
  
  const start = new Date(fromDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
  
  if (!endDate) {
    return `${start} - Present`
  }
  
  const end = new Date(endDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
  
  return `${start} - ${end}`
}
</script>
