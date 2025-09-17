<template>
  <div class="w-full">
    <div v-if="achievements.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-trophy text-4xl mb-4"></i>
      <p>No achievements available</p>
    </div>
    <div v-else class="space-y-6">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
        style="padding: 5px;"
      >

        <!-- Achievement Description -->
        <div>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed ml-5">{{ achievement.description }}</p>
        </div>
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
