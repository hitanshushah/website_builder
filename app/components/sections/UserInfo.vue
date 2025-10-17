<template>
  <div class="w-full">
    <div v-if="!userProfile" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">⚠️</span>
      <p>No profile data available</p>
    </div>

    <UCard
      v-else
      class=" bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-start justify-between flex-col md:flex-row gap-4">
        <!-- Left: Avatar + Info -->
      <div class="flex items-start gap-6 flex-col md:flex-row">
        <!-- Avatar -->
         <div class="mt-1">
          <UAvatar
            v-if="userProfile.profile_photo_url"
            :src="userProfile.profile_photo_url"
            size="3xl"
            rounded
          />
          <UAvatar
            v-else
            :label="initials"
            size="3xl"
            rounded
            class="bg-primary text-white font-semibold"
          />
        </div>

        <!-- Info -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
            {{ userProfile.name || userProfile.username }}
          </h3>

          <p v-if="userProfile.designation" class="text-lg text-primary font-medium mb-2">
            {{ userProfile.designation }}
          </p>

          <p v-if="userProfile.bio" class="text-gray-700 dark:text-gray-300 leading-relaxed mb-2 whitespace-pre-line">
            {{ userProfile.bio }}
          </p>

          <!-- Location + Email -->
          <div class="flex flex-wrap gap-2 md:gap-6 text-gray-600 dark:text-gray-400 text-sm mb-3">
            <div v-if="userProfile.city || userProfile.province || userProfile.country" class="flex items-center gap-2">
              <UIcon name="i-heroicons-map-pin" />
              <span>{{ [userProfile.city, userProfile.province, userProfile.country].filter(Boolean).join(', ') }}</span>
            </div>
            <div v-if="userProfile.email" class="flex items-center gap-2">
              <UIcon name="i-heroicons-envelope" />
              <span>{{ userProfile.email }}</span>
            </div>
          </div>

          <!-- Buttons below Location + Email -->
          <div v-if="userProfile.links?.length" class="flex flex-wrap gap-3 mt-2">
            <UButton
              v-for="link in userProfile.links"
              :key="link.url"
              variant="subtle"
              size="sm"
              :label="link.title"
              @click="openLink(link.url)"
              color="neutral"
              icon="i-heroicons-arrow-top-right-on-square-16-solid"
              class="flex items-center gap-2 cursor-pointer"
            />
          </div>
        </div>
      </div>


        <!-- Right: Multiple Document Buttons -->
        <div v-if="userProfile.documents?.length" class="flex flex-wrap gap-2">
          <UButton
            v-for="doc in userProfile.documents"
            :key="doc.id"
            size="sm"
            variant="subtle"
            color="neutral"
            icon="i-heroicons-document-text"
            @click="downloadDocument(doc.url, doc.display_name)"
            class="cursor-pointer"
          >
            {{ doc.display_name }}
          </UButton>
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
