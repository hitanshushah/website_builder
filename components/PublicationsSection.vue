<template>
  <div class="w-full">
    <div v-if="publications.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-book text-4xl mb-4"></i>
      <p>No publications available</p>
    </div>
    <div v-else class="space-y-6">
      <div 
        v-for="publication in publications" 
        :key="publication.id"
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
        style="padding: 24px;"
      >
        <!-- Publication Header -->
        <div class="flex items-start gap-6 mb-6">
          <div class="flex-1 w-full">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {{ publication.paper_name }}
                </h3>
                <p v-if="publication.conference_name" class="text-lg text-primary font-medium mb-2">
                  {{ publication.conference_name }}
                </p>
                <div v-if="publication.published_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-1">
                    <i class="pi pi-calendar text-sm"></i>
                    <span>Published: {{ formatDate(publication.published_date) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Action buttons on the right -->
              <div v-if="publication.paper_pdf || publication.paper_link" class="flex flex-wrap gap-2 ml-4 h-fit flex-row" style="height: fit-content;">
                <div v-if="publication.paper_pdf" class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <i :class="getFileIcon(publication.paper_pdf)" style="color: green"></i>
                  <span class="text-sm text-black" style="color: black">Paper Available</span>
                </div>
                <Button 
                  v-if="publication.paper_pdf"
                  icon="pi pi-download"
                  label="Download"
                  outlined
                  size="small"
                  @click="openLink(publication.paper_pdf)"
                  class="whitespace-nowrap"
                />
                <Button 
                  v-if="publication.paper_link"
                  icon="pi pi-external-link"
                  label="View Paper"
                  outlined
                  size="small"
                  @click="openLink(publication.paper_link)"
                  class="whitespace-nowrap"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="publication.description" class="mb-4" style="margin-top: 10px !important;">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">
            Description
          </h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ publication.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Publication } from '../types'
import Button from 'primevue/button'

interface Props {
  publications: Publication[]
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const getFileIcon = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'pi pi-file-pdf'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'pi pi-image'
    default:
      return 'pi pi-file'
  }
}
</script>
