<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-3">
        <!-- Header -->
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Experience</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your work experience details</p>
        </div>

        <!-- Company Name, Role, and Location -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField label="Company Name" required>
            <UInput v-model="state.company" placeholder="Enter company name" />
          </UFormField>

          <UFormField label="Role/Position" required>
            <UInput v-model="state.role" placeholder="Enter role/position" />
          </UFormField>

          <UFormField label="Location">
            <UInput v-model="state.location" placeholder="Enter work location" />
          </UFormField>
        </div>

        <!-- Start Date and End Date -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField label="Start Date">
            <UInput type="date" v-model="state.startDate" />
          </UFormField>

          <UFormField label="End Date">
            <UInput type="date" v-model="state.endDate" :min="state.startDate" />
          </UFormField>

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Skills -->
        <UFormField label="Skills Used">
          <UInput 
            v-model="skillsInput" 
            placeholder="e.g., React, Node.js, Python, Machine Learning"
            @blur="updateSkills"
          />
          <div class="text-xs text-gray-500 mt-1">
            Enter skills separated by commas
          </div>
          <div v-if="state.skills.length > 0" class="flex flex-wrap gap-2 mt-2">
            <span 
              v-for="skill in state.skills" 
              :key="skill"
              class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
            >
              {{ skill }}
            </span>
          </div>
        </UFormField>

        <!-- Description (Full Width) -->
        <UFormField label="Description" class="w-full">
          <UTextarea 
            v-model="state.description" 
            placeholder="Describe your role, responsibilities, and achievements"
            :rows="4"
            class="w-full"
          />
        </UFormField>

        <!-- Company Logo -->
        <UFormField label="Company Logo">
          <UFileUpload 
            v-model="state.companyLogo" 
            accept="image/*" 
            class="min-h-32"
            :multiple="false"
          />
          <div class="text-xs text-gray-500 mt-1">
            PNG, JPG, JPEG, GIF, or WebP files. Max 5MB.
          </div>
          <div v-if="experience.company_logo && !state.companyLogo" class="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Current logo: <img :src="experience.company_logo" alt="Current logo" class="inline-block w-8 h-8 rounded" />
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
            {{ loading ? 'Updating...' : 'Update Experience' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useUserStore } from '../../../stores/user'
import type { Experience } from '@/types'

const props = defineProps<{
  experience: Experience
}>()

const emit = defineEmits<{
  (e: 'updated', experience: Experience): void
  (e: 'close'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Reactive state for UForm
const state = reactive({
  role: props.experience.role || '',
  company: props.experience.company_name || '',
  startDate: props.experience.start_date || '',
  endDate: props.experience.end_date || '',
  location: props.experience.location || '',
  description: props.experience.description || '',
  skills: props.experience.skills || [],
  companyLogo: undefined
})

// Skills input handling
const skillsInput = ref(props.experience.skills?.join(', ') || '')

const updateSkills = () => {
  if (skillsInput.value.trim()) {
    state.skills = skillsInput.value
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
  } else {
    state.skills = []
  }
}

// Watch to enforce endDate >= startDate
watch(
  () => state.startDate,
  (newStart) => {
    if (state.endDate && state.endDate < newStart) {
      state.endDate = newStart
    }
  }
)

const submitForm = async () => {
  if (state.endDate && state.startDate && state.endDate < state.startDate) {
    error.value = 'End date cannot be earlier than start date'
    return
  }

  try {
    loading.value = true
    error.value = null

    let companyLogoUrl = props.experience.company_logo

    // Upload new company logo if provided
    if (state.companyLogo) {
      const userStore = useUserStore()
      const formData = new FormData()
      formData.append('file', state.companyLogo)
      formData.append('username', userStore.user?.username || 'user')
      formData.append('fileType', 'company-logo')

      const uploadResponse = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.success) {
        companyLogoUrl = uploadResponse.url
      }
    }

    // Map form data to API format
    const experienceData = {
      id: props.experience.id,
      role: state.role,
      company_name: state.company,
      start_date: state.startDate,
      end_date: state.endDate,
      location: state.location,
      description: state.description,
      skills: state.skills,
      company_logo: companyLogoUrl
    }

    const response = await $fetch('/api/experiences', {
      method: 'PUT',
      body: experienceData
    })

    if (response.success) {
      toast.add({
        title: 'Experience updated successfully',
        color: 'success'
      })
      emit('updated', response.experience)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error updating experience:', err)
    
    // Show error toast
    toast.add({
      title: 'Failed to update experience',
      color: 'error'
    })
    
    // Handle specific error cases for form display
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'Experience record not found'
    } else {
      error.value = err.data?.message || err.message || 'Failed to update experience'
    }
  } finally {
    loading.value = false
  }
}
</script>
