<template>
  <div class="w-full">
    <div v-if="projects.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-folder-open text-4xl mb-4"></i>
      <p>No projects available</p>
    </div>
    <div v-else class="space-y-6">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
        style="padding: 24px;"
      >
        <!-- Project Header -->
        <div class="flex items-start gap-6 mb-6">
          
          <div class="flex-1 w-full">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1" style="margin-bottom: 10px !important;">
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-2" style="margin-right: 10px !important;">
                    {{ project.name }}
                  </h3>
                  <Tag v-if="project.category" :value="project.category" severity="secondary" />
                </div>
                <div class="flex items-center gap-2 mb-2 ml-2">
                  <Tag v-if="project.status" :value="project.status" :severity="getStatusSeverity(project.status)" />
                </div>
                <div v-if="project.start_date || project.end_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div v-if="project.start_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(project.start_date) }}</span>
                  </div>
                  <div v-if="project.end_date" class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>{{ formatDate(project.end_date) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Links on the right -->
              <div v-if="project.links && project.links.length > 0" class="flex flex-wrap gap-2 ml-4 h-fit flex-row" style="height: fit-content;">
                <Button 
                  v-for="link in project.links" 
                  :key="link.url"
                  :label="link.title"
                  outlined
                  size="small"
                  @click="openLink(link.url)"
                  class="whitespace-nowrap"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Project Description -->
        <div v-if="project.description" class="mb-4" style="margin-top: 10px !important;">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">
            Description
          </h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ project.description }}</p>
        </div>

        <!-- Technologies -->
        <div v-if="project.technologies && project.technologies.length > 0" class="mb-4">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2" style="margin-bottom: 10px !important;">
            Technologies
          </h4>
          <div class="flex flex-wrap gap-2">
            <Tag 
              v-for="tech in project.technologies" 
              :key="tech"
              :value="tech"
              severity="info"
              class="text-xs"
            />
          </div>
        </div>

        <!-- Project Images Carousel -->
        <div v-if="getProjectImages(project.assets).length > 0" class="mb-4">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 !mb-3 flex items-center gap-2" style="margin-bottom: 10px !important;">
            Images
          </h4>
          <Carousel 
            :value="getProjectImages(project.assets)" 
            :numVisible="3" 
            :numScroll="1" 
            :responsiveOptions="carouselResponsiveOptions"
            class="custom-carousel"
          >
            <template #item="slotProps">
              <div class="border-1 surface-border border-round m-2 text-center py-5">
                <div class="mb-3">
                  <img 
                    :src="slotProps.data.url" 
                    :alt="slotProps.data.display_name"
                    class="w-full h-48 object-cover rounded-lg shadow-md"
                    @error="handleImageError"
                  />
                </div>
                <div>
                  <h4 class="mb-1 text-sm font-semibold">{{ slotProps.data.display_name }}</h4>
                </div>
              </div>
            </template>
          </Carousel>
        </div>

        <!-- Documents -->
        <div v-if="getProjectDocuments(project.assets).length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2" style="margin-bottom: 10px !important;">
            Documents
          </h4>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-4">
              <div 
                v-for="doc in getProjectDocuments(project.assets)" 
                :key="doc.id"
                class="flex items-center justify-between !p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                style="padding: 10px !important; width: 300px;"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <i class="pi pi-file-pdf text-red-600 dark:text-red-400 text-lg"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ doc.display_name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">PDF Document</p>
                  </div>
                </div>
                <Button
                  icon="pi pi-download"
                  label="Download"
                  size="small"
                  severity="success"
                  outlined
                  @click="downloadDocument(doc.url, doc.display_name)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project, ProjectAsset } from '../types'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Carousel from 'primevue/carousel'

interface Props {
  projects: Project[]
}

defineProps<Props>()

const carouselResponsiveOptions = [
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1
  }
]

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

const getProjectImages = (assets: ProjectAsset[]) => {
  return assets.filter(asset => 
    asset.type && (
      asset.type.startsWith('image/') || 
      asset.asset_type?.key === 'image' ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(asset.filename)
    )
  )
}

const getProjectDocuments = (assets: ProjectAsset[]) => {
  return assets.filter(asset => 
    asset.type && (
      asset.type === 'application/pdf' || 
      asset.asset_type?.key === 'document' ||
      /\.(pdf|doc|docx)$/i.test(asset.filename)
    )
  )
}

const downloadDocument = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
}
</script>
