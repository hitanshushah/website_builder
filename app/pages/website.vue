<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <UContainer class="max-w-7xl">
      <!-- Website URL Section -->
      <WebsiteUrlSection
        v-if="userStore.user?.id"
        ref="websiteUrlSectionRef"
        :userId="userStore.user.id"
        :domainUrl="domainUrl"
        @refresh="refreshPersonalSection"
      />

      <!-- Personal Website URL Section (Pro only) -->
      <PersonalWebsiteUrlSection
        v-if="userStore.user?.id"
        ref="personalWebsiteUrlSectionRef"
        :userId="userStore.user.id"
        :isPro="userStore.isPro"
        @refresh="refreshWebsiteSection"
      />

      <!-- Personal Website Connection Section (Pro only) -->
      <PersonalWebsiteConnectionSection
        v-if="userStore.user?.id"
        :userId="userStore.user.id"
        :isPro="userStore.isPro"
        :personalWebsiteUrl="personalWebsiteUrl"
      />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../stores/user'
const config = useRuntimeConfig()
const brandName = config.public.brandName || 'Website Builder'
useHead({
  title: `${brandName} - Live Website`,
  meta: [
    { name: 'description', content: 'Your live website preview.' }
  ]
})

const userStore = useUserStore()

const websiteUrlSectionRef = ref<any>(null)
const personalWebsiteUrlSectionRef = ref<any>(null)

const domainUrl = computed(() => config.public.domainUrl)

// Personal website URL data
const personalWebsiteUrlData = ref<{
  personal_website_url: string | null
  share_personal_website: boolean
} | null>(null)

const personalWebsiteUrl = computed(() => {
  if (!personalWebsiteUrlData.value?.personal_website_url) return undefined
  const url = personalWebsiteUrlData.value.personal_website_url
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
})

const fetchUserData = async () => {
  await userStore.fetchUser()
}

const fetchPersonalWebsiteUrl = async () => {
  try {
    const data = await $fetch('/api/website-url', {
      query: { userId: userStore.user?.id }
    })
    personalWebsiteUrlData.value = data as any
  } catch (error) {
    console.error('Error fetching personal website URL:', error)
  }
}

const refreshWebsiteSection = () => {
  if (websiteUrlSectionRef.value) {
    websiteUrlSectionRef.value.fetchWebsiteUrl()
  }
}

const refreshPersonalSection = () => {
  if (personalWebsiteUrlSectionRef.value) {
    personalWebsiteUrlSectionRef.value.fetchWebsiteUrl()
  }
}

onMounted(async () => {
  await fetchUserData()
  await fetchPersonalWebsiteUrl()
})
</script>

