<template>
  <div class="w-full">
    <div v-if="technologies.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-cog text-4xl mb-4"></i>
      <p>No technologies available</p>
    </div>
    <div v-else class="flex flex-wrap gap-2 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    style="padding: 24px;">
      <Tag 
        v-for="tech in technologies" 
        :key="tech"
        :value="tech"
        severity="green"
        class="text-sm"
        rounded
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

</script>
