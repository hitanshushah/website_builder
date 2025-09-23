<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8">
      <UForm :state="state" @submit.prevent="submitForm" class="space-y-4">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Education</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your education details</p>
        </div>

        <!-- University Name and Degree -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="University Name" help="Enter the name of your university" required>
            <UInput v-model="state.university" placeholder="Enter university name" />
          </UFormField>

          <UFormField label="Degree" help="Enter your degree (e.g., BSc, MSc)" required>
            <UInput v-model="state.degree" placeholder="Enter degree" />
          </UFormField>
        </div>

        <!-- Start Date and End Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Start Date" help="Select the start date of your education" required>
            <UInput type="date" v-model="state.startDate" />
          </UFormField>

          <UFormField label="End Date" help="Select the end date of your education" required>
            <UInput type="date" v-model="state.endDate" :min="state.startDate" />
          </UFormField>
        </div>

        <!-- Location and CGPA -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Location" help="Enter university location">
            <UInput v-model="state.location" placeholder="Enter location" />
          </UFormField>

          <UFormField label="CGPA" help="Enter your CGPA (0-10)">
            <UInput type="number" step="0.01" min="0" max="10" v-model="state.cgpa" placeholder="Enter CGPA" />
          </UFormField>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-4">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="submit" color="primary" :loading="loading" :disabled="loading">
            {{ loading ? 'Updating...' : 'Update Education' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import type { Education } from '@/types'

const props = defineProps<{
  education: Education
}>()

const emit = defineEmits<{
  (e: 'updated', education: Education): void
  (e: 'close'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Reactive state for UForm
const state = reactive({
  university: props.education.university_name || '',
  degree: props.education.degree || '',
  startDate: props.education.from_date || '',
  endDate: props.education.end_date || '',
  location: props.education.location || '',
  cgpa: props.education.cgpa || null
})

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
  if (state.endDate < state.startDate) {
    error.value = 'End date cannot be earlier than Start date'
    return
  }

  try {
    loading.value = true
    error.value = null

    // Map form data to API format
    const educationData = {
      id: props.education.id,
      university_name: state.university,
      degree: state.degree,
      from_date: state.startDate,
      end_date: state.endDate,
      location: state.location,
      cgpa: state.cgpa
    }

    const response = await $fetch('/api/education', {
      method: 'PUT',
      body: educationData
    })

    if (response.success) {
      toast.add({
        title: 'Education updated successfully',
        color: 'success'
      })
      emit('updated', response.education)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error updating education:', err)
    
    // Show error toast
    toast.add({
      title: 'Failed to update education',
      color: 'error'
    })
    
    // Handle specific error cases for form display
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'Education record not found'
    } else if (err.statusCode === 500) {
      if (err.data?.message?.includes('numeric field overflow')) {
        error.value = 'CGPA value is too large. Please enter a value between 0 and 10.'
      } else {
        error.value = 'Server error. Please try again later.'
      }
    } else {
      error.value = err.data?.message || err.message || 'Failed to update education record'
    }
  } finally {
    loading.value = false
  }
}
</script>
