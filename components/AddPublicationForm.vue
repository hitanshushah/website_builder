<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Add Publications" 
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="space-y-6">
      <!-- Publication List -->
      <div v-for="(publication, index) in publications" :key="index" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Publication {{ index + 1 }}
          </h3>
          <Button 
            v-if="publications.length > 1"
            icon="pi pi-trash" 
            severity="danger" 
            text 
            size="small"
            @click="removePublication(index)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Paper Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paper Name *
            </label>
            <InputText 
              v-model="publication.paper_name"
              placeholder="Enter paper name"
              class="w-full"
              :class="{ 'p-invalid': errors[`${index}.paper_name`] }"
            />
            <small v-if="errors[`${index}.paper_name`]" class="text-red-500">
              {{ errors[`${index}.paper_name`] }}
            </small>
          </div>

          <!-- Conference Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conference/Journal Name
            </label>
            <InputText 
              v-model="publication.conference_name"
              placeholder="Enter conference or journal name"
              class="w-full"
            />
          </div>

          <!-- Published Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Published Date
            </label>
            <Calendar 
              placeholder="Select published date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :model-value="publication.published_date ? new Date(publication.published_date) : null"
              @update:model-value="(value: Date | null) => publication.published_date = value ? value.toISOString().split('T')[0] : undefined"
            />
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Textarea 
              v-model="publication.description"
              placeholder="Describe the publication"
              rows="3"
              class="w-full"
            />
          </div>

          <!-- Paper PDF -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paper PDF
            </label>
            <div class="flex items-center gap-4">
              <div v-if="publication.paper_pdf" class="flex items-center gap-2">
                <div class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i :class="getFileIcon(publication.paper_pdf)" style="color: green"></i>
                  <span class="text-sm text-black" style="color: black">Paper uploaded</span>
                </div>
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  text 
                  size="small"
                  @click="removePaper(index)"
                />
              </div>
              <FileUpload 
                mode="basic"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                :maxFileSize="10000000"
                @select="(event) => handlePaperUpload(event, index)"
                :auto="false"
                chooseLabel="Choose Paper"
                class="w-full"
              />
            </div>
            <small class="text-gray-500 dark:text-gray-400">
              Upload a paper (PDF, PNG, JPG, GIF, WebP - max 10MB)
            </small>
          </div>

          <!-- Paper Link -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paper Link
            </label>
            <InputText 
              v-model="publication.paper_link"
              placeholder="Enter paper link"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Add Another Publication Button -->
      <div class="text-center">
        <Button 
          icon="pi pi-plus" 
          label="Add Another Publication" 
          severity="secondary"
          @click="addPublication"
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
          label="Save Publications" 
          :loading="saving"
          @click="savePublications"
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
import type { Publication } from '../types'
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

// Publication form data
const publications = ref<Partial<Publication>[]>([
  {
    paper_name: '',
    conference_name: '',
    description: '',
    published_date: undefined,
    paper_pdf: '',
    paper_link: ''
  }
])

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const addPublication = () => {
  publications.value.push({
    paper_name: '',
    conference_name: '',
    description: '',
    published_date: undefined,
    paper_pdf: '',
    paper_link: ''
  })
}

const removePublication = (index: number) => {
  if (publications.value.length > 1) {
    publications.value.splice(index, 1)
  }
}

const handlePaperUpload = async (event: any, publicationIndex: number) => {
  const file = event.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('username', userStore.user?.username || 'default')
    formData.append('fileType', 'publication')

    const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      publications.value[publicationIndex]!.paper_pdf = response.url
    }
  } catch (error) {
    console.error('Error uploading paper:', error)
    // You might want to show a toast notification here
  }
}

const removePaper = (publicationIndex: number) => {
  publications.value[publicationIndex]!.paper_pdf = ''
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

  publications.value.forEach((publication, index) => {
    if (!publication.paper_name?.trim()) {
      errors.value[`${index}.paper_name`] = 'Paper name is required'
      isValid = false
    }
  })

  return isValid
}

const savePublications = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  errors.value = {}

  try {
    const publicationsToSave = publications.value.map(publication => ({
      paper_name: publication.paper_name?.trim(),
      conference_name: publication.conference_name?.trim(),
      description: publication.description?.trim(),
      published_date: publication.published_date,
      paper_pdf: publication.paper_pdf?.trim(),
      paper_link: publication.paper_link?.trim()
    }))

    await $fetch('/api/publications', {
      method: 'POST',
      body: {
        userId: props.userId,
        publications: publicationsToSave
      }
    })

    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Error saving publications:', error)
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  visible.value = false
  // Reset form
  publications.value = [{
    paper_name: '',
    conference_name: '',
    description: '',
    published_date: undefined,
    paper_pdf: '',
    paper_link: ''
  }]
  errors.value = {}
}
</script>
