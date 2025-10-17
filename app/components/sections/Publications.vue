<template>
  <div class="space-y-4">
    <div v-if="!publications || publications.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">📚</span>
      <p>No publications data available</p>
    </div>

    <UCard 
      v-for="publication in publications" 
      :key="publication.id"
      class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div>
        <div class="flex items-start justify-between flex-col md:flex-row gap-4 md:gap-0">
          <div class="flex items-start space-x-3 flex-1">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ publication.paper_name }}</h4>
              <p v-if="publication.conference_name" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {{ publication.conference_name }}
                <span v-if="publication.published_date" class="ml-2">
                  • {{ formatDate(publication.published_date) }}
                </span>
              </p>
              <p v-if="publication.description" class="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
                {{ publication.description }}
              </p>
              <div class="flex space-x-2">
                <UButton 
                  v-if="publication.paper_link"
                  size="xs" 
                  variant="subtle" 
                  class="cursor-pointer"
                  color="neutral"
                  @click="openLink(publication.paper_link)"
                >
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3 mr-1" />
                  View Paper
                </UButton>
                <UButton 
                  v-if="publication.paper_pdf"
                  size="xs" 
                  variant="subtle" 
                  class="cursor-pointer"
                  color="neutral"
                  @click="downloadPaper(publication.paper_pdf, publication.paper_name)"
                >
                  <UIcon name="i-heroicons-document-arrow-down" class="w-3 h-3 mr-1" />
                  Download PDF
                </UButton>
              </div>
            </div>
          </div>
          <ActionButtons 
            :item="publication"
            item-type="Publication"
            :item-name="publication.paper_name"
            @toggle-visibility="toggleVisibility"
            @edit="editPublication"
            @delete="deletePublication"
          />
        </div>
      </div>
    </UCard>
  </div>

  <!-- Edit Publication Modal -->
  <FormsPublicationEditForm 
    v-if="editingPublication"
    :publication="editingPublication"
    @updated="handlePublicationUpdated"
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
import type { Publication } from '@/types'

const props = defineProps<{
  publications: Publication[]
}>()

const emit = defineEmits<{
  (e: 'deleted', publicationId: number): void
  (e: 'updated', publication: Publication): void
  (e: 'visibilityToggled', publication: Publication): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')
const editingPublication = ref<Publication | null>(null)

const deletePublication = (publication: Publication) => {
  deleteItemType.value = 'Publication'
  deleteItemName.value = publication.paper_name
  deleteItemId.value = publication.id
  deleteApi.value = '/api/publications'
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  emit('deleted', deleteItemId.value)
}

const editPublication = (publication: Publication) => {
  editingPublication.value = publication
}

const closeEditModal = () => {
  editingPublication.value = null
}

const handlePublicationUpdated = (updatedPublication: Publication) => {
  editingPublication.value = null
  emit('updated', updatedPublication)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  })
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const toggleVisibility = async (publication: Publication) => {
  try {
    const response = await $fetch<{ success: boolean; publication: Publication }>('/api/publications.toggle', {
      method: 'POST',
      body: { id: publication.id }
    })
    
    if (response.success) {
      emit('visibilityToggled', response.publication)
    }
  } catch (error) {
    console.error('Error toggling publication visibility:', error)
  }
}

const downloadPaper = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
