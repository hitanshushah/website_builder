<template>
  <div class="space-y-4">
    <div v-if="!certifications || certifications.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🏆</span>
      <p>No certifications data available</p>
    </div>

    <UCard 
      v-for="cert in certifications" 
      :key="cert.id"
      class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div class="flex justify-between items-start flex-col md:flex-row gap-4 md:gap-0">
        <!-- Certification Info -->
        <div class="flex-1 space-y-1">
          <!-- Certificate Name and Institute on same line -->
          <div class="flex flex-wrap items-baseline gap-2">
            <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ cert.name }},</h4>
            <p v-if="cert.institute_name" class="text-gray-900 dark:text-white font-medium">{{ cert.institute_name }}</p>
          </div>

          <!-- Date -->
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ formatDateRange(cert.start_date, cert.end_date) }}
          </p>

          <!-- Description -->
          <p v-if="cert.description" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ cert.description }}
          </p>

          <!-- Download Button -->
          <div v-if="cert.certificate_pdf" class="flex gap-2 mt-2">
            <UButton
              size="sm"
              color="neutral"
              variant="subtle"
              @click="downloadCertificate(cert.certificate_pdf, cert.name)"
            >
              <UIcon name="i-heroicons-document-arrow-down" class="w-4 h-4 mr-1 cursor-pointer" />
              Download Certificate
            </UButton>
          </div>
        </div>

        <!-- Action Buttons -->
        <ActionButtons 
          :item="cert"
          item-type="Certification"
          :item-name="cert.name"
          @toggle-visibility="toggleVisibility"
          @edit="editCertification"
          @delete="deleteCertification"
        />
      </div>
    </UCard>

  </div>

  <!-- Edit Certification Modal -->
  <FormsCertificationEditForm 
    v-if="editingCertification"
    :certification="editingCertification"
    @updated="handleCertificationUpdated"
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
import type { Certification } from '@/types'

const props = defineProps<{
  certifications: Certification[]
}>()

const emit = defineEmits<{
  (e: 'deleted', certificationId: number): void
  (e: 'updated', certification: Certification): void
  (e: 'visibilityToggled', certification: Certification): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')
const editingCertification = ref<Certification | null>(null)

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

const editCertification = (certification: Certification) => {
  editingCertification.value = certification
}

const closeEditModal = () => {
  editingCertification.value = null
}

const handleCertificationUpdated = (updatedCertification: Certification) => {
  editingCertification.value = null
  emit('updated', updatedCertification)
}

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate) return ''
  
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

const toggleVisibility = async (certification: Certification) => {
  try {
    const response = await $fetch<{ success: boolean; certification: Certification }>('/api/certifications.toggle', {
      method: 'POST',
      body: { id: certification.id }
    })
    
    if (response.success) {
      emit('visibilityToggled', response.certification)
    }
  } catch (error) {
    console.error('Error toggling certification visibility:', error)
  }
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
