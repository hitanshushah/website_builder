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
              placeholder="Select start date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :model-value="certification.start_date ? new Date(certification.start_date) : null"
              @update:model-value="(value: Date | null) => certification.start_date = value ? value.toISOString().split('T')[0] : undefined"
            />
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <Calendar 
              placeholder="Select end date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :model-value="certification.end_date ? new Date(certification.end_date) : null"
              @update:model-value="(value: Date | null) => certification.end_date = value ? value.toISOString().split('T')[0] : undefined"
              :min-date="certification.start_date ? new Date(certification.start_date) : undefined"
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

          <!-- Certificate -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Certificate
            </label>
            <div class="flex items-center gap-4">
              <div v-if="certification.certificate_pdf" class="flex items-center gap-2">
                <div class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i :class="getFileIcon(certification.certificate_pdf)" style="color: green"></i>
                  <span class="text-sm text-black" style="color: black">Certificate uploaded</span>
                </div>
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  text 
                  size="small"
                  @click="removeCertificate(index)"
                />
              </div>
              <FileUpload 
                mode="basic"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                :maxFileSize="10000000"
                @select="(event) => handleCertificateUpload(event, index)"
                :auto="false"
                chooseLabel="Choose Certificate"
                class="w-full"
              />
            </div>
            <small class="text-gray-500 dark:text-gray-400">
              Upload a certificate (PDF, PNG, JPG, GIF, WebP - max 10MB)
            </small>
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
import FileUpload from 'primevue/fileupload'
import type { Certification } from '../types'
import { useUserStore } from '../stores/user'

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

const userStore = useUserStore()
const visible = ref(props.modelValue)
const saving = ref(false)
const errors = ref<Record<string, string>>({})

// Certification form data
const certifications = ref<Partial<Certification>[]>([
  {
    name: '',
    description: '',
    start_date: undefined,
    end_date: undefined,
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
    start_date: undefined,
    end_date: undefined,
    institute_name: '',
    certificate_pdf: ''
  })
}

const removeCertification = (index: number) => {
  if (certifications.value.length > 1) {
    certifications.value.splice(index, 1)
  }
}

const handleCertificateUpload = async (event: any, certificationIndex: number) => {
  const file = event.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('username', userStore.user?.username || 'default')
    formData.append('fileType', 'certificate')

    const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      certifications.value[certificationIndex]!.certificate_pdf = response.url
    }
  } catch (error) {
    console.error('Error uploading certificate:', error)
    // You might want to show a toast notification here
  }
}

const removeCertificate = (certificationIndex: number) => {
  certifications.value[certificationIndex]!.certificate_pdf = ''
}

const getFileIcon = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'pi pi-file-pdf'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'pi pi-image'
    default:
      return 'pi pi-file'
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
    start_date: undefined,
    end_date: undefined,
    institute_name: '',
    certificate_pdf: ''
  }]
  errors.value = {}
}
</script>
