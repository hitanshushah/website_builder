<template>
  <div class="w-full">
    <div v-if="certifications.length === 0" class="text-center py-8 text-gray-500">
      <i class="pi pi-certificate text-4xl mb-4"></i>
      <p>No certifications available</p>
    </div>
    <div v-else class="space-y-4">
        <div 
          v-for="cert in certifications" 
          :key="cert.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Certification Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ cert.name }}
              </h3>
              <p v-if="cert.institute_name" class="text-gray-600 dark:text-gray-400">
                {{ cert.institute_name }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button 
                v-if="cert.certificate_pdf"
                icon="pi pi-download"
                size="small"
                text
                @click="openLink(cert.certificate_pdf)"
              />
            </div>
          </div>

          <!-- Description -->
          <p v-if="cert.description" class="text-gray-700 dark:text-gray-300 mb-3">
            {{ cert.description }}
          </p>

          <!-- Dates -->
          <div v-if="cert.start_date || cert.end_date" class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div v-if="cert.start_date" class="flex items-center gap-1">
              <i class="pi pi-calendar"></i>
              <span>Start: {{ formatDate(cert.start_date) }}</span>
            </div>
            <div v-if="cert.end_date" class="flex items-center gap-1">
              <i class="pi pi-calendar"></i>
              <span>End: {{ formatDate(cert.end_date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Certification } from '../types'

interface Props {
  certifications: Certification[]
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}
</script>
