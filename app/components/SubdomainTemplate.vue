<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { processTemplateData } from '../composables/useTemplateData'

const subdomainData = useState('subdomainAccess', () => {
  if (process.server) {
    const event = useRequestEvent()
    return event?.context?.subdomainAccess || null
  }
  return null
})

const templateData = computed(() => {
  const rawData = subdomainData.value?.websiteData
  return rawData ? processTemplateData(rawData) : null
})
const selectedColors = computed(() => subdomainData.value?.colors)
const isPremiumUser = computed(() => subdomainData.value?.isPremiumUser || false)
const config = useRuntimeConfig()
const brandName = config.public.brandName
const brandUrl = config.public.brandUrl

const templateComponent = computed(() => {
  if (!subdomainData.value?.templateIdentifier) return null
  const identifier = subdomainData.value.templateIdentifier
  const name = identifier.charAt(0).toUpperCase() + identifier.slice(1)
  return defineAsyncComponent(() => import(`./templates/${name}.vue`))
})

const templateProps = computed(() => ({
  data: templateData.value,
  primary: selectedColors.value?.primary,
  secondary: selectedColors.value?.secondary,
  background: selectedColors.value?.background,
  fourth: selectedColors.value?.fourth,
  isPremiumUser: isPremiumUser.value,
  brandName: brandName,
  brandUrl: brandUrl
}))

useHead(() => ({
  title: subdomainData.value?.websiteData?.userProfile?.name || 'Portfolio',
  meta: [
    { name: 'description', content: 'Personal portfolio website' }
  ]
}))
</script>

<template>
  <div>
    <component 
      v-if="templateData && templateComponent" 
      :is="templateComponent" 
      v-bind="templateProps" 
    />
    
    <div v-else class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div class="text-center max-w-md mx-auto px-6">
        <div class="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Template Not Found</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">The requested template could not be loaded.</p>
      </div>
    </div>
  </div>
</template>

