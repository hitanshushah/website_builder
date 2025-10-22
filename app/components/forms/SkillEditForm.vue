<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :state="state" @submit.prevent="submitForm" @keydown.enter.prevent="" class="space-y-4">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Skill</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Update your skill details</p>
        </div>

        <!-- Skill Name and Proficiency Level -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <UFormField label="Skill Name" help="Enter the name of the skill" required class="w-full">
            <UInput v-model="state.name" placeholder="Enter skill name" class="w-full" />
          </UFormField>

          <UFormField label="Proficiency Level" help="Select your proficiency level" class="w-full">
            <USelect
              v-model="state.proficiencyLevel"
              :items="proficiencyOptions"
              placeholder="Select proficiency level"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Category -->
        <UFormField label="Category" help="Select the skill category">
          <div class="flex gap-2">
            <USelect
              v-model="state.categoryId"
              :items="categoryOptions"
              placeholder="Select category"
              class="flex-1"
            />
            <UButton
              v-if="state.categoryId"
              label="Remove Category"
              size="sm"
              color="error"
              variant="subtle"
              @click="removeCategory"
            />
          </div>
        </UFormField>

        <!-- Description -->
        <!-- <UFormField label="Description" help="Brief description of the skill">
          <UTextarea 
            v-model="state.description" 
            placeholder="Brief description of the skill"
            :rows="3"
            class="w-full"
          />
        </UFormField> -->

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
import { useUserStore } from '../../../stores/user'

const props = defineProps<{
  skill: Skill
}>()

const emit = defineEmits<{
  (e: 'updated', skill: Skill): void
  (e: 'close'): void
}>()

const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Proficiency level options
const proficiencyOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

// Category options
const categoryOptions = ref<string[]>([])
const categoryMap = ref<Map<string, number>>(new Map())

// Reactive state for UForm
const state = reactive({
  name: props.skill.name || '',
  proficiencyLevel: props.skill.proficiency_level || '',
  categoryId: props.skill.category?.name || '',
  description: props.skill.description || ''
})

// Load categories from API
onMounted(async () => {
  try {
    const userId = userStore.user?.id
    if (!userId) return

    const response = await $fetch('/api/categories', {
      query: { userId }
    })
    
    // Handle both possible response formats
    let categories: Array<{id: number, name: string}> = []
    if (response.success && response.data) {
      categories = response.data
    } else if (Array.isArray(response)) {
      categories = response
    } else if (response.data && Array.isArray(response.data)) {
      categories = response.data
    }
    
    if (categories.length > 0) {
      categoryOptions.value = categories.map((cat) => cat.name)
      categoryMap.value = new Map(categories.map((cat) => [cat.name, cat.id]))
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
})

const removeCategory = () => {
  state.categoryId = ''
}

const submitForm = async () => {
  try {
    loading.value = true
    error.value = null

    // Map form data to API format
    const categoryId = state.categoryId ? categoryMap.value.get(state.categoryId) : null
    const proficiencyLevel = state.proficiencyLevel ? state.proficiencyLevel.toLowerCase() : 'intermediate'
    
    const skillData = {
      id: props.skill.id,
      name: state.name,
      proficiency_level: proficiencyLevel,
      category_id: categoryId,
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
