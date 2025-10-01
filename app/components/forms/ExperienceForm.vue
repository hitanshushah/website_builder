<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :schema="schema" :state="state" @submit="onSubmit" @keydown.enter.prevent="" class="space-y-3">
        <!-- Header -->
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Work Experience</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Enter your work experience details</p>
        </div>

        <!-- Company Name, Designation, and Location -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField name="companyName" label="Company Name" required>
            <UInput v-model="state.companyName" placeholder="Enter company name" />
          </UFormField>

          <UFormField name="designation" label="Designation/Role" required>
            <UInput v-model="state.designation" placeholder="Enter your designation" />
          </UFormField>

          <UFormField name="location" label="Location">
            <UInput v-model="state.location" placeholder="Enter work location" />
          </UFormField>
        </div>

        <!-- Start Date and End Date -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField name="startDate" label="Start Date" required>
            <UInput type="date" v-model="state.startDate" />
          </UFormField>

          <UFormField name="endDate" label="End Date" :required="!state.currentlyWorking">
            <UInput 
              type="date" 
              v-model="state.endDate" 
              :min="state.startDate"
              :disabled="state.currentlyWorking"
            />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Currently Working Checkbox -->
        <UFormField name="currentlyWorking">
          <UCheckbox v-model="state.currentlyWorking" label="I am currently working here" />
        </UFormField>

        <!-- Skills -->
        <UFormField name="skills" label="Skills">
          <div class="space-y-2">
            <UInput
              v-model="currentSkill"
              placeholder="Enter a skill and press Enter"
              @keyup.enter="addSkill"
            />
            <div v-if="state.skills.length" class="flex flex-wrap gap-2">
              <UBadge
                v-for="(skill, index) in state.skills"
                :key="index"
                color="primary"
                variant="soft"
                class="cursor-pointer"
                @click="removeSkill(index)"
              >
                {{ skill }} ×
              </UBadge>
            </div>
          </div>
        </UFormField>

        <!-- Description (Full Width) -->
        <UFormField name="description" label="Description" class="w-full">
          <UTextarea 
            v-model="state.description" 
            placeholder="Describe your role and responsibilities"
            :rows="4"
            class="w-full"
          />
        </UFormField>

        <!-- Company Logo Upload -->
        <UFormField name="companyLogo" label="Company Logo">
          <UFileUpload 
            v-model="state.companyLogo" 
            accept="image/*" 
            class="min-h-48"
            :multiple="false"
          />
          <div class="text-xs text-gray-500 mt-1">
            JPG, PNG, or WebP. Max 2MB. Recommended size: 200x200 to 4096x4096 pixels.
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
            {{ loading ? 'Saving...' : 'Save Experience' }}
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

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const MIN_DIMENSIONS = { width: 200, height: 200 }
const MAX_DIMENSIONS = { width: 4096, height: 4096 }
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).default([]),
  description: z.string().optional(),
  companyLogo: z
    .instanceof(File, {
      message: 'Please select an image file.'
    })
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: `The image is too large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}.`
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: 'Please upload a valid image file (JPEG, PNG, or WebP).'
    })
    .refine(
      (file) =>
        !file ||
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
              const meetsDimensions =
                img.width >= MIN_DIMENSIONS.width &&
                img.height >= MIN_DIMENSIONS.height &&
                img.width <= MAX_DIMENSIONS.width &&
                img.height <= MAX_DIMENSIONS.height
              resolve(meetsDimensions)
            }
            img.src = e.target?.result as string
          }
          reader.readAsDataURL(file)
        }),
      {
        message: `The image dimensions are invalid. Please upload an image between ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} and ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels.`
      }
    )
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

const state = reactive<Schema & { currentlyWorking: boolean }>({
  companyName: '',
  designation: '',
  startDate: '',
  endDate: '',
  location: '',
  skills: [],
  description: '',
  companyLogo: undefined,
  currentlyWorking: false
})

const currentSkill = ref('')

// Watch currentlyWorking to clear endDate when checked
watch(
  () => state.currentlyWorking,
  (isCurrentlyWorking) => {
    if (isCurrentlyWorking) {
      state.endDate = ''
    }
  }
)

// Watch to enforce endDate >= startDate when not currently working
watch(
  [() => state.startDate, () => state.endDate, () => state.currentlyWorking],
  ([newStart, newEnd, currentlyWorking]) => {
    if (!currentlyWorking && newEnd && newStart && newEnd < newStart) {
      state.endDate = newStart
    }
  }
)

const addSkill = () => {
  const trimmed = currentSkill.value.trim()
  if (!trimmed || state.skills.includes(trimmed)) return
  state.skills.push(trimmed)
  currentSkill.value = ''
}

const removeSkill = (index: number) => {
  state.skills.splice(index, 1)
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    let companyLogoUrl = null

    // Upload company logo if provided
    if (state.companyLogo) {
      const formData = new FormData()
      formData.append('file', state.companyLogo)
      formData.append('username', userStore.user?.username || 'user')
      formData.append('fileType', 'image')

      const uploadResponse = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.success) {
        companyLogoUrl = uploadResponse.url
      }
    }

    // Prepare experience data
    const experienceData = {
      userId,
      experiences: [{
        company_name: state.companyName,
        role: state.designation,
        start_date: state.startDate,
        end_date: state.currentlyWorking ? null : state.endDate,
        description: state.description,
        skills: state.skills,
        location: state.location,
        company_logo: companyLogoUrl
      }]
    }

    const response = await $fetch('/api/experiences', {
      method: 'POST',
      body: experienceData
    })

    if (response.success) {
      toast.add({
        title: 'Experience saved successfully',
        color: 'success'
      })
      emit('save', response.experiences[0])
      emit('close')
    }
  } catch (err: any) {
    console.error('Error saving experience:', err)
    
    toast.add({
      title: 'Failed to save experience',
      color: 'error'
    })
    
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'User profile not found. Please try logging in again.'
    } else {
      error.value = err.data?.message || err.message || 'Failed to save experience'
    }
  } finally {
    loading.value = false
  }
}
</script>
