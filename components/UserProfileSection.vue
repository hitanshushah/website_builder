<template>
  <div class="w-full">
    <div v-if="!userProfile" class="text-center py-8 text-gray-500">
      <i class="pi pi-exclamation-triangle text-4xl mb-4"></i>
      <p>No profile data available</p>
    </div>
    <div v-else class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <!-- Profile Header -->
      <div class="flex items-start gap-6 mb-6">
        <Avatar 
          v-if="userProfile.profile_photo_url" 
          :image="userProfile.profile_photo_url" 
          size="large" 
          shape="circle"
          class="flex-shrink-0"
        />
        <Avatar 
          v-else 
          :label="userProfile.name?.charAt(0) || userProfile.username?.charAt(0) || 'U'" 
          size="large" 
          shape="circle"
          class="flex-shrink-0 bg-primary"
        />
        <div class="flex-1">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {{ userProfile.name || userProfile.username }}
          </h3>
          <p v-if="userProfile.designation" class="text-lg text-primary font-medium mb-2">
            {{ userProfile.designation }}
          </p>
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <i class="pi pi-envelope text-sm"></i>
            <span class="text-sm">{{ userProfile.email }}</span>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div v-if="userProfile.bio" class="mb-4">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <i class="pi pi-user text-primary"></i>
          About
        </h4>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ userProfile.bio }}</p>
      </div>

      <!-- Location -->
      <div v-if="userProfile.city || userProfile.province || userProfile.country" class="mb-4">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <i class="pi pi-map-marker text-primary"></i>
          Location
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ [userProfile.city, userProfile.province, userProfile.country].filter(Boolean).join(', ') }}
        </p>
      </div>

      <!-- Links -->
      <div v-if="userProfile.links && userProfile.links.length > 0" class="mb-4">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <i class="pi pi-link text-primary"></i>
          Links
        </h4>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="link in userProfile.links" 
            :key="link.url"
            :label="link.title"
            outlined
            size="small"
            @click="openLink(link.url)"
          />
        </div>
      </div>

      <!-- Documents -->
      <div v-if="userProfile.documents && userProfile.documents.length > 0">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <i class="pi pi-file-pdf text-primary"></i>
          Documents
        </h4>
        <div class="space-y-2">
          <div 
            v-for="doc in userProfile.documents" 
            :key="doc.id"
            class="flex items-center justify-between !p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
</template>

<script setup lang="ts">
import type { UserProfile } from '../types'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'

interface Props {
  userProfile: UserProfile | null
}

defineProps<Props>()

const getLinkIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'github': 'pi-github',
    'linkedin': 'pi-linkedin',
    'twitter': 'pi-twitter',
    'website': 'pi-globe',
    'email': 'pi-envelope',
    'phone': 'pi-phone'
  }
  return iconMap[type] || 'pi-external-link'
}

const openLink = (url: string) => {
  window.open(url, '_blank')
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
</script>
