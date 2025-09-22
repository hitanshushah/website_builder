<template>
  <div class="space-y-4">
    <div v-if="!projects || projects.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🚀</span>
      <p>No projects data available</p>
    </div>

    <UCard 
      v-for="project in projects" 
      :key="project.id"
      class="bg-white dark:bg-gray-800"
    >
      <div class="p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ project.name }}</h4>
            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span v-if="project.category" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {{ project.category }}
              </span>
              <span v-if="project.status" class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs">
                {{ project.status }}
              </span>
              <span v-if="project.start_date" class="text-gray-500">
                {{ formatDateRange(project.start_date, project.end_date) }}
              </span>
            </div>
            <p v-if="project.description" class="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {{ project.description }}
            </p>
            
            <!-- Project Images Carousel -->
            <div v-if="project.assets && project.assets.length" class="mb-4">
              <UCarousel
                v-slot="{ item }"
                loop
                arrows
                dots
                :items="getProjectImages(project.assets)"
                :ui="{ item: 'basis-1/3' }"
                class="mx-auto max-w-2xl"
              >
                <img 
                  :src="item.url" 
                  :alt="item.display_name" 
                  width="234" 
                  height="234" 
                  class="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  @click="openImageModal(item)"
                >
              </UCarousel>
            </div>
            
            <div v-if="project.technologies && project.technologies.length" class="flex flex-wrap gap-2 mb-3">
              <span 
                v-for="tech in project.technologies" 
                :key="tech"
                class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full"
              >
                {{ tech }}
              </span>
            </div>
            <div v-if="project.links && project.links.length" class="flex flex-wrap gap-2">
              <UButton
                v-for="link in project.links"
                :key="link.url"
                :label="link.title"
                size="sm"
                variant="outline"
                @click="openLink(link.url)"
                class="text-xs"
              />
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <UButton size="sm" variant="ghost" color="gray">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
            </UButton>
            <UButton size="sm" variant="ghost" color="red">
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

const props = defineProps<{
  projects: Project[]
}>()

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate) return ''
  
  const start = new Date(startDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
  
  if (!endDate) {
    return `${start} - Present`
  }
  
  const end = new Date(endDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
  
  return `${start} - ${end}`
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const getProjectImages = (assets: any[]) => {
  return assets.filter(asset => 
    asset.asset_type?.key === 'images' || 
    asset.type === 'images' ||
    asset.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  ).map(asset => ({
    url: asset.url || asset.filename,
    display_name: asset.display_name || 'Project Image'
  }))
}

const openImageModal = (image: { url: string; display_name: string }) => {
  // Create a modal to display the enlarged image
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
  modal.innerHTML = `
    <div class="relative max-w-4xl max-h-[90vh] p-4">
      <button 
        class="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded-full p-2 shadow-lg"
        onclick="this.closest('.fixed').remove()"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <img 
        src="${image.url}" 
        alt="${image.display_name}"
        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onclick="event.stopPropagation()"
      />
      <div class="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
        <p class="text-sm font-medium">${image.display_name}</p>
      </div>
    </div>
  `
  
  // Close modal when clicking outside the image
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
  
  // Close modal with Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.remove()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  document.body.appendChild(modal)
}
</script>
