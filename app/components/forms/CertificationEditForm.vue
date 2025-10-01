<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :schema="schema" :state="state" @submit="onSubmit" @keydown.enter.prevent="" class="space-y-3">
        <!-- Header -->
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Certification</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your certification details</p>
        </div>

        <!-- Certification Name and Institute Name -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField name="name" label="Certification Name" required>
            <UInput v-model="state.name" placeholder="Enter certification name" />
          </UFormField>

          <UFormField name="instituteName" label="Institute/Organization">
            <UInput v-model="state.instituteName" placeholder="Enter institute name" />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Start Date and End Date -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField name="startDate" label="Issue Date">
            <UInput type="date" v-model="state.startDate" />
          </UFormField>

          <UFormField name="endDate" label="Expiry Date">
            <UInput type="date" v-model="state.endDate" :min="state.startDate" />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Description (Full Width) -->
        <UFormField name="description" label="Description" class="w-full">
          <UTextarea 
            v-model="state.description" 
            placeholder="Brief description of the certification"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <!-- Certificate Upload -->
        <UFormField name="certificatePdf" label="Certificate Document">
          <UFileUpload 
            v-model="state.certificatePdf" 
            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp" 
            class="min-h-32"
            :multiple="false"
          />
          <div class="text-xs text-gray-500 mt-1">
            PDF, PNG, JPG, JPEG, GIF, or WebP files. Max 10MB for PDFs, 5MB for images.
          </div>
          <div v-if="certification.certificate_pdf && !state.certificatePdf" class="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Current file: <a :href="certification.certificate_pdf" target="_blank" class="underline">View current certificate</a>
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
            {{ loading ? 'Updating...' : 'Update Certification' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { reactive, ref, watch } from 'vue'
import { useUserStore } from '../../../stores/user'
import type { Certification } from '@/types'

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB for PDFs
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB for images
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/gif', 
  'image/webp'
]

const props = defineProps<{
  certification: Certification
}>()

const emit = defineEmits<{
  (e: 'updated', certification: Certification): void
  (e: 'close'): void
}>()

const schema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  instituteName: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  certificatePdf: z
    .instanceof(File, {
      message: 'Please select a file.'
    })
    .optional()
    .refine((file) => {
      if (!file) return true
      return ACCEPTED_FILE_TYPES.includes(file.type)
    }, {
      message: 'Please upload a valid file (PDF, PNG, JPG, JPEG, GIF, or WebP).'
    })
    .refine((file) => {
      if (!file) return true
      const isPDF = file.type === 'application/pdf'
      const maxSize = isPDF ? MAX_PDF_SIZE : MAX_IMAGE_SIZE
      return file.size <= maxSize
    }, {
      message: 'The file is too large. Please choose a file smaller than 10MB for PDFs or 5MB for images.'
    })
})

type Schema = z.output<typeof schema>

const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

const state = reactive<Schema>({
  name: props.certification.name || '',
  instituteName: props.certification.institute_name || '',
  description: props.certification.description || '',
  startDate: props.certification.start_date || '',
  endDate: props.certification.end_date || '',
  certificatePdf: undefined
})

// Watch to enforce endDate >= startDate
watch(
  () => state.startDate,
  (newStart) => {
    if (newStart && state.endDate && state.endDate < newStart) {
      state.endDate = newStart
    }
  }
)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    error.value = null

    let certificateUrl = props.certification.certificate_pdf

    // Upload new certificate if provided
    if (state.certificatePdf) {
      const userStore = useUserStore()
      const formData = new FormData()
      formData.append('file', state.certificatePdf)
      formData.append('username', userStore.user?.username || 'user')
      formData.append('fileType', 'certificate')

      const uploadResponse = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.success) {
        certificateUrl = uploadResponse.url
      }
    }

    // Prepare certification data
    const certificationData = {
      id: props.certification.id,
      name: state.name,
      description: state.description || null,
      start_date: state.startDate || null,
      end_date: state.endDate || null,
      institute_name: state.instituteName || null,
      certificate_pdf: certificateUrl
    }

    const response = await $fetch('/api/certifications', {
      method: 'PUT',
      body: certificationData
    })

    if (response.success) {
      toast.add({
        title: 'Certification updated successfully',
        color: 'success'
      })
      emit('updated', response.certification)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error updating certification:', err)
    
    toast.add({
      title: 'Failed to update certification',
      color: 'error'
    })
    
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'Certification not found'
    } else {
      error.value = err.data?.message || err.message || 'Failed to update certification'
    }
  } finally {
    loading.value = false
  }
}
</script>
