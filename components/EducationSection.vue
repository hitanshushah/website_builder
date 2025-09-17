<template>
  <div class="w-full">
    <div v-if="education.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-graduation-cap text-4xl mb-4"></i>
      <p>No education records available</p>
    </div>
    <div v-else class="space-y-6">
      <div 
        v-for="edu in education" 
        :key="edu.id"
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
        style="padding: 24px;"
      >
        <!-- Education Header -->
        <div class="flex items-start gap-6 mb-6">
          <Avatar 
            :label="edu.university_name.charAt(0)" 
            size="xlarge" 
            shape="circle"
            class="flex-shrink-0 bg-primary"
          />
          <div class="flex-1 w-full ml-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {{ edu.degree }}
                </h3>
                <p class="text-lg text-primary font-medium mb-2">
                  {{ edu.university_name }}
                </p>
                <div v-if="edu.location" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <i class="pi pi-map-marker text-sm"></i>
                  <span class="text-sm">{{ edu.location }}</span>
                </div>
                <div v-if="edu.from_date || edu.end_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <div v-if="edu.from_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(edu.from_date) }}</span>
                  </div>
                  <div v-if="edu.end_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(edu.end_date) }}</span>
                  </div>
                  <div v-else class="flex items-center gap-1">
                    <Tag value="Ongoing" severity="success" class="text-xs" />
                  </div>
                </div>
                <div v-if="edu.cgpa" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <i class="pi pi-star text-sm"></i>
                  <span class="font-medium">CGPA: {{ edu.cgpa }}</span>
                </div>
              </div>
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                rounded
                @click="deleteEducation(edu.id)"
                :title="`Delete ${edu.degree} from ${edu.university_name}`"
                class="opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
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
import type { Education } from '../types'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'

interface Props {
  education: Education[]
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

const deleteEducation = (educationId: number) => {
  const education = props.education.find(e => e.id === educationId)
  if (!education) return

  pendingDeleteId.value = educationId
  confirmModalTitle.value = 'Delete Education'
  confirmModalMessage.value = `Are you sure you want to delete "${education.degree}" from "${education.university_name}"?`
  showConfirmModal.value = true
}

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return

  try {
    const response = await $fetch<{success: boolean, message: string}>(`/api/education?id=${pendingDeleteId.value}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      emit('refresh')
    }
  } catch (error) {
    console.error('Error deleting education:', error)
    alert('Failed to delete education record')
  } finally {
    showConfirmModal.value = false
    pendingDeleteId.value = null
  }
}
</script>
