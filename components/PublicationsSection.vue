<template>
  <div class="w-full">
    <div v-if="publications.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-book text-4xl mb-4"></i>
      <p>No publications available</p>
    </div>
    <div v-else class="space-y-4">
        <div 
          v-for="publication in publications" 
          :key="publication.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Publication Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ publication.paper_name }}
              </h3>
              <p v-if="publication.conference_name" class="text-gray-600 dark:text-gray-400">
                {{ publication.conference_name }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button 
                v-if="publication.paper_pdf"
                icon="pi pi-download"
                size="small"
                text
                @click="openLink(publication.paper_pdf)"
              />
              <Button 
                v-if="publication.paper_link"
                icon="pi pi-external-link"
                size="small"
                text
                @click="openLink(publication.paper_link)"
              />
            </div>
          </div>

          <!-- Description -->
          <p v-if="publication.description" class="text-gray-700 dark:text-gray-300 mb-3">
            {{ publication.description }}
          </p>

          <!-- Published Date -->
          <div v-if="publication.published_date" class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <i class="pi pi-calendar"></i>
            <span>Published: {{ formatDate(publication.published_date) }}</span>
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
</script>
