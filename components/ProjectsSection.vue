<template>
  <div class="w-full">
    <div v-if="projects.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-folder-open text-4xl mb-4"></i>
      <p>No projects available</p>
    </div>
    <div v-else class="space-y-4">
        <div 
          v-for="project in projects" 
          :key="project.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Project Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ project.name }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <Tag v-if="project.category" :value="project.category" severity="secondary" />
                <Tag v-if="project.status" :value="project.status" :severity="getStatusSeverity(project.status)" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 dark:text-gray-500">
                {{ formatDate(project.created_at) }}
              </span>
            </div>
          </div>

          <!-- Project Description -->
          <p v-if="project.description" class="text-gray-700 dark:text-gray-300 mb-3">
            {{ project.description }}
          </p>

          <!-- Project Dates -->
          <div v-if="project.start_date || project.end_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div v-if="project.start_date" class="flex items-center gap-1">
              <i class="pi pi-calendar"></i>
              <span>Start: {{ formatDate(project.start_date) }}</span>
            </div>
            <div v-if="project.end_date" class="flex items-center gap-1">
              <i class="pi pi-calendar"></i>
              <span>End: {{ formatDate(project.end_date) }}</span>
            </div>
          </div>

          <!-- Technologies -->
          <div v-if="project.technologies && project.technologies.length > 0" class="mb-3">
            <div class="flex flex-wrap gap-1">
              <Tag 
                v-for="tech in project.technologies" 
                :key="tech"
                :value="tech"
                severity="info"
                class="text-xs"
              />
            </div>
          </div>

          <!-- Links -->
          <div v-if="project.links && project.links.length > 0" class="mb-3">
            <div class="flex flex-wrap gap-2">
              <Button 
                v-for="link in project.links" 
                :key="link.url"
                :label="link.title"
                :icon="getLinkIcon(link.type)"
                size="small"
                text
                @click="openLink(link.url)"
              />
            </div>
          </div>

          <!-- Assets -->
          <div v-if="project.assets && project.assets.length > 0" class="mb-3">
            <div class="flex flex-wrap gap-2">
              <Button 
                v-for="asset in project.assets" 
                :key="asset.id"
                :label="asset.display_name"
                icon="pi pi-download"
                size="small"
                text
                @click="openLink(asset.url)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Project } from '../types'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

interface Props {
  projects: Project[]
}

defineProps<Props>()

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    'completed': 'success',
    'in-progress': 'warning',
    'planned': 'info',
    'on-hold': 'danger'
  }
  return severityMap[status] || 'secondary'
}

const getLinkIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'github': 'pi-github',
    'demo': 'pi-external-link',
    'documentation': 'pi-book',
    'website': 'pi-globe'
  }
  return iconMap[type] || 'pi-external-link'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}
</script>
