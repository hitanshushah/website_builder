<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useFetchTemplateData } from '~/composables/useTemplateData'
import { useUserStore } from '../../../stores/user'
import { useColorsStore } from '../../../stores/colors'
import { useTemplatesStore } from '../../../stores/templates'

definePageMeta({
  layout: false
})

const route = useRoute()
const userStore = useUserStore()
const colorsStore = useColorsStore()
const templatesStore = useTemplatesStore()

const { data: templateData, loading } = useFetchTemplateData(userStore.user?.id)

const { data: colorsResponse } = await useFetch('/api/colors', {
  query: {
    userId: userStore.user?.id || null
  }
})

if (colorsResponse.value) {
  const colors = (colorsResponse.value as any)?.data || []
  colorsStore.setAvailableColors(colors)
}

const { data: templatesResponse } = await useFetch('/api/templates')

if (templatesResponse.value) {
  const templates = (templatesResponse.value as any) || []
  templatesStore.setAvailableTemplates(templates)
}

const { data: userPreferencesResponse } = await useFetch('/api/user-preferences', {
  query: {
    userId: userStore.user?.id || null
  }
})

const selectedColorSchemeId = route.query.colorSchemeId
if (selectedColorSchemeId) {
  const selectedColor = colorsStore.availableColors.find((color: { id: number }) => color.id === parseInt(selectedColorSchemeId as string))
  if (selectedColor) {
    colorsStore.setSelectedColorScheme(selectedColor)
  }
} else if (userPreferencesResponse.value && (userPreferencesResponse.value as any)?.success && (userPreferencesResponse.value as any)?.data) {
  const preferences = (userPreferencesResponse.value as any).data
  
  const selectedTemplate = templatesStore.availableTemplates.find(t => t.id === preferences.template_id)
  if (selectedTemplate) {
    templatesStore.setSelectedTemplate(selectedTemplate)
  }
  
  const selectedColor = colorsStore.availableColors.find(c => c.id === preferences.color_id)
  if (selectedColor) {
    colorsStore.setSelectedColorScheme(selectedColor)
  }
}

const templateComponent = computed(() => {
  const identifier = route.params.template as string
  if (!identifier) return null
  const name = identifier.charAt(0).toUpperCase() + identifier.slice(1)
  return defineAsyncComponent(() => import(`../../components/templates/${name}.vue`))
})

const isPremiumUser = computed(() => {
  const plan_id = userStore.user?.premium_plan_id
  if (plan_id > 2) {
    return true
  }
  return false
})

const config = useRuntimeConfig()
const brandName = config.public.brandName
const brandUrl = config.public.brandUrl
const templateProps = computed(() => ({
  data: templateData.value,
  primary: colorsStore.selectedColors.primary,
  secondary: colorsStore.selectedColors.secondary,
  background: colorsStore.selectedColors.background,
  fourth: colorsStore.selectedColors.fourth,
  isPremiumUser: isPremiumUser.value,
  brandName: brandName,
  brandUrl: brandUrl
}))
</script>

<template>
  <Head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  </Head>

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
      <UButton to="/settings" color="primary" size="lg">
        Back to Settings
      </UButton>
    </div>
  </div>
</template>
