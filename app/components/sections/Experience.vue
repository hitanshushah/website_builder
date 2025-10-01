<template>
  <div class="space-y-4">
    <div v-if="!experiences || experiences.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">💼</span>
      <p>No experience data available</p>
    </div>

    <UCard 
      v-for="experience in experiences" 
      :key="experience.id"
      class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
    >
    <div>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-start gap-4 mb-3">
            <!-- Company Logo or Initials -->
            <div class="flex-shrink-0">
              <img 
                v-if="experience.company_logo" 
                :src="experience.company_logo" 
                :alt="experience.company_name"
                class="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-600 shadow-sm"
              />
              <div 
                v-else
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm"
              >
                {{ getCompanyInitials(experience.company_name) }}
              </div>
            </div>

            <div class="flex-1">
              <!-- Role + Company -->
              <div class="flex flex-wrap items-center gap-x-1">
                <h2 class="font-semibold text-gray-900 dark:text-white text-lg">
                  {{ experience.company_name }},
                </h2>
                <h4 class="font-semibold text-gray-900 dark:text-white text-md italic">
                  {{ experience.role }}
                </h4>
              </div>

              <!-- Date -->
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDateRange(experience.start_date, experience.end_date) }}
              </p>
            </div>
          </div>

          <!-- Skills -->
          <div v-if="experience.skills && experience.skills.length" class="flex flex-wrap gap-2 mb-3">
            <span 
              v-for="skill in experience.skills" 
              :key="skill"
              class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium"
            >
              {{ skill }}
            </span>
          </div>

          <!-- Description -->
          <p v-if="experience.description" class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ experience.description }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 ml-4">
          <UButton 
            size="sm" 
            variant="ghost" 
            :color="experience.hide_on_website ? 'warning' : 'success'"
            @click="toggleVisibility(experience)"
            :title="experience.hide_on_website ? 'Show on website' : 'Hide from website'"
          >
            <UIcon :name="experience.hide_on_website ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
          </UButton>
          <UButton size="sm" variant="ghost" color="neutral" @click="editExperience(experience)">
            <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
          </UButton>
          <UButton size="sm" variant="ghost" color="error" @click="deleteExperience(experience)">
            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
          </UButton>
        </div>
      </div>
    </div>
    </UCard>
  </div>

  <!-- Edit Experience Modal -->
  <FormsExperienceEditForm 
    v-if="editingExperience"
    :experience="editingExperience"
    @updated="handleExperienceUpdated"
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
import type { Experience } from '@/types'

const props = defineProps<{
  experiences: Experience[]
}>()

const emit = defineEmits<{
  (e: 'deleted', experienceId: number): void
  (e: 'updated', experience: Experience): void
  (e: 'visibilityToggled', experience: Experience): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')
const editingExperience = ref<Experience | null>(null)

const deleteExperience = (experience: Experience) => {
  deleteItemType.value = 'Experience'
  deleteItemName.value = `${experience.role} at ${experience.company_name}`
  deleteItemId.value = experience.id
  deleteApi.value = '/api/experiences'
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  emit('deleted', deleteItemId.value)
}

const editExperience = (experience: Experience) => {
  editingExperience.value = experience
}

const closeEditModal = () => {
  editingExperience.value = null
}

const handleExperienceUpdated = (updatedExperience: Experience) => {
  editingExperience.value = null
  emit('updated', updatedExperience)
}

const toggleVisibility = async (experience: Experience) => {
  try {
    const response = await $fetch<{ success: boolean; experience: Experience }>('/api/experiences.toggle', {
      method: 'POST',
      body: { id: experience.id }
    })
    
    if (response.success) {
      emit('visibilityToggled', response.experience)
    }
  } catch (error) {
    console.error('Error toggling experience visibility:', error)
  }
}

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate) return 'Date not specified'
  
  const start = new Date(startDate).toLocaleDateString('en-US', { 
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

const getCompanyInitials = (companyName: string) => {
  if (!companyName) return 'C'
  
  const words = companyName.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0]?.charAt(0).toUpperCase()
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}
</script>
