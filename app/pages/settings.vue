<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { useFetchTemplateData } from '../composables/useTemplateData'
import { useUserStore } from '../../stores/user'
import { useColorsStore } from '../../stores/colors'
import { useTemplatesStore } from '../../stores/templates'

const items = [
  {
    label: 'Templates',
    description: 'Change your password here. After saving, you\'ll be logged out.',
    icon: 'i-lucide-layout-template',
    slot: 'templates' as const
  },
  {
    label: 'Colors',
    description: 'Make changes to your account here. Click save when you\'re done.',
    icon: 'i-lucide-palette',
    slot: 'colors' as const
  }
] satisfies TabsItem[]

const userStore = useUserStore()
const colorsStore = useColorsStore()
const templatesStore = useTemplatesStore()

onMounted(async () => {
  await userStore.fetchUser()
})
const selectedTemplateIdentifier = computed({
  get: () => templatesStore.selectedTemplate?.identifier || null,
  set: (value: string | null) => {
    if (value) {
      const template = templatesStore.availableTemplates.find(t => t.identifier === value)
      if (template) {
        templatesStore.setSelectedTemplate(template)
      }
    }
  }
})
const { data: templateData } = useFetchTemplateData(userStore.user?.id)


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

if (userPreferencesResponse.value && (userPreferencesResponse.value as any)?.success && (userPreferencesResponse.value as any)?.data) {

  const preferences = (userPreferencesResponse.value as any).data
  
  const selectedTemplate = templatesStore.availableTemplates.find(t => t.id === preferences.template_id)
  if (selectedTemplate) {
    templatesStore.setSelectedTemplate(selectedTemplate)
  }
  
  const selectedColor = colorsStore.availableColors.find(c => c.id === preferences.color_id)
  if (selectedColor) {
    colorsStore.setSelectedColorScheme(selectedColor)
  }
} else {
  if (templatesStore.defaultTemplate) {
    templatesStore.setSelectedTemplate(templatesStore.defaultTemplate)
  }
}

const handleTemplateSelect = (identifier: string) => {
  selectedTemplateIdentifier.value = identifier
}

const selectedTemplateComponent = computed(() => {
  if (!selectedTemplateIdentifier.value) return null
  const name = selectedTemplateIdentifier.value.charAt(0).toUpperCase() + selectedTemplateIdentifier.value.slice(1)
  return defineAsyncComponent(() => import(`../components/templates/${name}.vue`))
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

// Computed props to pass to template preview
const templatePreviewProps = computed(() => ({
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <UTabs :items="items" color="neutral" variant="link" :ui="{ trigger: 'grow' }" class="gap-4 w-full md:py-8 md:px-16 p-2">
      <template #templates="{ item }">
        <settingsTemplates @select-template="handleTemplateSelect" />
      </template>

      <template #colors="{ item }">
        <settingsColors />
      </template>
    </UTabs>

    <div v-if="selectedTemplateIdentifier && templateData" class="w-full md:px-16 md:py-8 p-8">
      <div class="mb-6 flex items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Template Preview: {{ templatesStore.selectedTemplate?.name }}</h2>
        <div class="flex gap-3">
          <UButton 
            :to="`/preview/${selectedTemplateIdentifier}?colorSchemeId=${colorsStore.selectedColorScheme?.id || ''}`"
            target="_blank"
            color="primary" 
            variant="outline"
            icon="i-lucide-external-link"
          >
            Open in New Tab
          </UButton>
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-4 font-semibold">
        <span class="font-bold">Note:</span> This is just a preview! Some navigation links might not work yet. Click <span class="font-bold">“Open in New Tab”</span> to see your site in action.
      </p>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="flex justify-center sm:hidden">
          <div
            class="relative overflow-hidden border border-gray-300 dark:border-gray-700 rounded-3xl shadow-md"
            style="width: 375px; height: 750px;"
          >
            <div class="absolute top-0 left-0 right-0 h-6 bg-gray-900 rounded-t-3xl flex justify-center items-center">
              <div class="w-24 h-1 bg-gray-700 rounded-full"></div>
            </div>
            <div class="w-full h-full overflow-auto mt-6">
              <component :is="selectedTemplateComponent" v-bind="templatePreviewProps" />
            </div>
          </div>
        </div>

        <div class="hidden sm:block w-full overflow-auto">
          <component :is="selectedTemplateComponent" v-bind="templatePreviewProps" />
        </div>
      </div>

    </div>
  </div>
</template>

