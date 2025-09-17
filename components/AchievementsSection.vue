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
        style="padding: 24px;"
      >
        <!-- Achievement Header -->
        <div class="flex items-start gap-6 mb-6">
          <div class="flex-1 w-full">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1" style="margin-bottom: 10px !important;">
                  <i class="pi pi-trophy text-2xl text-yellow-500"></i>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-2" style="margin-right: 10px !important;">
                    Achievement
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievement Description -->
        <div class="mb-4" style="margin-top: 10px !important;">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">
            Description
          </h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ achievement.description }}</p>
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
