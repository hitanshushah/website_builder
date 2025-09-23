<template>
  <div class="space-y-4">
    <div v-if="!technologies || technologies.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">💻</span>
      <p>No technologies data available</p>
    </div>

    <UCard v-else class="bg-white dark:bg-gray-800">
      <div class="p-4">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Technologies Used</h4>
        <div class="flex flex-wrap gap-2">
          <UBadge 
            v-for="tech in technologies" 
            :key="tech"
            :color="getTechColor(tech)" 
            variant="soft"
            class="text-sm"
          >
            {{ tech }}
          </UBadge>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  technologies: string[]
}>()

const getTechColor = (tech: string) => {
  const techLower = tech.toLowerCase()
  
  // Programming Languages
  if (['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'].some(lang => techLower.includes(lang))) {
    return 'info'
  }
  
  // Frontend Frameworks
  if (['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'sveltekit'].some(fw => techLower.includes(fw))) {
    return 'primary'
  }
  
  // Backend Frameworks
  if (['node', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails'].some(fw => techLower.includes(fw))) {
    return 'warning'
  }
  
  // Databases
  if (['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server'].some(db => techLower.includes(db))) {
    return 'secondary'
  }
  
  // Cloud & DevOps
  if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 'github'].some(cloud => techLower.includes(cloud))) {
    return 'error'
  }
  
  // Tools
  if (['git', 'npm', 'yarn', 'webpack', 'vite', 'babel', 'eslint', 'prettier'].some(tool => techLower.includes(tool))) {
    return 'neutral'
  }
  
  return 'info'
}
</script>
