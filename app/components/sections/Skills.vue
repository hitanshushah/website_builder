<template>
  <div class="space-y-4">
    <div v-if="!skills || skills.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🛠️</span>
      <p>No skills data available</p>
    </div>

    <div v-else>
      <!-- Group skills by category -->
    <UCard 
      v-for="(categorySkills, categoryName) in groupedSkills" 
      :key="categoryName"
      class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-4"
    >
      <!-- Category Header -->
      <div class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">
        <h4 class="font-semibold text-gray-900 dark:text-white">{{ categoryName || 'Other Skills' }}</h4>
        <UButton 
          v-if="categoryName && categoryName !== 'Other Skills'"
          size="sm" 
          variant="ghost" 
          color="error"
          @click="deleteCategory(categoryName, categorySkills[0]?.category?.id)"
        >
          <UIcon name="i-heroicons-trash" class="w-4 h-4" />
        </UButton>
      </div>

       <!-- Skills List -->
       <div class="flex flex-wrap gap-3 items-center">
         <div 
           v-for="skill in categorySkills" 
           :key="skill.id" 
           class="flex items-center gap-2"
         >
           <!-- Skill Badge -->
           <UBadge 
             :color="getSkillColor(skill.proficiency_level)" 
             variant="soft"
             class="flex items-center gap-1"
           >
             {{ skill.name }}
             <span v-if="skill.proficiency_level" class="text-xs opacity-75">
               ({{ skill.proficiency_level }})
             </span>
           </UBadge>
     
           <!-- Action Buttons -->
           <ActionButtons 
             :item="skill"
             item-type="Skill"
             :item-name="skill.name"
             size="xs"
             container-class=""
             @toggle-visibility="toggleVisibility"
             @edit="editSkill"
             @delete="deleteSkill"
           />
         </div>
       </div>
    </UCard>

    </div>
  </div>

  <!-- Edit Skill Modal -->
  <FormsSkillEditForm 
    v-if="editingSkill"
    :skill="editingSkill"
    :categories="categories"
    @updated="handleSkillUpdated"
    @close="closeEditModal"
  />

  <!-- Delete Confirmation Modal -->
  <ModalsDeleteConfirmModal 
    v-if="showDeleteModal"
    :item-type="deleteItemType"
    :item-name="deleteItemName"
    :item-id="deleteItemId"
    :delete-api="deleteApi"
    @cancel="closeDeleteModal"
    @deleted="handleDeleteSuccess"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Skill } from '@/types'

const props = defineProps<{
  skills: Skill[]
  categories?: any[]
}>()

const emit = defineEmits<{
  (e: 'deleted', skillId: number): void
  (e: 'categoryDeleted', categoryId: number): void
  (e: 'updated', skill: Skill): void
  (e: 'visibilityToggled', skill: Skill): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')
const editingSkill = ref<Skill | null>(null)

const deleteSkill = (skill: Skill) => {
  deleteItemType.value = 'Skill'
  deleteItemName.value = skill.name
  deleteItemId.value = skill.id
  deleteApi.value = '/api/skills'
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  if (deleteItemType.value === 'Category') {
    emit('categoryDeleted', deleteItemId.value)
  } else {
    emit('deleted', deleteItemId.value)
  }
}

const editSkill = (skill: Skill) => {
  editingSkill.value = skill
}

const closeEditModal = () => {
  editingSkill.value = null
}

const handleSkillUpdated = (updatedSkill: Skill) => {
  editingSkill.value = null
  emit('updated', updatedSkill)
}

const deleteCategory = (categoryName: string, categoryId?: number) => {
  if (!categoryId) return
  
  deleteItemType.value = 'Category'
  deleteItemName.value = categoryName
  deleteItemId.value = categoryId
  deleteApi.value = '/api/categories'
  showDeleteModal.value = true
}

const groupedSkills = computed(() => {
  if (!props.skills) return {}
  
  const groups = props.skills.reduce((groups, skill) => {
    const categoryName = skill.category?.name || 'Other Skills'
    if (!groups[categoryName]) {
      groups[categoryName] = []
    }
    groups[categoryName].push(skill)
    return groups
  }, {} as Record<string, Skill[]>)

  // Sort so "Other Skills" appears last
  const sortedGroups: Record<string, Skill[]> = {}
  const categoryNames = Object.keys(groups).sort((a, b) => {
    if (a === 'Other Skills') return 1
    if (b === 'Other Skills') return -1
    return a.localeCompare(b)
  })

  categoryNames.forEach(name => {
    if (groups[name]) {
      sortedGroups[name] = groups[name]
    }
  })

  return sortedGroups
})

const toggleVisibility = async (skill: Skill) => {
  try {
    const response = await $fetch<{ success: boolean; skill: Skill }>('/api/skills.toggle', {
      method: 'POST',
      body: { id: skill.id }
    })
    
    if (response.success) {
      emit('visibilityToggled', response.skill)
    }
  } catch (error) {
    console.error('Error toggling skill visibility:', error)
  }
}

const getSkillColor = (proficiencyLevel?: string) => {
  if (!proficiencyLevel) return 'info'
  
  const level = proficiencyLevel.toLowerCase()
  if (level.includes('expert') || level.includes('advanced')) return 'primary'
  if (level.includes('intermediate')) return 'warning'
  if (level.includes('beginner')) return 'error'
  return 'info'
}
</script>
