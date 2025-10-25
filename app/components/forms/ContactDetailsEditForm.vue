<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full md:w-1/2 p-6 my-8 mx-4">
      <div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Details</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Update your information</p>
      </div>
      
      <UForm :state="state" :validate="validate" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-3">
        <!-- Phone Number + Secondary Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UFormField label="Phone Number" name="phoneNumber">
            <UInput 
              v-model="state.phoneNumber" 
              placeholder="+1 234 567 8900" 
              type="tel"
            />
          </UFormField>

          <UFormField label="Secondary Email" name="secondaryEmail">
            <UInput 
              v-model="state.secondaryEmail" 
              placeholder="alternate@email.com" 
              type="email"
            />
          </UFormField>
        </div>

        <!-- Introduction - full width below -->
        <UFormField label="Professional Summary" name="introduction" class="col-span-2">
          <UTextarea 
            v-model="state.introduction" 
            placeholder="Brief introduction about yourself..." 
            :rows="6"
            class="w-full"
          />
        </UFormField>


        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-3">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="loading" :disabled="loading || !hasData">
            {{ loading ? 'Updating...' : 'Update Details' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../../stores/user'

const props = defineProps<{
  contactDetails: {
    phone_number: string
    secondary_email: string
    introduction: string
  }
}>()

const emit = defineEmits<{
  (e: 'updated', data: any): void
  (e: 'close'): void
}>()

type ContactDetailsData = {
  phoneNumber: string
  secondaryEmail: string
  introduction: string
}

const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Reactive state for UForm
const state = reactive<ContactDetailsData>({
  phoneNumber: '',
  secondaryEmail: '',
  introduction: ''
})

// Initialize form with existing data
onMounted(() => {
  state.phoneNumber = props.contactDetails.phone_number || ''
  state.secondaryEmail = props.contactDetails.secondary_email || ''
  state.introduction = props.contactDetails.introduction || ''
})

// Check if form has any data
const hasData = computed(() => {
  return state.phoneNumber?.trim() || state.secondaryEmail?.trim() || state.introduction?.trim()
})

// Validation function
const validate = (state: ContactDetailsData) => {
  const errors: Array<{ path: string; message: string }> = []
  
  // Validate phone number format if provided
  if (state.phoneNumber?.trim()) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(state.phoneNumber)) {
      errors.push({ path: 'phoneNumber', message: 'Invalid phone number format' })
    }
  }
  
  // Validate email format if provided
  if (state.secondaryEmail?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(state.secondaryEmail)) {
      errors.push({ path: 'secondaryEmail', message: 'Invalid email format' })
    }
  }
  
  return errors
}

const submitForm = async () => {
  try {
    loading.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Map form data to API format
    const contactData = {
      userId,
      phone_number: state.phoneNumber?.trim() || null,
      secondary_email: state.secondaryEmail?.trim() || null,
      introduction: state.introduction?.trim() || null
    }

    const response = await $fetch('/api/contact-details', {
      method: 'PUT',
      body: contactData
    })

    if (response.success) {
      toast.add({
        title: 'Contact details updated successfully',
        color: 'success'
      })
      emit('updated', response.profile)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error updating contact details:', err)
    
    // Show error toast
    toast.add({
      title: 'Failed to update contact details',
      color: 'error'
    })
    
    // Handle specific error cases for form display
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'User profile not found. Please try logging in again.'
    } else if (err.statusCode === 500) {
      error.value = 'Server error. Please try again later.'
    } else {
      error.value = err.data?.message || err.message || 'Failed to update contact details'
    }
  } finally {
    loading.value = false
  }
}
</script>

