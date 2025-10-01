<template>
  <div class="space-y-4">
    <div v-if="!education || education.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🎓</span>
      <p>No education data available</p>
    </div>

  <UCard 
    v-for="edu in education" 
    :key="edu.id"
    class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
  >
    <div class="flex justify-between items-start">
      <!-- Education Info -->
      <div class="flex-1 space-y-1">
        <!-- Degree and University on same line -->
        <div class="flex flex-wrap items-baseline gap-1">
          <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ edu.degree }},</h4>
          <p class="text-gray-900 dark:text-white font-medium">{{ edu.university_name }}</p>
        </div>

        <!-- Location and Date -->
        <div class="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
          <span v-if="edu.location"> {{ edu.location }}</span>
          <span>{{ formatDateRange(edu.from_date, edu.end_date) }}</span>
        </div>

        <!-- CGPA -->
        <p v-if="edu.cgpa" class="text-sm text-gray-600 dark:text-gray-400">
          CGPA: {{ edu.cgpa }}
        </p>
      </div>

      <!-- Action Buttons -->
      <ActionButtons 
        :item="edu"
        item-type="Education"
        :item-name="`${edu.degree} from ${edu.university_name}`"
        @toggle-visibility="toggleVisibility"
        @edit="editEducation"
        @delete="deleteEducation"
      />
    </div>
  </UCard>


  </div>

  <!-- Edit Education Modal -->
  <FormsEducationEditForm 
    v-if="editingEducation"
    :education="editingEducation"
    @updated="handleEducationUpdated"
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
import type { Education } from '@/types'

const props = defineProps<{
  education: Education[]
}>()

const emit = defineEmits<{
  (e: 'deleted', educationId: number): void
  (e: 'updated', education: Education): void
  (e: 'visibilityToggled', education: Education): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')
const editingEducation = ref<Education | null>(null)

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

const editEducation = (education: Education) => {
  editingEducation.value = education
}

const closeEditModal = () => {
  editingEducation.value = null
}

const handleEducationUpdated = (updatedEducation: Education) => {
  editingEducation.value = null
  emit('updated', updatedEducation)
}

const toggleVisibility = async (education: Education) => {
  try {
    const response = await $fetch<{ success: boolean; education: Education }>('/api/education.toggle', {
      method: 'POST',
      body: { id: education.id }
    })
    
    if (response.success) {
      emit('visibilityToggled', response.education)
    }
  } catch (error) {
    console.error('Error toggling education visibility:', error)
  }
}

const formatDateRange = (fromDate?: string, endDate?: string) => {
  if (!fromDate) return ''
  
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
