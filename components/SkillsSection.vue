<template>
  <div class="w-full">
    <div v-if="skills.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-cog text-4xl mb-4"></i>
      <p>No skills available</p>
    </div>
    <div v-else class="space-y-4">
      <!-- Group skills by category -->
      <div 
        v-for="(categorySkills, category) in groupedSkills" 
        :key="category"
        class="mb-4"
      >
        <!-- Category Header -->
        <div class="flex items-center justify-between mb-2" style="margin-bottom: 10px !important;">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {{ category || 'Other Skills' }}
          </h3>
          <Button
            v-if="category && category !== 'Other Skills'"
            icon="pi pi-trash"
            size="small"
            severity="danger"
            text
            rounded
            @click="deleteCategory(category)"
            :title="`Delete ${category} category`"
            class="opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
        
        <!-- Skills as Tags -->
        <div class="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div 
            v-for="skill in categorySkills" 
            :key="skill.id"
            class="relative group"
          >
            <Tag 
              :value="skill.name"
              severity="green"
              class="text-sm pr-8"
              rounded
            />
            <Button
              icon="pi pi-times"
              size="small"
              severity="danger"
              text
              rounded
              @click="deleteSkill(skill.id)"
              :title="`Delete ${skill.name}`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Dialog 
      v-model:visible="showConfirmModal" 
      modal 
      :header="confirmModalTitle" 
      :style="{ width: '400px' }"
    >
      <div class="text-center py-4">
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          {{ confirmModalMessage }}
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="Cancel" 
            severity="secondary" 
            @click="showConfirmModal = false"
          />
          <Button 
            label="Delete" 
            severity="danger"
            @click="confirmDelete"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Skill } from '../types'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { computed, ref } from 'vue'

interface Props {
  skills: Skill[]
  userId: number
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Confirmation modal state
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const pendingDelete = ref<{
  type: 'skill' | 'category'
  id?: number
  name?: string
} | null>(null)

const groupedSkills = computed(() => {
  const groups: Record<string, Skill[]> = {}
  
  props.skills.forEach(skill => {
    const category = skill.category?.name || 'Other Skills'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(skill)
  })
  
  // Sort categories alphabetically, but put "Other Skills" last
  const sortedGroups: Record<string, Skill[]> = {}
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === 'Other Skills') return 1
    if (b === 'Other Skills') return -1
    return a.localeCompare(b)
  })
  
  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key] || []
  })
  
  return sortedGroups
})

const deleteSkill = (skillId: number) => {
  const skill = props.skills.find(s => s.id === skillId)
  if (!skill) return

  pendingDelete.value = { type: 'skill', id: skillId, name: skill.name }
  confirmModalTitle.value = 'Delete Skill'
  confirmModalMessage.value = `Are you sure you want to delete "${skill.name}"?`
  showConfirmModal.value = true
}

const deleteCategory = (categoryName: string) => {
  pendingDelete.value = { type: 'category', name: categoryName }
  confirmModalTitle.value = 'Delete Category'
  confirmModalMessage.value = `Are you sure you want to delete the "${categoryName}" category? All skills in this category will be moved to "Other Skills".`
  showConfirmModal.value = true
}

const confirmDelete = async () => {
  if (!pendingDelete.value) return

  try {
    if (pendingDelete.value.type === 'skill' && pendingDelete.value.id) {
      const response = await $fetch<{success: boolean, message: string}>(`/api/skills?id=${pendingDelete.value.id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        emit('refresh')
      }
    } else if (pendingDelete.value.type === 'category' && pendingDelete.value.name) {
      // Find the category ID from the skills data
      const categorySkill = props.skills.find(skill => skill.category?.name === pendingDelete.value?.name)
      if (!categorySkill?.category?.id) {
        alert('Category not found')
        return
      }

      const response = await $fetch<{success: boolean, message: string}>(`/api/categories?id=${categorySkill.category.id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        emit('refresh')
      }
    }
  } catch (error) {
    console.error('Error deleting:', error)
    alert('Failed to delete')
  } finally {
    showConfirmModal.value = false
    pendingDelete.value = null
  }
}
</script>
