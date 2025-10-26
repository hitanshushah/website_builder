<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :schema="schema" :state="state" @submit="onSubmit" @keydown.enter.prevent="" class="space-y-3">
        <!-- Header -->
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Certification</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Enter your certification details</p>
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
            <UPopover>
              <UButton color="neutral" variant="subtle" icon="i-lucide-calendar" class="w-full justify-start">
                {{ startDateValue ? df.format(startDateValue.toDate(getLocalTimeZone())) : 'Select issue date' }}
              </UButton>
              <template #content>
                <UCalendar v-model="startDateValue" class="p-2" />
              </template>
            </UPopover>
          </UFormField>

          <UFormField name="endDate" label="Expiry Date">
            <UPopover :disabled="state.noExpiry">
              <UButton 
                color="neutral" 
                variant="subtle" 
                icon="i-lucide-calendar" 
                class="w-full justify-start"
                :disabled="state.noExpiry"
              >
                {{ endDateValue ? df.format(endDateValue.toDate(getLocalTimeZone())) : 'Select expiry date' }}
              </UButton>
              <template #content>
                <UCalendar 
                  v-model="endDateValue" 
                  class="p-2"
                  :min-value="startDateValue || undefined"
                />
              </template>
            </UPopover>
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- No Expiry Checkbox -->
        <UFormField name="noExpiry" class="w-fit">
          <UCheckbox v-model="state.noExpiry" label="This certification does not expire" />
        </UFormField>

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
        </UFormField>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-3">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="submit" color="primary" :loading="loading" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Certification' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { reactive, ref, watch, shallowRef } from 'vue'
import { useUserStore } from '../../../stores/user'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

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

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const schema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  instituteName: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  noExpiry: z.boolean().optional(),
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

const emit = defineEmits<{
  (e: 'save', data: any): void
  (e: 'close'): void
}>()

const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const startDateValue = shallowRef<CalendarDate | null>(null)
const endDateValue = shallowRef<CalendarDate | null>(null)

const state = reactive<Schema>({
  name: '',
  instituteName: '',
  description: '',
  startDate: '',
  endDate: '',
  noExpiry: false,
  certificatePdf: undefined
})

// Watch calendar changes and update state
watch(startDateValue, (newValue) => {
  if (newValue) {
    state.startDate = newValue.toString()
  } else {
    state.startDate = ''
  }
})

watch(endDateValue, (newValue) => {
  if (newValue) {
    state.endDate = newValue.toString()
  } else {
    state.endDate = ''
  }
})

// Watch noExpiry to clear endDate when checked
watch(
  () => state.noExpiry,
  (isNoExpiry) => {
    if (isNoExpiry) {
      state.endDate = ''
      endDateValue.value = null
    }
  }
)

// Watch to enforce endDate >= startDate when not no expiry
watch(
  [() => state.startDate, () => state.endDate, () => state.noExpiry],
  ([newStart, newEnd, noExpiry]) => {
    if (!noExpiry && newStart && newEnd && newEnd < newStart) {
      state.endDate = newStart
    }
  }
)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    let certificateUrl = null

    // Upload certificate if provided
    if (state.certificatePdf) {
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
      userId,
      certifications: [{
        name: state.name,
        description: state.description || null,
        start_date: state.startDate || null,
        end_date: state.noExpiry ? null : (state.endDate || null),
        institute_name: state.instituteName || null,
        certificate_pdf: certificateUrl
      }]
    }

    const response = await $fetch('/api/certifications', {
      method: 'POST',
      body: certificationData
    })

    if (response.success) {
      toast.add({
        title: 'Certification saved successfully',
        color: 'success'
      })
      emit('save', response.certifications[0])
      emit('close')
    }
  } catch (err: any) {
    console.error('Error saving certification:', err)
    
    toast.add({
      title: 'Failed to save certification',
      color: 'error'
    })
    
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'User profile not found. Please try logging in again.'
    } else {
      error.value = err.data?.message || err.message || 'Failed to save certification'
    }
  } finally {
    loading.value = false
  }
}
</script>