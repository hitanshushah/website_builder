<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Add Education" 
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="space-y-6">
      <!-- Education List -->
      <div v-for="(education, index) in educationList" :key="index" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Education {{ index + 1 }}
          </h3>
          <Button 
            v-if="educationList.length > 1"
            icon="pi pi-trash" 
            severity="danger" 
            text 
            size="small"
            @click="removeEducation(index)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- University Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University Name *
            </label>
            <InputText 
              v-model="education.university_name"
              placeholder="Enter university name"
              class="w-full"
              :class="{ 'p-invalid': errors[`${index}.university_name`] }"
            />
            <small v-if="errors[`${index}.university_name`]" class="text-red-500">
              {{ errors[`${index}.university_name`] }}
            </small>
          </div>

          <!-- Degree -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Degree *
            </label>
            <InputText 
              v-model="education.degree"
              placeholder="Enter degree (e.g., Bachelor of Science in Computer Science)"
              class="w-full"
              :class="{ 'p-invalid': errors[`${index}.degree`] }"
            />
            <small v-if="errors[`${index}.degree`]" class="text-red-500">
              {{ errors[`${index}.degree`] }}
            </small>
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <Calendar 
              v-model="education.from_date"
              placeholder="Select start date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :showIcon="true"
            />
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <Calendar 
              v-model="education.end_date"
              placeholder="Select end date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :showIcon="true"
              :minDate="education.from_date || undefined"
            />
            <div class="flex items-center mt-2">
              <Checkbox 
                v-model="education.is_ongoing"
                inputId="ongoing"
                :binary="true"
              />
              <label for="ongoing" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Currently studying
              </label>
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <InputText 
              v-model="education.location"
              placeholder="Enter location (e.g., New York, NY)"
              class="w-full"
            />
          </div>

          <!-- CGPA -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CGPA/GPA
            </label>
            <InputNumber 
              v-model="education.cgpa"
              placeholder="Enter CGPA/GPA"
              class="w-full"
              :min="0"
              :max="10"
              :step="0.01"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
          </div>
        </div>
      </div>

      <!-- Add More Button -->
      <div class="flex justify-center">
        <Button 
          label="Add Another Education" 
          icon="pi pi-plus" 
          outlined
          @click="addEducation"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="closeDialog"
          :disabled="saving"
        />
        <Button 
          label="Save Education" 
          @click="saveEducation"
          :loading="saving"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

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

const educationList = ref([{
  university_name: '',
  degree: '',
  from_date: null as Date | null,
  end_date: null as Date | null,
  location: '',
  cgpa: null as number | null,
  is_ongoing: false
}])

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

// Watch for visible changes and emit to parent
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const addEducation = () => {
  educationList.value.push({
    university_name: '',
    degree: '',
    from_date: null,
    end_date: null,
    location: '',
    cgpa: null,
    is_ongoing: false
  })
}

const removeEducation = (index: number) => {
  if (educationList.value.length > 1) {
    educationList.value.splice(index, 1)
  }
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  educationList.value.forEach((education, index) => {
    if (!education.university_name?.trim()) {
      errors.value[`${index}.university_name`] = 'University name is required'
      isValid = false
    }
    if (!education.degree?.trim()) {
      errors.value[`${index}.degree`] = 'Degree is required'
      isValid = false
    }
  })

  return isValid
}

const saveEducation = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  errors.value = {}

  try {
    // Prepare data for each education record
    for (const education of educationList.value) {
      const educationData = {
        userId: props.userId,
        university_name: education.university_name,
        degree: education.degree,
        from_date: education.from_date ? education.from_date.toISOString().split('T')[0] : null,
        end_date: education.is_ongoing ? null : (education.end_date ? education.end_date.toISOString().split('T')[0] : null),
        location: education.location || null,
        cgpa: education.cgpa || null
      }

      await $fetch('/api/education', {
        method: 'POST',
        body: educationData
      })
    }

    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Error saving education:', error)
    // Handle error - could show a toast message
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  visible.value = false
  // Reset form
  educationList.value = [{
    university_name: '',
    degree: '',
    from_date: null,
    end_date: null,
    location: '',
    cgpa: null,
    is_ongoing: false
  }]
  errors.value = {}
}
</script>
