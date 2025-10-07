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

      <!-- Personal Access Token Section (Pro only) -->
      <PersonalAccessTokenSection
        v-if="userStore.user?.id"
        :userId="userStore.user.id"
        :isPro="userStore.isPro"
      />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../stores/user'

useHead({
  title: 'Live Website - Website Builder',
  meta: [
    { name: 'description', content: 'Your live website preview.' }
  ]
})

const userStore = useUserStore()
const config = useRuntimeConfig()

const websiteUrlSectionRef = ref<any>(null)
const personalWebsiteUrlSectionRef = ref<any>(null)

const domainUrl = computed(() => config.public.domainUrl)

const fetchUserData = async () => {
  await userStore.fetchUser()
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
})
</script>

