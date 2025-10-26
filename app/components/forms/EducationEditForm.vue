<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-3">
        <!-- Header -->
        <div class="mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Education</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your education details</p>
        </div>

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

        <!-- Start Date, End Date, and CGPA/Percentage -->
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

          <UFormField :label="state.gradeType === 'cgpa' ? 'CGPA (0-10)' : 'Percentage (1-100)'">
            <div class="space-y-2">
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="state.gradeType" 
                    value="cgpa"
                    class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="text-sm">CGPA</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="state.gradeType" 
                    value="percentage"
                    class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="text-sm">Percentage</span>
                </label>
              </div>
              <UInput 
                type="number" 
                step="0.01" 
                :min="state.gradeType === 'cgpa' ? 0 : 1" 
                :max="state.gradeType === 'cgpa' ? 10 : 100" 
                v-model="state.gradeValue" 
                :placeholder="state.gradeType === 'cgpa' ? 'e.g., 8.5' : 'e.g., 85'"
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
            {{ loading ? 'Updating...' : 'Update Education' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, shallowRef } from 'vue'
import type { Education } from '@/types'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

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

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const startDateValue = shallowRef<CalendarDate | null>(null)
const endDateValue = shallowRef<CalendarDate | null>(null)

// Initialize calendar values from existing education dates
if (props.education.from_date) {
  try {
    startDateValue.value = parseDate(props.education.from_date)
  } catch (e) {
    console.error('Error parsing start date:', e)
  }
}

if (props.education.end_date) {
  try {
    endDateValue.value = parseDate(props.education.end_date)
  } catch (e) {
    console.error('Error parsing end date:', e)
  }
}

// Reactive state for UForm
const state = reactive({
  university: props.education.university_name || '',
  degree: props.education.degree || '',
  startDate: props.education.from_date || '',
  endDate: props.education.end_date || '',
  location: props.education.location || '',
  cgpa: props.education.cgpa || null,
  currentlyPursuing: !props.education.end_date,
  gradeType: 'cgpa' as 'cgpa' | 'percentage',
  gradeValue: props.education.cgpa || null
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
      if (newStart) {
        try {
          endDateValue.value = parseDate(newStart)
        } catch (e) {
          console.error('Error parsing date:', e)
        }
      }
    }
  }
)

const submitForm = async () => {
  if (!state.currentlyPursuing && state.endDate < state.startDate) {
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
      end_date: state.currentlyPursuing ? null : state.endDate,
      location: state.location,
      cgpa: state.gradeValue
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