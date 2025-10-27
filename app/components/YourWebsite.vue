<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 md:p-6 p-4">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <PlanBadge :plan-id="userStore.user?.premium_plan_id || 1" />
      </div>
      <UButton class="cursor-pointer" variant="subtle" color="neutral" @click="navigateTo('/settings')">
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
        Change Website
      </UButton>
    </div>

    <div class="md:mb-6 mb-2">
      <UCard class="overflow-hidden">
        <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300">{{selectedTemplate?.name || 'Template'}}</span>
        </div>
        
        <div class="bg-white dark:bg-gray-800" style="height: auto; min-height: 200px; overflow: hidden;">
          <div v-if="loading" class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-blue-600 mt-10 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Loading preview...</p>
            </div>
          </div>
          
          <div v-else-if="selectedTemplate" class="h-full flex items-center justify-center">
            <div class="relative w-full h-full">
              <img 
                v-if="selectedTemplate.thumbnail"
                :src="selectedTemplate.thumbnail" 
                :alt="selectedTemplate.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <div class="text-center">
                  <UIcon name="i-lucide-image" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p class="text-gray-500 dark:text-gray-400">{{ selectedTemplate.name }}</p>
                </div>
              </div>
              
              <div v-if="selectedTemplate.is_premium" class="absolute top-4 right-4">
                <span class="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                  Premium
                </span>
              </div>
            </div>
          </div>
          
          <div v-else class="p-8">
            <div class="text-center mb-8">
              <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4"></div>
              <div class="h-1 bg-black dark:bg-white mb-2"></div>
              <div class="h-0.5 bg-gray-400 dark:bg-gray-500 mb-6"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-100 dark:bg-gray-700 h-20 rounded"></div>
              <div class="bg-gray-100 dark:bg-gray-700 h-20 rounded"></div>
            </div>
            
            <div class="mt-4 space-y-2">
              <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div class="flex justify-start md:mb-6 mb-2">
      <div v-if="selectedColorScheme" class="rounded-lg md:p-4 p-2 flex items-center gap-4">
        <div class="flex gap-8">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedColorScheme.name }}</h3>
        </div>
        <div class="flex gap-2">
          <div 
            v-if="selectedColorScheme.primary_color"
            class="w-8 h-8 rounded-full border-2 border-gray-200"
            :style="{ backgroundColor: selectedColorScheme.primary_color }"
          />
          <div 
            v-if="selectedColorScheme.secondary_color"
            class="w-8 h-8 rounded-full border-2 border-gray-200"
            :style="{ backgroundColor: selectedColorScheme.secondary_color }"
          />
          <div 
            v-if="selectedColorScheme.background_color"
            class="w-8 h-8 rounded-full border-2 border-gray-200"
            :style="{ backgroundColor: selectedColorScheme.background_color }"
          />
          <div 
            v-if="selectedColorScheme.fourth_color"
            class="w-8 h-8 rounded-full border-2 border-gray-200"
            :style="{ backgroundColor: selectedColorScheme.fourth_color }"
          />
        </div>
        <div>
        <UButton class="cursor-pointer" variant="subtle" color="neutral" @click="navigateTo('/settings')">
        Change
      </UButton>
      </div>
        </div>
      </div>
      <div v-else class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-4">
        <div class="flex gap-2">
          <div class="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-300"></div>
          <div class="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-300"></div>
          <div class="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-300"></div>
          <div class="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-300"></div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">No Color Scheme</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Select a color scheme</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 text-sm">
      <div>
        <span class="text-gray-500 dark:text-gray-400">Template:</span>
        <p class="font-medium text-gray-900 dark:text-white">{{ selectedTemplate?.name || 'Not Selected' }}</p>
      </div>
      <div>
        <span class="text-gray-500 dark:text-gray-400">Status:</span>
        <p class="font-medium" :class="statusColor">{{ statusText }}</p>
      </div>
      <div>
        <UButton class="cursor-pointer" variant="subtle" color="neutral" @click="navigateTo('/website')">
        Change Domain
      </UButton>
      </div>
    </div>
    <div class="mt-4">
        <span class="text-gray-500 dark:text-gray-400">Link:</span>
        <p v-if="activeWebsiteUrl" class="font-medium text-blue-600 dark:text-blue-400">
          <a :href="activeWebsiteUrl" target="_blank" rel="noopener noreferrer" class="hover:underline">
            {{ activeWebsiteUrl }}
          </a>
        </p>
        <p v-else class="font-medium text-gray-500 dark:text-gray-400">Not shared</p>
      </div>
      <div v-if="activeWebsiteUrl" class="text-sm text-gray-500 dark:text-gray-400 mt-4">
        <p>
        Email setup is <span class="font-medium text-green-600 dark:text-green-400">Active</span>.  
      </p>
      <p>You’ll get an email when someone submits your contact form.</p>
      <p>
        Check your spam folder if it’s not in your inbox and mark it as “Not Spam.”  
      </p>
      <p>
        If you’ve added a secondary email, make sure to check both emails.  
      </p>
      </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useFetchTemplateData } from '../composables/useTemplateData'
