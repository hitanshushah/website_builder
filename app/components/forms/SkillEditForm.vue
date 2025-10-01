<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-4">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Skill</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your skill details</p>
        </div>

        <!-- Skill Name -->
        <UFormField label="Skill Name" help="Enter the name of the skill" required>
          <UInput v-model="state.name" placeholder="Enter skill name" />
        </UFormField>

        <!-- Proficiency Level -->
        <UFormField label="Proficiency Level" help="Select your proficiency level">
          <USelect
            v-model="state.proficiencyLevel"
            :options="proficiencyOptions"
            placeholder="Select proficiency level"
          />
        </UFormField>

        <!-- Category -->
        <UFormField label="Category" help="Select the skill category">
          <USelect
            v-model="state.categoryId"
            :options="categoryOptions"
            placeholder="Select category"
            option-attribute="name"
            value-attribute="id"
          />
        </UFormField>

        <!-- Description -->
        <UFormField label="Description" help="Brief description of the skill">
          <UTextarea 
            v-model="state.description" 
            placeholder="Brief description of the skill"
            :rows="3"
          />
        </UFormField>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-4">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="button" color="primary" :loading="loading" :disabled="loading" @click="submitForm">
            {{ loading ? 'Updating...' : 'Update Skill' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { Skill, Category } from '@/types'

const props = defineProps<{
  skill: Skill
  categories?: Category[]
}>()

const emit = defineEmits<{
  (e: 'updated', skill: Skill): void
  (e: 'close'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Proficiency level options
const proficiencyOptions = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' }
]

// Category options
const categoryOptions = ref<Category[]>([])

// Reactive state for UForm
const state = reactive({
  name: props.skill.name || '',
  proficiencyLevel: props.skill.proficiency_level || '',
  categoryId: props.skill.category?.id || null,
  description: props.skill.description || ''
})

// Load categories if not provided
onMounted(async () => {
  if (!props.categories) {
    try {
      const response = await $fetch('/api/categories')
      if (response.success) {
        categoryOptions.value = response.categories
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  } else {
    categoryOptions.value = props.categories
  }
})

const submitForm = async () => {
  try {
    loading.value = true
    error.value = null

    // Map form data to API format
    const skillData = {
      id: props.skill.id,
      name: state.name,
      proficiency_level: state.proficiencyLevel,
      category_id: state.categoryId,
      description: state.description
    }

    const response = await $fetch('/api/skills', {
      method: 'PUT',
      body: skillData
    })

    if (response.success) {
      toast.add({
        title: 'Skill updated successfully',
        color: 'success'
      })
      emit('updated', response.skill)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error updating skill:', err)
    
    // Show error toast
    toast.add({
      title: 'Failed to update skill',
      color: 'error'
    })
    
    // Handle specific error cases for form display
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'Skill not found'
    } else {
      error.value = err.data?.message || err.message || 'Failed to update skill'
    }
  } finally {
    loading.value = false
  }
}
</script>
