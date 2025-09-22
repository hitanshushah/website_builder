<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8">
      <UForm :state="state" @submit.prevent="submitForm" class="space-y-4">
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
            {{ loading ? 'Saving...' : 'Save' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useUserStore } from '../../stores/user'

const emit = defineEmits<{
  (e: 'save', data: EducationData): void
  (e: 'close'): void
}>()

type EducationData = {
  university: string
  degree: string
  startDate: string
  endDate: string
  location: string
  cgpa: number | null
}

const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Reactive state for UForm
const state = reactive<EducationData>({
  university: '',
  degree: '',
  startDate: '',
  endDate: '',
  location: '',
  cgpa: null
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
    alert('End date cannot be earlier than Start date')
    return
  }

  try {
    loading.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Map form data to API format
    const educationData = {
      userId,
      university_name: state.university,
      degree: state.degree,
      from_date: state.startDate,
      end_date: state.endDate,
      location: state.location,
      cgpa: state.cgpa
    }

    const response = await $fetch('/api/education', {
      method: 'POST',
      body: educationData
    })

    if (response.success) {
      toast.add({
        title: 'Education saved successfully',
        color: 'success'
      })
      emit('save', { ...state })
      emit('close')
    }
  } catch (err: any) {
    console.error('Error saving education:', err)
    
    // Show error toast
    toast.add({
      title: 'Failed to save education',
      color: 'error'
    })
    
    // Handle specific error cases for form display
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'User profile not found. Please try logging in again.'
    } else if (err.statusCode === 500) {
      if (err.data?.message?.includes('numeric field overflow')) {
        error.value = 'CGPA value is too large. Please enter a value between 0 and 10.'
      } else {
        error.value = 'Server error. Please try again later.'
      }
    } else {
      error.value = err.data?.message || err.message || 'Failed to save education record'
    }
  } finally {
    loading.value = false
  }
}
</script>
