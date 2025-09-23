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
        class="bg-white dark:bg-gray-800"
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-gray-900 dark:text-white">{{ categoryName || 'Other Skills' }}</h4>
            <UButton 
              v-if="categoryName && categoryName !== 'Other Skills'"
              size="xs" 
              variant="ghost" 
              color="error"
              @click="deleteCategory(categoryName, categorySkills[0]?.category?.id)"
              class="ml-2"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </UButton>
          </div>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="skill in categorySkills" 
              :key="skill.id"
              class="flex items-center gap-2"
            >
              <UBadge 
                :color="getSkillColor(skill.proficiency_level)" 
                variant="soft"
                class="flex items-center gap-2"
              >
                {{ skill.name }}
                <span v-if="skill.proficiency_level" class="text-xs opacity-75">
                  ({{ skill.proficiency_level }})
                </span>
              </UBadge>
              <UButton 
                size="xs" 
                variant="ghost" 
                color="error"
                @click="deleteSkill(skill)"
                class="ml-1"
              >
                <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>

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
}>()

const emit = defineEmits<{
  (e: 'deleted', skillId: number): void
  (e: 'categoryDeleted', categoryId: number): void
}>()

const showDeleteModal = ref(false)
const deleteItemType = ref('')
const deleteItemName = ref('')
const deleteItemId = ref(0)
const deleteApi = ref('')

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
  
  return props.skills.reduce((groups, skill) => {
    const categoryName = skill.category?.name || 'Other Skills'
    if (!groups[categoryName]) {
      groups[categoryName] = []
    }
    groups[categoryName].push(skill)
    return groups
  }, {} as Record<string, Skill[]>)
})

const getSkillColor = (proficiencyLevel?: string) => {
  if (!proficiencyLevel) return 'info'
  
  const level = proficiencyLevel.toLowerCase()
  if (level.includes('expert') || level.includes('advanced')) return 'primary'
  if (level.includes('intermediate')) return 'warning'
  if (level.includes('beginner')) return 'error'
  return 'info'
}
</script>
