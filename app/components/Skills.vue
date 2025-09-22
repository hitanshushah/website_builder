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
          <h4 class="font-semibold text-gray-900 dark:text-white mb-3">{{ categoryName || 'Other Skills' }}</h4>
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
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Skill } from '@/types'

const props = defineProps<{
  skills: Skill[]
}>()

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
  if (!proficiencyLevel) return 'blue'
  
  const level = proficiencyLevel.toLowerCase()
  if (level.includes('expert') || level.includes('advanced')) return 'green'
  if (level.includes('intermediate')) return 'yellow'
  if (level.includes('beginner')) return 'red'
  return 'blue'
}
</script>
