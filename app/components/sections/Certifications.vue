<template>
  <div class="space-y-4">
    <div v-if="!certifications || certifications.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🏆</span>
      <p>No certifications data available</p>
    </div>

    <UCard 
      v-for="cert in certifications" 
      :key="cert.id"
      class="bg-white dark:bg-gray-800"
    >
      <div class="p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ cert.name }}</h4>
            <p v-if="cert.institute_name" class="text-blue-600 dark:text-blue-400 font-medium mb-1">{{ cert.institute_name }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ formatDateRange(cert.start_date, cert.end_date) }}
            </p>
            <p v-if="cert.description" class="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {{ cert.description }}
            </p>
            <div v-if="cert.certificate_pdf" class="flex gap-2">
              <UButton
                size="sm"
                variant="outline"
                @click="downloadCertificate(cert.certificate_pdf, cert.name)"
              >
                <UIcon name="i-heroicons-document-arrow-down" class="w-4 h-4 mr-1" />
                Download Certificate
              </UButton>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <UButton size="sm" variant="ghost" color="neutral">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
            </UButton>
            <UButton size="sm" variant="ghost" color="error" @click="deleteCertification(cert)">
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
import type { Certification } from '@/types'

const props = defineProps<{
  certifications: Certification[]
}>()

const emit = defineEmits<{
  (e: 'deleted', certificationId: number): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')

const deleteCertification = (certification: Certification) => {
  deleteItemType.value = 'Certification'
  deleteItemName.value = certification.name
  deleteItemId.value = certification.id
  deleteApi.value = '/api/certifications'
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  emit('deleted', deleteItemId.value)
}

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate) return 'Date not specified'
  
  const start = new Date(startDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
  
  if (!endDate) {
    return `Issued: ${start}`
  }
  
  const end = new Date(endDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
  
  return `${start} - ${end}`
}

const downloadCertificate = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
