<template>
  <Dialog 
    v-model:visible="isVisible" 
    modal 
    header="Add New Skill" 
    :style="{ width: '500px' }"
    @hide="closeDialog"
  >
    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Skill Name -->
      <div class="field">
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Skill Name *
        </label>
        <InputText
          id="name"
          v-model="form.name"
          placeholder="e.g., JavaScript, Python, React"
          class="w-full"
          :class="{ 'p-invalid': errors.name }"
          required
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>

      <!-- Category -->
      <div class="field">
        <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <div class="flex gap-2">
          <Dropdown
            id="category"
            v-model="form.category_id"
            :options="categoryOptions"
            option-label="name"
            option-value="id"
            placeholder="Select a category"
            class="flex-1"
            :filter="true"
            filter-placeholder="Type to search or create new category"
            @filter="onCategoryFilter"
            :allow-clear="true"
          />
          <Button
            icon="pi pi-plus"
            size="small"
            outlined
            @click="showNewCategoryInput = !showNewCategoryInput"
            :title="showNewCategoryInput ? 'Cancel' : 'Add New Category'"
          />
        </div>
        <div v-if="showNewCategoryInput" class="mt-2 space-y-2">
          <InputText
            v-model="newCategoryName"
            placeholder="Enter new category name"
            class="w-full"
            @keyup.enter="createNewCategory"
          />
          <div class="flex gap-2">
            <Button
              label="Create Category"
              size="small"
              @click="createNewCategory"
              :disabled="!newCategoryName.trim()"
            />
            <Button
              label="Cancel"
              size="small"
              severity="secondary"
              outlined
              @click="showNewCategoryInput = false; newCategoryName = ''"
            />
          </div>
        </div>
      </div>

      <!-- Proficiency Level -->
      <div class="field">
        <label for="proficiency" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Proficiency Level
        </label>
        <Dropdown
          id="proficiency"
          v-model="form.proficiency_level"
          :options="proficiencyOptions"
          placeholder="Select proficiency level"
          class="w-full"
        />
      </div>

      <!-- Description -->
      <div class="field">
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <Textarea
          id="description"
          v-model="form.description"
          placeholder="Describe your experience with this skill..."
          rows="3"
          class="w-full"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="closeDialog"
        />
        <Button 
          label="Add Skill" 
          :loading="loading"
          @click="submitForm"
        />
      </div>
    </template>
  </Dialog>
  
  <Toast />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import type { Category } from '../types'

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

const toast = useToast()
const isVisible = ref(props.modelValue)
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const showNewCategoryInput = ref(false)
const newCategoryName = ref('')

const form = ref({
  name: '',
  category_id: null as number | null,
  proficiency_level: 'intermediate',
  description: ''
})

const categoryOptions = ref<Category[]>([])

const proficiencyOptions = [
  'beginner',
  'intermediate', 
  'advanced',
  'expert'
]

watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue
})

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue)
  if (newValue) {
    fetchCategories()
  }
})

onMounted(() => {
  if (isVisible.value) {
    fetchCategories()
  }
})

const fetchCategories = async () => {
  try {
    const response = await $fetch<{success: boolean, data: Category[]}>('/api/categories', {
      query: { userId: props.userId }
    })
    if (response.success) {
      categoryOptions.value = response.data
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const createNewCategory = async () => {
  if (!newCategoryName.value.trim()) return
  
  try {
    const response = await $fetch<{success: boolean, data: Category}>('/api/categories', {
      method: 'POST',
      body: {
        user_id: props.userId,
        name: newCategoryName.value.trim()
      }
    })
    
    if (response.success) {
      categoryOptions.value.push(response.data)
      form.value.category_id = response.data.id
      newCategoryName.value = ''
      showNewCategoryInput.value = false
    }
  } catch (error) {
    console.error('Error creating category:', error)
    errors.value.category = 'Failed to create category'
  }
}

const onCategoryFilter = (event: any) => {
  const value = event.value.toLowerCase()
  if (value && !categoryOptions.value.some(cat => cat.name.toLowerCase() === value)) {
    // Allow creating new category if it doesn't exist
    newCategoryName.value = event.value
    showNewCategoryInput.value = true
  }
}

const closeDialog = () => {
  isVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    category_id: null,
    proficiency_level: 'intermediate',
    description: ''
  }
  errors.value = {}
  showNewCategoryInput.value = false
  newCategoryName.value = ''
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Skill name is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    const skillData = {
      profile_id: props.userId,
      name: form.value.name.trim(),
      category_id: form.value.category_id,
      proficiency_level: form.value.proficiency_level,
      description: form.value.description.trim() || null
    }
    
    const response = await $fetch<{success: boolean, data: any}>('/api/skills', {
      method: 'POST',
      body: skillData
    })
    
    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Skill added successfully!',
        life: 3000
      })
      emit('saved')
      closeDialog()
    }
  } catch (error: any) {
    console.error('Error adding skill:', error)
    errors.value.general = error.data?.message || 'Failed to add skill'
  } finally {
    loading.value = false
  }
}
</script>
