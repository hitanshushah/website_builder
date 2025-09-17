<template>
  <div class="w-full">
    <div v-if="certifications.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-certificate text-4xl mb-4"></i>
      <p>No certifications available</p>
    </div>
    <div v-else class="space-y-6">
      <div 
        v-for="cert in certifications" 
        :key="cert.id"
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
        style="padding: 24px;"
      >
        <!-- Certification Header -->
        <div class="flex items-start gap-6 mb-6">
          <div class="flex-1 w-full">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {{ cert.name }}
                </h3>
                <p v-if="cert.institute_name" class="text-lg text-primary font-medium mb-2">
                  {{ cert.institute_name }}
                </p>
                <div v-if="cert.start_date || cert.end_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div v-if="cert.start_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(cert.start_date) }}</span>
                  </div>
                  <div v-if="cert.end_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(cert.end_date) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Certificate on the right -->
              <div class="flex flex-wrap gap-2 ml-4 h-fit flex-row" style="height: fit-content;">
                <div v-if="cert.certificate_pdf" class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i :class="getFileIcon(cert.certificate_pdf)" style="color: green"></i>
                  <span class="text-sm text-black" style="color: black">Certificate Available</span>
                </div>
                <Button 
                  v-if="cert.certificate_pdf"
                  icon="pi pi-download"
                  label="Download"
                  outlined
                  size="small"
                  @click="openLink(cert.certificate_pdf)"
                  class="whitespace-nowrap"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  text
                  rounded
                  @click="deleteCertification(cert.id)"
                  :title="`Delete ${cert.name}`"
                  class="opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="cert.description" class="mb-4" style="margin-top: 10px !important;">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">
            Description
          </h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ cert.description }}</p>
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
import type { Certification } from '../types'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'

interface Props {
  certifications: Certification[]
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

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const getFileIcon = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'pi pi-file-pdf'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'pi pi-image'
    default:
      return 'pi pi-file'
  }
}

const deleteCertification = (certificationId: number) => {
  const certification = props.certifications.find(c => c.id === certificationId)
  if (!certification) return

  pendingDeleteId.value = certificationId
  confirmModalTitle.value = 'Delete Certification'
  confirmModalMessage.value = `Are you sure you want to delete "${certification.name}"?`
  showConfirmModal.value = true
}

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return

  try {
    const response = await $fetch<{success: boolean, message: string}>(`/api/certifications?id=${pendingDeleteId.value}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      emit('refresh')
    }
  } catch (error) {
    console.error('Error deleting certification:', error)
    alert('Failed to delete certification')
  } finally {
    showConfirmModal.value = false
    pendingDeleteId.value = null
  }
}
</script>
