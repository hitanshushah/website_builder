<template>
  <div class="space-y-4">
    <div v-if="!publications || publications.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">📚</span>
      <p>No publications data available</p>
    </div>

    <UCard 
      v-for="publication in publications" 
      :key="publication.id"
      class="bg-white dark:bg-gray-800"
    >
      <div class="p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-3 flex-1">
            <div class="bg-red-100 dark:bg-red-900 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ publication.paper_name }}</h4>
              <p v-if="publication.conference_name" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {{ publication.conference_name }}
                <span v-if="publication.published_date" class="ml-2">
                  • {{ formatDate(publication.published_date) }}
                </span>
              </p>
              <p v-if="publication.description" class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {{ publication.description }}
              </p>
              <div class="flex space-x-2">
                <UButton 
                  v-if="publication.paper_link"
                  size="xs" 
                  variant="soft" 
                  color="red"
                  @click="openLink(publication.paper_link)"
                >
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3 mr-1" />
                  View Paper
                </UButton>
                <UButton 
                  v-if="publication.paper_pdf"
                  size="xs" 
                  variant="soft" 
                  color="gray"
                  @click="downloadPaper(publication.paper_pdf, publication.paper_name)"
                >
                  <UIcon name="i-heroicons-document-arrow-down" class="w-3 h-3 mr-1" />
                  Download PDF
                </UButton>
              </div>
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
import type { Publication } from '@/types'

const props = defineProps<{
  publications: Publication[]
}>()

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  })
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const downloadPaper = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
