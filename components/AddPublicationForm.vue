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
              v-model="publication.published_date"
              placeholder="Select published date"
              dateFormat="yy-mm-dd"
              class="w-full"
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
              Paper PDF URL
            </label>
            <InputText 
              v-model="publication.paper_pdf"
              placeholder="Enter paper PDF URL"
              class="w-full"
            />
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
import type { Publication } from '../types'

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

// Publication form data
const publications = ref<Partial<Publication>[]>([
  {
    paper_name: '',
    conference_name: '',
    description: '',
    published_date: null,
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
    published_date: null,
    paper_pdf: '',
    paper_link: ''
  })
}

const removePublication = (index: number) => {
  if (publications.value.length > 1) {
    publications.value.splice(index, 1)
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
    published_date: null,
    paper_pdf: '',
    paper_link: ''
  }]
  errors.value = {}
}
</script>
