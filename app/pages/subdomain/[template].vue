<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

definePageMeta({
  layout: false
})

const route = useRoute()

const subdomainData = useState('subdomainAccess', () => {
  if (process.server) {
    const event = useRequestEvent()
    const subdomainAccess = event?.context?.subdomainAccess
    
    if (!subdomainAccess?.isSubdomainAccess) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page not found'
      })
    }
    
    return subdomainAccess
  }
  return null
})

if (!subdomainData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found'
  })
}

const templateData = ref(subdomainData.value.websiteData)
const loading = ref(false)

const selectedColors = ref(subdomainData.value.colors)

const templateComponent = computed(() => {
  const identifier = route.params.template as string
  if (!identifier) return null
  const name = identifier.charAt(0).toUpperCase() + identifier.slice(1)
  return defineAsyncComponent(() => import(`../../components/templates/${name}.vue`))
})

const templateProps = computed(() => ({
  data: templateData.value,
  primary: selectedColors.value.primary,
  secondary: selectedColors.value.secondary,
  background: selectedColors.value.background,
  fourth: selectedColors.value.fourth
}))
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400 text-lg">Loading your website...</p>
    </div>
  </div>

  <component v-else-if="templateData && templateComponent" :is="templateComponent" v-bind="templateProps" />
  
  <div v-else class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center max-w-md mx-auto px-6">
      <div class="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Template Not Found</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">The requested template could not be loaded.</p>
    </div>
  </div>
</template>

