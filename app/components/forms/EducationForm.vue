<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Education</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Enter your education details</p>
        </div>
      <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-3">
        <!-- University Name, Degree, and Location -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField label="University Name" required>
            <UInput v-model="state.university" placeholder="Enter university name" />
          </UFormField>

          <UFormField label="Degree" required>
            <UInput v-model="state.degree" placeholder="Enter degree" />
          </UFormField>

          <UFormField label="Location">
            <UInput v-model="state.location" placeholder="Enter location" />
          </UFormField>
        </div>

        <!-- Start Date, End Date, and Grade/Percentage -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UFormField label="Start Date" required>
            <UPopover>
              <UButton color="neutral" variant="subtle" icon="i-lucide-calendar" class="w-full justify-start">
                {{ startDateValue ? df.format(startDateValue.toDate(getLocalTimeZone())) : 'Select start date' }}
              </UButton>
              <template #content>
                <UCalendar v-model="startDateValue" class="p-2" />
              </template>
            </UPopover>
          </UFormField>

          <UFormField label="End Date" :required="!state.currentlyPursuing">
            <UPopover :disabled="state.currentlyPursuing">
              <UButton 
                color="neutral" 
                variant="subtle" 
                icon="i-lucide-calendar" 
                class="w-full justify-start"
                :disabled="state.currentlyPursuing"
              >
                {{ endDateValue ? df.format(endDateValue.toDate(getLocalTimeZone())) : 'Select end date' }}
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

          <UFormField label="Grade">
            <div class="space-y-2">
              <UInput
                v-model="state.gradeValue" 
                placeholder="8.5/10 or 85%"
              />
            </div>
          </UFormField>
        </div>

        <!-- Currently Pursuing Checkbox -->
        <UFormField name="currentlyPursuing" class="w-fit">
          <UCheckbox v-model="state.currentlyPursuing" label="I am currently pursuing this degree" />
        </UFormField>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-3">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="button" color="primary" :loading="loading" :disabled="loading" @click="submitForm">
            {{ loading ? 'Saving...' : 'Save' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, watch, ref, shallowRef } from 'vue'
import { useUserStore } from '../../../stores/user'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

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
  currentlyPursuing: boolean
  gradeType: 'cgpa' | 'percentage'
  gradeValue: number | null
}

const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const startDateValue = shallowRef<CalendarDate | null>(null)
const endDateValue = shallowRef<CalendarDate | null>(null)

// Reactive state for UForm
const state = reactive<EducationData>({
  university: '',
  degree: '',
  startDate: '',
  endDate: '',
  location: '',
  cgpa: null,
  currentlyPursuing: false,
  gradeType: 'cgpa',
  gradeValue: null
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

// Watch currentlyPursuing to clear endDate when checked
watch(
  () => state.currentlyPursuing,
  (isCurrentlyPursuing) => {
    if (isCurrentlyPursuing) {
      state.endDate = ''
      endDateValue.value = null
    }
  }
)

// Watch to enforce endDate >= startDate
watch(
  [() => state.startDate, () => state.endDate, () => state.currentlyPursuing],
  ([newStart, newEnd, currentlyPursuing]) => {
    if (!currentlyPursuing && newEnd && newStart && newEnd < newStart) {
      state.endDate = newStart
    }
  }
)

const submitForm = async () => {
  if (!state.currentlyPursuing && state.endDate < state.startDate) {
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
      end_date: state.currentlyPursuing ? null : state.endDate,
      location: state.location,
      cgpa: state.gradeValue
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
      emit('save', response.education)
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
        error.value = 'Grade value is too large. Please enter a value between 0 and 10.'
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