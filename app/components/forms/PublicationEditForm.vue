<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-3">
        <!-- Header -->
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Publication</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your publication details</p>
        </div>

        <!-- Paper Name and Conference Name -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField label="Paper Title" required>
            <UInput v-model="state.paperName" placeholder="Enter paper title" />
          </UFormField>

          <UFormField label="Conference/Journal">
            <UInput v-model="state.conferenceName" placeholder="Enter conference or journal name" />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Published Date and Paper Link -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField label="Published Date">
            <UInput type="date" v-model="state.publishedDate" />
          </UFormField>

          <UFormField label="Paper Link">
            <UInput v-model="state.paperLink" placeholder="Enter paper URL" />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Description (Full Width) -->
        <UFormField label="Description" class="w-full">
          <UTextarea 
            v-model="state.description" 
            placeholder="Brief description of your research paper"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <!-- Paper PDF Upload -->
        <UFormField label="Paper PDF">
          <UFileUpload 
            v-model="state.paperPdf" 
            accept=".pdf" 
            class="min-h-32"
            :multiple="false"
          />
          <div class="text-xs text-gray-500 mt-1">
            PDF files only. Max 10MB.
          </div>
          <div v-if="publication.paper_pdf && !state.paperPdf" class="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Current PDF: <a :href="publication.paper_pdf" target="_blank" class="underline">View current PDF</a>
          </div>
        </UFormField>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-3">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="button" color="primary" :loading="loading" :disabled="loading" @click="submitForm">
            {{ loading ? 'Updating...' : 'Update Publication' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '../../../stores/user'
import type { Publication } from '@/types'

const props = defineProps<{
  publication: Publication
}>()

const emit = defineEmits<{
  (e: 'updated', publication: Publication): void
  (e: 'close'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Reactive state for UForm
const state = reactive({
  paperName: props.publication.paper_name || '',
  conferenceName: props.publication.conference_name || '',
  publishedDate: props.publication.published_date || '',
  description: props.publication.description || '',
  paperLink: props.publication.paper_link || '',
  paperPdf: undefined
})

const submitForm = async () => {
  try {
    loading.value = true
    error.value = null

    let paperPdfUrl = props.publication.paper_pdf

    // Upload new paper PDF if provided
    if (state.paperPdf) {
      const userStore = useUserStore()
      const formData = new FormData()
      formData.append('file', state.paperPdf)
      formData.append('username', userStore.user?.username || 'user')
      formData.append('fileType', 'publication')

      const uploadResponse = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.success) {
        paperPdfUrl = uploadResponse.url
      }
    }

    // Map form data to API format
    const publicationData = {
      id: props.publication.id,
      paper_name: state.paperName,
      conference_name: state.conferenceName,
      published_date: state.publishedDate,
      description: state.description,
      paper_link: state.paperLink,
      paper_pdf: paperPdfUrl
    }

    const response = await $fetch('/api/publications', {
      method: 'PUT',
      body: publicationData
    })

    if (response.success) {
      toast.add({
        title: 'Publication updated successfully',
        color: 'success'
      })
      emit('updated', response.publication)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error updating publication:', err)
    
    // Show error toast
    toast.add({
      title: 'Failed to update publication',
      color: 'error'
    })
    
    // Handle specific error cases for form display
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'Publication not found'
    } else {
      error.value = err.data?.message || err.message || 'Failed to update publication'
    }
  } finally {
    loading.value = false
  }
}
</script>
