<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :schema="schema" :state="state" @submit="onSubmit" @keydown.enter.prevent="" class="space-y-3">
        <!-- Header -->
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Publication</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Enter your publication details</p>
        </div>

        <!-- Paper Name and Conference Name -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField name="paperName" label="Paper Name" required>
            <UInput v-model="state.paperName" placeholder="Enter paper title" />
          </UFormField>

          <UFormField name="conferenceName" label="Conference/Journal">
            <UInput v-model="state.conferenceName" placeholder="Enter conference or journal name" />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Published Date and Paper Link -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField name="publishedDate" label="Published Date">
            <UInput type="date" v-model="state.publishedDate" />
          </UFormField>

          <UFormField name="paperLink" label="Paper Link">
            <UInput v-model="state.paperLink" placeholder="https://example.com/paper" />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Description (Full Width) -->
        <UFormField name="description" label="Description" class="w-full">
          <UTextarea 
            v-model="state.description" 
            placeholder="Brief description of your publication"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <!-- Paper PDF Upload -->
        <UFormField name="paperPdf" label="Paper PDF">
          <UFileUpload 
            v-model="state.paperPdf" 
            accept=".pdf" 
            class="min-h-32"
            :multiple="false"
          />
          <div class="text-xs text-gray-500 mt-1">
            PDF files only. Max 10MB.
          </div>
        </UFormField>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-3">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="submit" color="primary" :loading="loading" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Publication' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { reactive, ref } from 'vue'
import { useUserStore } from '../../../stores/user'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf']

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const schema = z.object({
  paperName: z.string().min(1, 'Paper name is required'),
  conferenceName: z.string().optional(),
  description: z.string().optional(),
  publishedDate: z.string().optional(),
  paperPdf: z
    .instanceof(File, {
      message: 'Please select a PDF file.'
    })
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: `The file is too large. Please choose a file smaller than ${formatBytes(MAX_FILE_SIZE)}.`
    })
    .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), {
      message: 'Please upload a valid PDF file.'
    }),
  paperLink: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
})

type Schema = z.output<typeof schema>

const emit = defineEmits<{
  (e: 'save', data: any): void
  (e: 'close'): void
}>()

const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

const state = reactive<Schema>({
  paperName: '',
  conferenceName: '',
  description: '',
  publishedDate: '',
  paperPdf: undefined,
  paperLink: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    let paperPdfUrl = null

    // Upload PDF if provided
    if (state.paperPdf) {
      const formData = new FormData()
      formData.append('file', state.paperPdf)
      formData.append('username', userStore.user?.username || 'user')
      formData.append('fileType', 'pdf')

      const uploadResponse = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.success) {
        paperPdfUrl = uploadResponse.url
      }
    }

    // Prepare publication data
    const publicationData = {
      userId,
      publications: [{
        paper_name: state.paperName,
        conference_name: state.conferenceName || null,
        description: state.description || null,
        published_date: state.publishedDate || null,
        paper_pdf: paperPdfUrl,
        paper_link: state.paperLink || null
      }]
    }

    const response = await $fetch('/api/publications', {
      method: 'POST',
      body: publicationData
    })

    if (response.success) {
      toast.add({
        title: 'Publication saved successfully',
        color: 'success'
      })
      emit('save', response.publications[0])
      emit('close')
    }
  } catch (err: any) {
    console.error('Error saving publication:', err)
    
    toast.add({
      title: 'Failed to save publication',
      color: 'error'
    })
    
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'User profile not found. Please try logging in again.'
    } else {
      error.value = err.data?.message || err.message || 'Failed to save publication'
    }
  } finally {
    loading.value = false
  }
}
</script>
