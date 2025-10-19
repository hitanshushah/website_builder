<script setup lang="ts">
import { useUserStore } from '../../stores/user'

const subdomainData = useState('subdomainAccess', () => {
  if (process.server) {
    const event = useRequestEvent()
    return event?.context?.subdomainAccess || null
  }
  return null
})

const isSubdomainAccess = computed(() => subdomainData.value?.isSubdomainAccess === true)

definePageMeta({
  layout: false
})

useHead(() => {
  if (!isSubdomainAccess.value) {
    return {
      title: 'Dashboard - Website Builder',
      meta: [
        { name: 'description', content: 'Manage your website and content with our professional dashboard.' }
      ]
    }
  }
  return {}
})

const userStore = useUserStore()

onMounted(async () => {
  if (!isSubdomainAccess.value) {
    await userStore.fetchUser()
  }
})
</script>

<template>
  <SubdomainTemplate v-if="isSubdomainAccess" />

  <UApp v-else>
    <Navbar />
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UContainer class="m-0 max-w-full py-8">
        <div class="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
          <YourWebsite class="h-fit" />
          
          <YourContent />
        </div>
      </UContainer>
    </div>
    <Footer />
  </UApp>
</template>