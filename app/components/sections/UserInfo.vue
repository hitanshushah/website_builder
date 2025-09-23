<template>
  <div class="w-full">
    <div v-if="!userProfile" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">⚠️</span>
      <p>No profile data available</p>
    </div>

    <UCard
      v-else
      class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <!-- Profile Header -->
      <div class="flex items-start gap-6 mb-6">
        <!-- Avatar -->
        <UAvatar
          v-if="userProfile.profile_photo_url"
          :src="userProfile.profile_photo_url"
          size="xl"
          rounded
          class="flex-shrink-0"
        />
        <UAvatar
          v-else
          :label="initials"
          size="xl"
          rounded
          class="flex-shrink-0 bg-primary text-white font-semibold"
        />

        <div class="flex-1 w-full ml-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Name -->
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {{ userProfile.name || userProfile.username }}
              </h3>

              <!-- Designation -->
              <p v-if="userProfile.designation" class="text-lg text-primary font-medium mb-2">
                {{ userProfile.designation }}
              </p>

              <!-- Email -->
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1" v-if="userProfile.email">
                <span class="text-sm">📧</span>
                <span class="text-sm">{{ userProfile.email }}</span>
              </div>

              <!-- Location -->
              <div
                v-if="userProfile.city || userProfile.province || userProfile.country"
                class="flex items-center gap-2 text-gray-600 dark:text-gray-400"
              >
                <span class="text-sm">📍</span>
                <span class="text-sm">{{ [userProfile.city, userProfile.province, userProfile.country].filter(Boolean).join(', ') }}</span>
              </div>
            </div>

            <!-- Links -->
            <div v-if="userProfile.links?.length" class="flex flex-wrap gap-2 ml-4 !h-fit flex-row">
              <UButton
                v-for="link in userProfile.links"
                :key="link.url"
                :label="link.title"
                outlined
                size="sm"
                @click="openLink(link.url)"
                class="whitespace-nowrap"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div v-if="userProfile.bio" class="mb-4">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">About</h4>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ userProfile.bio }}</p>
      </div>

      <!-- Documents -->
      <div v-if="userProfile.documents?.length">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">Documents</h4>
        <div class="space-y-2">
          <div class="flex flex-wrap gap-4">
            <div
              v-for="doc in userProfile.documents"
              :key="doc.id"
              class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              style="width: 300px;"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  📄
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ doc.display_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">PDF Document</p>
                </div>
              </div>
              <UButton
                size="sm"
                outlined
                @click="downloadDocument(doc.url, doc.display_name)"
              >
                Download
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '@/types'

const props = defineProps<{
  userProfile: UserProfile | null
}>()

const userProfile = props.userProfile

// Compute initials if no photo
const initials = userProfile?.name
  ? userProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
  : userProfile?.username?.charAt(0).toUpperCase() || 'U'

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