import { useUserStore } from '../../stores/user'
import { useColorsStore } from '../../stores/colors'
import { useTemplatesStore } from '../../stores/templates'
import PlanBadge from './PlanBadge.vue'
//import websiteUrlDelete from '~~/server/api/website-url.delete'

const userStore = useUserStore()
const colorsStore = useColorsStore()
const templatesStore = useTemplatesStore()

const { data: templateData, refetch: refetchTemplateData } = useFetchTemplateData(userStore.user?.id)

const selectedTemplate = computed(() => templatesStore.selectedTemplate)
const loading = computed(() => !selectedTemplate.value && templatesStore.availableTemplates.length === 0)

const config = useRuntimeConfig()
const domainUrl = config.public.domainUrl

const userProfile = computed(() => templateData.value?.userProfile)

const selectedColorScheme = computed(() => colorsStore.selectedColorScheme)

const statusText = computed(() => {
  if (!userProfile.value) return 'Loading...'
  
  if (userProfile.value.share_website || userProfile.value.share_personal_website) {
    return 'Live'
  }
  return 'Not Shared'
})

const statusColor = computed(() => {
  if (!userProfile.value) return 'text-gray-500 dark:text-gray-400'
  
  const isWebsiteShared = userProfile.value.share_website === true
  const isPersonalWebsiteShared = userProfile.value.share_personal_website === true
  
  if (isWebsiteShared || isPersonalWebsiteShared) {
    return 'text-green-600 dark:text-green-400'
  }
  return 'text-gray-500 dark:text-gray-400'
})

const activeWebsiteUrl = computed(() => {
  if (!userProfile.value) return null
  
  let url = null
  
  if (userProfile.value.share_website === true && userProfile.value.website_url) {
    url = userProfile.value.website_url
  } else if (userProfile.value.share_personal_website === true && userProfile.value.personal_website_url) {
    url = userProfile.value.personal_website_url
  }
  
  if (!url) return null
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  
  return url
})

const goToWebsite = () => {
  if (selectedTemplate.value) {
    const url = `/preview/${selectedTemplate.value.identifier}`
    window.open(url, '_blank')
  }
}

onMounted(async () => {
  await loadUserPreferences()
})

const loadUserPreferences = async () => {
  if (userStore.user?.id) {
    try {
      const colorsResponse = await $fetch('/api/colors', {
        query: { userId: userStore.user.id }
      })
      if (colorsResponse) {
        const colors = (colorsResponse as any)?.data || []
        colorsStore.setAvailableColors(colors)
      }

      const templatesResponse = await $fetch('/api/templates')
      if (templatesResponse) {
        const templates = (templatesResponse as any) || []
        templatesStore.setAvailableTemplates(templates)
      }

      const userPreferencesResponse = await $fetch('/api/user-preferences', {
        query: { userId: userStore.user.id }
      })
      
      if (userPreferencesResponse && (userPreferencesResponse as any)?.success && (userPreferencesResponse as any)?.data) {
        const preferences = (userPreferencesResponse as any).data
        
        const selectedTemplate = templatesStore.availableTemplates.find(t => t.id === preferences.template_id)
        if (selectedTemplate) {
          templatesStore.setSelectedTemplate(selectedTemplate)
        }
        
        const selectedColor = colorsStore.availableColors.find(c => c.id === preferences.color_id)
        if (selectedColor) {
          colorsStore.setSelectedColorScheme(selectedColor)
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }
  }
}

const refreshData = async () => {
  try {
    await loadUserPreferences()
    await refetchTemplateData()
  } catch (error) {
    console.error('Error refreshing data:', error)
  }
}

watch(() => templatesStore.selectedTemplate, (newTemplate, oldTemplate) => {
  if (newTemplate && newTemplate !== oldTemplate) {
  }
}, { deep: true })

watch(() => colorsStore.selectedColorScheme, (newColorScheme, oldColorScheme) => {
  if (newColorScheme && newColorScheme !== oldColorScheme) {
  }
}, { deep: true })

watch(() => templateData.value, (newData, oldData) => {
  if (newData && newData !== oldData) {
  }
}, { deep: true })

watch(() => useRoute().path, (newPath, oldPath) => {
  if (newPath !== oldPath && newPath === '/') {
    loadUserPreferences()
  }
})

defineExpose({
  refreshData
})
</script>
