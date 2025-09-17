<template>
  <div class="w-full">
    <div v-if="experiences.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-building text-4xl mb-4"></i>
      <p>No experience available</p>
    </div>
    <div v-else class="space-y-6">
      <div 
        v-for="experience in experiences" 
        :key="experience.id"
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
        style="padding: 24px;"
      >
        <!-- Experience Header -->
        <div class="flex items-start gap-6 mb-6">
          <Avatar 
            v-if="experience.company_logo" 
            :image="experience.company_logo" 
            size="xlarge" 
            shape="circle"
            class="flex-shrink-0"
          />
          <Avatar 
            v-else 
            :label="experience.company_name.charAt(0)" 
            size="xlarge" 
            shape="circle"
            class="flex-shrink-0 bg-primary"
          />
          <div class="flex-1 w-full ml-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {{ experience.role }}
                </h3>
                <p class="text-lg text-primary font-medium mb-2">
                  {{ experience.company_name }}
                </p>
                <div v-if="experience.location" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <i class="pi pi-map-marker text-sm"></i>
                  <span class="text-sm">{{ experience.location }}</span>
                </div>
                <div v-if="experience.start_date || experience.end_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div v-if="experience.start_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(experience.start_date) }}</span>
                  </div>
                  <div v-if="experience.end_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(experience.end_date) }}</span>
                  </div>
                  <div v-else class="flex items-center gap-1">
                    <Tag value="Current" severity="success" class="text-xs" />
                  </div>
                </div>
              </div>
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                rounded
                @click="deleteExperience(experience.id)"
                :title="`Delete ${experience.role} at ${experience.company_name}`"
                class="opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="experience.description" class="mb-4" style="margin-top: 10px !important;">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">
            Description
          </h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ experience.description }}</p>
        </div>

        <!-- Skills -->
        <div v-if="experience.skills && experience.skills.length > 0" class="mb-4">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2" style="margin-bottom: 10px !important;">
            Skills
          </h4>
          <div class="flex flex-wrap gap-2">
            <Tag 
              v-for="skill in experience.skills" 
              :key="skill"
              :value="skill"
              severity="info"
              class="text-xs"
            />
          </div>
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
import type { Experience } from '../types'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'

interface Props {
  experiences: Experience[]
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const deleteExperience = (experienceId: number) => {
  const experience = props.experiences.find(e => e.id === experienceId)
  if (!experience) return

  pendingDeleteId.value = experienceId
  confirmModalTitle.value = 'Delete Experience'
  confirmModalMessage.value = `Are you sure you want to delete "${experience.role}" at "${experience.company_name}"?`
  showConfirmModal.value = true
}

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return

  try {
    const response = await $fetch<{success: boolean, message: string}>(`/api/experiences?id=${pendingDeleteId.value}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      emit('refresh')
    }
  } catch (error) {
    console.error('Error deleting experience:', error)
    alert('Failed to delete experience')
  } finally {
    showConfirmModal.value = false
    pendingDeleteId.value = null
  }
}
</script>
