<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 mx-4">
      <UForm :schema="schema" :state="state" @submit="onSubmit" @keydown.enter.prevent="" class="space-y-4">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Skill</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Add a new skill to your profile</p>
        </div>

        <!-- Skill Name -->
        <UFormField name="name" label="Skill Name" required>
          <UInput v-model="state.name" placeholder="Enter skill name" class="w-full" />
        </UFormField>

        <!-- Category Selection -->
        <UFormField name="categoryId" label="Category">
          <div class="space-y-2">
            <div class="flex gap-2">
              <USelect
                v-model="state.categoryId"
                :items="categoryOptions"
                placeholder="Select a category"
                class="flex-1"
                searchable
                searchable-placeholder="Type to search or create new category"
                @search="onCategorySearch"
              />
              <UButton
                :label="showNewCategory ? 'Cancel' : 'Create Category'"
                size="sm"
                variant="outline"
                @click="toggleNewCategory"
              />
            </div>
            
            <!-- New Category Input -->
            <div v-if="showNewCategory" class="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <UInput
                v-model="newCategoryName"
                placeholder="Enter new category name"
                @keyup.enter="createNewCategory"
              />
              <div class="flex gap-2">
                <UButton
                  label="Create Category"
                  size="sm"
                  @click="createNewCategory"
                  :disabled="!newCategoryName.trim()"
                  :loading="creatingCategory"
                />
                <UButton
                  label="Cancel"
                  size="sm"
                  color="neutral"
                  variant="outline"
                  @click="cancelNewCategory"
                />
              </div>
            </div>
          </div>
        </UFormField>

        <!-- Proficiency Level -->
        <UFormField name="proficiencyLevel" label="Proficiency Level">
          <USelect
            v-model="state.proficiencyLevel"
            :items="proficiencyOptions"
            placeholder="Select proficiency level"
          />
        </UFormField>


        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-4">
          <UButton type="button" color="neutral" @click="emit('close')" :disabled="loading">Cancel</UButton>
          <UButton type="submit" color="primary" :loading="loading" :disabled="loading">
            {{ loading ? 'Saving...' : 'Add Skill' }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { reactive, ref, watch, onMounted } from 'vue'
import { useUserStore } from '../../../stores/user'

const schema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  categoryId: z.string().optional(),
  proficiencyLevel: z.string().optional()
})

type Schema = z.output<typeof schema>

const emit = defineEmits<{
  (e: 'save', data: any): void
  (e: 'close'): void
}>()

const userStore = useUserStore()
const loading = ref(false)
const creatingCategory = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

const state = reactive<Schema>({
  name: '',
  categoryId: '',
  proficiencyLevel: 'Intermediate'
})

const categoryOptions = ref<string[]>([])
const categoryMap = ref<Map<string, number>>(new Map())

const showNewCategory = ref(false)
const newCategoryName = ref('')

const proficiencyOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

// Watch for category search to show new category option
const onCategorySearch = (query: string) => {
  if (query && !categoryOptions.value.some(cat => cat.toLowerCase() === query.toLowerCase())) {
    newCategoryName.value = query
    showNewCategory.value = true
  }
}

const toggleNewCategory = () => {
  showNewCategory.value = !showNewCategory.value
  if (!showNewCategory.value) {
    newCategoryName.value = ''
  }
}

const cancelNewCategory = () => {
  showNewCategory.value = false
  newCategoryName.value = ''
}

const createNewCategory = async () => {
  if (!newCategoryName.value.trim()) return
  
  try {
    creatingCategory.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const response = await $fetch<{success: boolean, data: {id: number, name: string}}>('/api/categories', {
      method: 'POST',
      body: {
        user_id: userId,
        name: newCategoryName.value.trim()
      }
    })
    
    if (response.success) {
      // Add new category to options
      categoryOptions.value.push(response.data.name)
      categoryMap.value.set(response.data.name, response.data.id)
      state.categoryId = response.data.name
      newCategoryName.value = ''
      showNewCategory.value = false
      
      toast.add({
        title: 'Category created successfully',
        color: 'success'
      })
    }
  } catch (err: any) {
    console.error('Error creating category:', err)
    error.value = err.data?.message || 'Failed to create category'
  } finally {
    creatingCategory.value = false
  }
}

const fetchCategories = async () => {
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
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    error.value = null

    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get profile_id for the user from the projectsboard API
    const profileResponse = await $fetch('/api/projectsboard', {
      query: { userId }
    })
    
    if (!profileResponse?.userProfile?.profile_id) {
      throw new Error('Profile not found')
    }

    const profileId = profileResponse.userProfile.profile_id

    // Prepare skill data
    const categoryId = state.categoryId ? categoryMap.value.get(state.categoryId) : null
    const proficiencyLevel = state.proficiencyLevel ? state.proficiencyLevel.toLowerCase() : 'intermediate'
    
    const skillData = {
      profile_id: profileId,
      name: state.name.trim(),
      category_id: categoryId,
      proficiency_level: proficiencyLevel,
      description: null
    }

    const response = await $fetch('/api/skills', {
      method: 'POST',
      body: skillData
    })

    if (response.success) {
      toast.add({
        title: 'Skill added successfully',
        color: 'success'
      })
      emit('save', response.data)
      emit('close')
    }
  } catch (err: any) {
    console.error('Error adding skill:', err)
    
    toast.add({
      title: 'Failed to add skill',
      color: 'error'
    })
    
    if (err.statusCode === 400) {
      error.value = err.data?.message || 'Please check your input data'
    } else if (err.statusCode === 404) {
      error.value = 'User profile not found. Please try logging in again.'
    } else {
      error.value = err.data?.message || err.message || 'Failed to add skill'
    }
  } finally {
    loading.value = false
  }
}

// Fetch categories when component mounts
onMounted(() => {
  fetchCategories()
})
</script>
