<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Add Certifications" 
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="space-y-6">
      <!-- Certification List -->
      <div v-for="(certification, index) in certifications" :key="index" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Certification {{ index + 1 }}
          </h3>
          <Button 
            v-if="certifications.length > 1"
            icon="pi pi-trash" 
            severity="danger" 
            text 
            size="small"
            @click="removeCertification(index)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Certification Name *
            </label>
            <InputText 
              v-model="certification.name"
              placeholder="Enter certification name"
              class="w-full"
              :class="{ 'p-invalid': errors[`${index}.name`] }"
            />
            <small v-if="errors[`${index}.name`]" class="text-red-500">
              {{ errors[`${index}.name`] }}
            </small>
          </div>

          <!-- Institute Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Institute Name
            </label>
            <InputText 
              v-model="certification.institute_name"
              placeholder="Enter institute name"
              class="w-full"
            />
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <Calendar 
              v-model="certification.start_date"
              placeholder="Select start date"
              dateFormat="yy-mm-dd"
              class="w-full"
            />
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <Calendar 
              v-model="certification.end_date"
              placeholder="Select end date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :minDate="certification.start_date"
            />
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Textarea 
              v-model="certification.description"
              placeholder="Describe the certification"
              rows="3"
              class="w-full"
            />
          </div>

          <!-- Certificate PDF -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Certificate PDF URL
            </label>
            <InputText 
              v-model="certification.certificate_pdf"
              placeholder="Enter certificate PDF URL"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Add Another Certification Button -->
      <div class="text-center">
        <Button 
          icon="pi pi-plus" 
          label="Add Another Certification" 
          severity="secondary"
          @click="addCertification"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="closeDialog"
        />
        <Button 
          label="Save Certifications" 
          :loading="saving"
          @click="saveCertifications"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import type { Certification } from '../types'

interface Props {
  modelValue: boolean
  userId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(props.modelValue)
const saving = ref(false)
const errors = ref<Record<string, string>>({})

// Certification form data
const certifications = ref<Partial<Certification>[]>([
  {
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    institute_name: '',
    certificate_pdf: ''
  }
])

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const addCertification = () => {
  certifications.value.push({
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    institute_name: '',
    certificate_pdf: ''
  })
}

const removeCertification = (index: number) => {
  if (certifications.value.length > 1) {
    certifications.value.splice(index, 1)
  }
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  certifications.value.forEach((certification, index) => {
    if (!certification.name?.trim()) {
      errors.value[`${index}.name`] = 'Certification name is required'
      isValid = false
    }
  })

  return isValid
}

const saveCertifications = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  errors.value = {}

  try {
    const certificationsToSave = certifications.value.map(certification => ({
      name: certification.name?.trim(),
      description: certification.description?.trim(),
      start_date: certification.start_date,
      end_date: certification.end_date,
      institute_name: certification.institute_name?.trim(),
      certificate_pdf: certification.certificate_pdf?.trim()
    }))

    await $fetch('/api/certifications', {
      method: 'POST',
      body: {
        userId: props.userId,
        certifications: certificationsToSave
      }
    })

    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Error saving certifications:', error)
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  visible.value = false
  // Reset form
  certifications.value = [{
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    institute_name: '',
    certificate_pdf: ''
  }]
  errors.value = {}
}
</script>
