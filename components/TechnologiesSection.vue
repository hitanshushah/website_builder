<template>
  <div class="w-full">
    <div v-if="technologies.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-cog text-4xl mb-4"></i>
      <p>No technologies available</p>
    </div>
    <div v-else class="flex flex-wrap gap-2">
      <Tag 
        v-for="tech in technologies" 
        :key="tech"
        :value="tech"
        :severity="getTechSeverity(tech)"
        class="text-sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'

interface Props {
  technologies: string[]
}

defineProps<Props>()

const getTechSeverity = (tech: string) => {
  const techCategories: Record<string, string> = {
    // Frontend
    'react': 'info',
    'vue': 'info',
    'angular': 'info',
    'javascript': 'info',
    'typescript': 'info',
    'html': 'info',
    'css': 'info',
    'tailwind': 'info',
    'bootstrap': 'info',
    
    // Backend
    'nodejs': 'success',
    'python': 'success',
    'java': 'success',
    'php': 'success',
    'ruby': 'success',
    'go': 'success',
    'rust': 'success',
    
    // Database
    'postgresql': 'warning',
    'mysql': 'warning',
    'mongodb': 'warning',
    'redis': 'warning',
    'sqlite': 'warning',
    
    // Cloud/DevOps
    'aws': 'danger',
    'docker': 'danger',
    'kubernetes': 'danger',
    'azure': 'danger',
    'gcp': 'danger'
  }
  
  return techCategories[tech.toLowerCase()] || 'secondary'
}
</script>
