<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Add Experience" 
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="space-y-6">
      <!-- Experience List -->
      <div v-for="(experience, index) in experiences" :key="index" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Experience {{ index + 1 }}
          </h3>
          <Button 
            v-if="experiences.length > 1"
            icon="pi pi-trash" 
            severity="danger" 
            text 
            size="small"
            @click="removeExperience(index)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Company Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name *
            </label>
            <InputText 
              v-model="experience.company_name"
              placeholder="Enter company name"
              class="w-full"
              :class="{ 'p-invalid': errors[`${index}.company_name`] }"
            />
            <small v-if="errors[`${index}.company_name`]" class="text-red-500">
              {{ errors[`${index}.company_name`] }}
            </small>
          </div>

          <!-- Role -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role *
            </label>
            <InputText 
              v-model="experience.role"
              placeholder="Enter your role"
              class="w-full"
              :class="{ 'p-invalid': errors[`${index}.role`] }"
            />
            <small v-if="errors[`${index}.role`]" class="text-red-500">
              {{ errors[`${index}.role`] }}
            </small>
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <Calendar 
              v-model="experience.start_date"
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
              v-model="experience.end_date"
              placeholder="Select end date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :minDate="experience.start_date"
            />
            <div class="flex items-center mt-2">
              <Checkbox 
                v-model="experience.is_current"
                inputId="current"
                :binary="true"
              />
              <label for="current" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Currently working here
              </label>
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <InputText 
              v-model="experience.location"
              placeholder="Enter location"
              class="w-full"
            />
          </div>

          <!-- Company Logo -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Logo
            </label>
            <div class="flex items-center gap-4">
              <div v-if="experience.company_logo" class="flex items-center gap-2">
                <img 
                  :src="experience.company_logo" 
                  alt="Company logo" 
                  class="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  text 
                  size="small"
                  @click="removeCompanyLogo(index)"
                />
              </div>
              <FileUpload 
                mode="basic"
                accept="image/*"
                :maxFileSize="5000000"
                @select="(event) => handleLogoUpload(event, index)"
                :auto="false"
                chooseLabel="Choose Logo"
                class="w-full"
              />
            </div>
            <small class="text-gray-500 dark:text-gray-400">
              Upload a company logo (max 5MB, JPG, PNG, GIF, WebP)
            </small>
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Textarea 
              v-model="experience.description"
              placeholder="Describe your role and responsibilities"
              rows="3"
              class="w-full"
            />
          </div>

          <!-- Skills -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skills
            </label>
            <div class="space-y-2">
              <div v-for="(skill, skillIndex) in experience.skills" :key="skillIndex" class="flex items-center gap-2">
                <InputText 
                  v-model="experience.skills[skillIndex]"
                  placeholder="Enter skill"
                  class="flex-1"
                />
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  text 
                  size="small"
                  @click="removeSkill(index, skillIndex)"
                />
              </div>
              <Button 
                icon="pi pi-plus" 
                label="Add Skill" 
                size="small" 
                text
                @click="addSkill(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Add Another Experience Button -->
      <div class="text-center">
        <Button 
          icon="pi pi-plus" 
          label="Add Another Experience" 
          severity="secondary"
          @click="addExperience"
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
          label="Save Experiences" 
          :loading="saving"
          @click="saveExperiences"
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
import Checkbox from 'primevue/checkbox'
import FileUpload from 'primevue/fileupload'
import type { Experience } from '../types'
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

// Experience form data
const experiences = ref<Partial<Experience>[]>([
  {
    company_name: '',
    role: '',
    start_date: null,
    end_date: null,
    description: '',
    skills: [],
    location: '',
    is_current: false,
    company_logo: ''
  }
])

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const addExperience = () => {
  experiences.value.push({
    company_name: '',
    role: '',
    start_date: null,
    end_date: null,
    description: '',
    skills: [],
    location: '',
    is_current: false,
    company_logo: ''
  })
}

const removeExperience = (index: number) => {
  if (experiences.value.length > 1) {
    experiences.value.splice(index, 1)
  }
}

const addSkill = (experienceIndex: number) => {
  if (!experiences.value[experienceIndex].skills) {
    experiences.value[experienceIndex].skills = []
  }
  experiences.value[experienceIndex].skills!.push('')
}

const removeSkill = (experienceIndex: number, skillIndex: number) => {
  experiences.value[experienceIndex].skills!.splice(skillIndex, 1)
}

const handleLogoUpload = async (event: any, experienceIndex: number) => {
  const file = event.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('username', userStore.user?.username || 'default')

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      experiences.value[experienceIndex].company_logo = response.url
    }
  } catch (error) {
    console.error('Error uploading logo:', error)
    // You might want to show a toast notification here
  }
}

const removeCompanyLogo = (experienceIndex: number) => {
  experiences.value[experienceIndex].company_logo = ''
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  experiences.value.forEach((experience, index) => {
    if (!experience.company_name?.trim()) {
      errors.value[`${index}.company_name`] = 'Company name is required'
      isValid = false
    }
    if (!experience.role?.trim()) {
      errors.value[`${index}.role`] = 'Role is required'
      isValid = false
    }
  })

  return isValid
}

const saveExperiences = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  errors.value = {}

  try {
    // Filter out empty skills and prepare data
    const experiencesToSave = experiences.value.map(exp => ({
      ...exp,
      skills: exp.skills?.filter(skill => skill.trim()) || [],
      end_date: exp.is_current ? null : exp.end_date
    }))

    await $fetch('/api/experiences', {
      method: 'POST',
      body: {
        userId: props.userId,
        experiences: experiencesToSave
      }
    })

    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Error saving experiences:', error)
    // Handle error - could show a toast message
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  visible.value = false
  // Reset form
  experiences.value = [{
    company_name: '',
    role: '',
    start_date: null,
    end_date: null,
    description: '',
    skills: [],
    location: '',
    is_current: false,
    company_logo: ''
  }]
  errors.value = {}
}
</script>
