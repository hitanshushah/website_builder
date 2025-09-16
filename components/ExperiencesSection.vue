<template>
  <div class="w-full">
    <div v-if="experiences.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-building text-4xl mb-4"></i>
      <p>No experience available</p>
    </div>
    <div v-else class="space-y-4">
        <div 
          v-for="experience in experiences" 
          :key="experience.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Experience Header -->
          <div class="flex items-start gap-4 mb-3">
            <Avatar 
              v-if="experience.company_logo" 
              :image="experience.company_logo" 
              size="large" 
              shape="circle"
              class="flex-shrink-0"
            />
            <Avatar 
              v-else 
              :label="experience.company_name.charAt(0)" 
              size="large" 
              shape="circle"
              class="flex-shrink-0"
            />
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ experience.role }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 font-medium">
                {{ experience.company_name }}
              </p>
              <p v-if="experience.location" class="text-sm text-gray-500 dark:text-gray-500">
                <i class="pi pi-map-marker mr-1"></i>
                {{ experience.location }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <p v-if="experience.description" class="text-gray-700 dark:text-gray-300 mb-3">
            {{ experience.description }}
          </p>

          <!-- Skills -->
          <div v-if="experience.skills && experience.skills.length > 0" class="mb-3">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Skills</h4>
            <div class="flex flex-wrap gap-1">
              <Tag 
                v-for="skill in experience.skills" 
                :key="skill"
                :value="skill"
                severity="secondary"
                class="text-xs"
              />
            </div>
          </div>

          <!-- Dates -->
          <div v-if="experience.start_date || experience.end_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div v-if="experience.start_date" class="flex items-center gap-1">
              <i class="pi pi-calendar"></i>
              <span>Start: {{ formatDate(experience.start_date) }}</span>
            </div>
            <div v-if="experience.end_date" class="flex items-center gap-1">
              <i class="pi pi-calendar"></i>
              <span>End: {{ formatDate(experience.end_date) }}</span>
            </div>
            <div v-else class="flex items-center gap-1">
              <Tag value="Current" severity="success" class="text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Experience } from '../types'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'

interface Props {
  experiences: Experience[]
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>
