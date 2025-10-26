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
            <UPopover>
              <UButton color="neutral" variant="subtle" icon="i-lucide-calendar" class="w-full justify-start">
                {{ startDateValue ? df.format(startDateValue.toDate(getLocalTimeZone())) : 'Select start date' }}
              </UButton>
              <template #content>
                <UCalendar v-model="startDateValue" class="p-2" />
              </template>
            </UPopover>
          </UFormField>

          <UFormField label="End Date">
            <UPopover :disabled="state.currentlyWorking">
              <UButton 
                color="neutral" 
                variant="subtle" 
                icon="i-lucide-calendar" 
                class="w-full justify-start"
                :disabled="state.currentlyWorking"
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

          <!-- Empty column for consistency -->
          <div></div>
        </div>

        <!-- Currently Working Checkbox -->
        <UFormField class="w-fit">
          <UCheckbox v-model="state.currentlyWorking" label="I am currently working here" />
        </UFormField>

        <!-- Skills -->
        <UFormField label="Skills Used">
          <div class="space-y-2">
            <div class="flex gap-2">
              <UInput
                v-model="currentSkill"
                placeholder="Enter a skill and press Enter"
                @keyup.enter="addSkill"
                class="flex-1"
              />
              <UButton 
                type="button"
                color="primary" 
                icon="i-lucide-plus"
                @click="addSkill"
              >
                Add
              </UButton>
            </div>
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
import { reactive, watch, ref, shallowRef } from 'vue'
import { useUserStore } from '../../../stores/user'
import type { Experience } from '@/types'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

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

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const startDateValue = shallowRef<CalendarDate | null>(null)
const endDateValue = shallowRef<CalendarDate | null>(null)

// Initialize calendar values from existing experience dates
if (props.experience.start_date) {
  try {
    startDateValue.value = parseDate(props.experience.start_date)
  } catch (e) {
    console.error('Error parsing start date:', e)
  }
}

if (props.experience.end_date) {
  try {
    endDateValue.value = parseDate(props.experience.end_date)
  } catch (e) {
    console.error('Error parsing end date:', e)
  }
}

// Reactive state for UForm
const state = reactive({
  role: props.experience.role || '',
  company: props.experience.company_name || '',
  startDate: props.experience.start_date || '',
  endDate: props.experience.end_date || '',
  location: props.experience.location || '',
  description: props.experience.description || '',
  skills: props.experience.skills || [],
  companyLogo: undefined,
  currentlyWorking: !props.experience.end_date // If no end_date, assume currently working
})

// Skills input handling
const currentSkill = ref('')

const addSkill = () => {
  const trimmed = currentSkill.value.trim()
  if (!trimmed || state.skills.includes(trimmed)) return
  state.skills.push(trimmed)
  currentSkill.value = ''
}

const removeSkill = (index: number) => {
  state.skills.splice(index, 1)
}

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

// Watch currentlyWorking to clear endDate when checked
watch(
  () => state.currentlyWorking,
  (isCurrentlyWorking) => {
    if (isCurrentlyWorking) {
      state.endDate = ''
      endDateValue.value = null
    }
  }
)

// Watch to enforce endDate >= startDate when not currently working
watch(
  [() => state.startDate, () => state.endDate, () => state.currentlyWorking],
  ([newStart, newEnd, currentlyWorking]) => {
    if (!currentlyWorking && newEnd && newStart && newEnd < newStart) {
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
  if (!state.currentlyWorking && state.endDate && state.startDate && state.endDate < state.startDate) {
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
      end_date: state.currentlyWorking ? null : state.endDate,
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