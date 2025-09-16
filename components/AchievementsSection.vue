<template>
  <div class="w-full">
    <div v-if="achievements.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-trophy text-4xl mb-4"></i>
      <p>No achievements available</p>
    </div>
    <div v-else class="space-y-3">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <i class="pi pi-star-fill text-yellow-500 mt-1 flex-shrink-0"></i>
          <p class="text-gray-700 dark:text-gray-300">{{ achievement.description }}</p>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Achievement } from '../types'

interface Props {
  achievements: Achievement[]
}

defineProps<Props>()
</script>
