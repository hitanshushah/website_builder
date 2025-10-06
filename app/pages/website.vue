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

      <!-- Personal Website URL Section -->
      <PersonalWebsiteUrlSection
        v-if="userStore.user?.id"
        ref="personalWebsiteUrlSectionRef"
        :userId="userStore.user.id"
        :isPremium="userStore.isPremium"
        @refresh="refreshWebsiteSection"
      />

      <!-- Personal Access Token Section -->
      <PersonalAccessTokenSection
        v-if="userStore.user?.id"
        :userId="userStore.user.id"
        :isPremium="userStore.isPremium"
      />

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Selected Template</h2>
          
          <div v-if="selectedTemplate" class="rounded-lg overflow-hidden">
            <div class="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img 
                v-if="selectedTemplate.thumbnail"
                :src="selectedTemplate.thumbnail" 
                :alt="selectedTemplate.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-image" class="w-16 h-16 text-gray-400" />
              </div>
              
              <div v-if="selectedTemplate.is_premium" class="absolute top-2 right-2">
                <span class="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                  Premium
                </span>
              </div>
            </div>
            
            <div class="mt-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {{ selectedTemplate.name }}
              </h3>
              <p v-if="selectedTemplate.description" class="text-sm text-gray-600 dark:text-gray-400">
                {{ selectedTemplate.description }}
              </p>
            </div>
          </div>

          <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <p class="text-yellow-700 dark:text-yellow-400">No template selected</p>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Selected Color Scheme</h2>
          
          <UCard v-if="selectedColorScheme" class="w-full">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex gap-2">
                  <div v-if="selectedColorScheme.primary_color"
                    class="w-8 h-8 rounded-full border-2 border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.primary_color }"
                  />
                  <div v-if="selectedColorScheme.secondary_color"
                    class="w-8 h-8 rounded-full border-2 border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.secondary_color }"
                  />
                  <div v-if="selectedColorScheme.background_color"
                    class="w-8 h-8 rounded-full border-2 border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.background_color }"
                  />
                  <div v-if="selectedColorScheme.fourth_color"
                    class="w-8 h-8 rounded-full border-2 border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.fourth_color }"
                  />
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ selectedColorScheme.name }}
              </h3>

              <div class="space-y-3">
                <div v-if="selectedColorScheme.primary_color" class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded border border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.primary_color }"
                  />
                  <span class="text-sm text-gray-700 dark:text-white">Primary</span>
                  <span class="ml-auto text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ selectedColorScheme.primary_color }}
                  </span>
                </div>
                <div v-if="selectedColorScheme.secondary_color" class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded border border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.secondary_color }"
                  />
                  <span class="text-sm text-gray-700 dark:text-white">Secondary</span>
                  <span class="ml-auto text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ selectedColorScheme.secondary_color }}
                  </span>
                </div>
                <div v-if="selectedColorScheme.background_color" class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded border border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.background_color }"
                  />
                  <span class="text-sm text-gray-700 dark:text-white">Background</span>
                  <span class="ml-auto text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ selectedColorScheme.background_color }}
                  </span>
                </div>
                <div v-if="selectedColorScheme.fourth_color" class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded border border-gray-200"
                    :style="{ backgroundColor: selectedColorScheme.fourth_color }"
                  />
                  <span class="text-sm text-gray-700 dark:text-white">Accent</span>
                  <span class="ml-auto text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ selectedColorScheme.fourth_color }}
                  </span>
                </div>
              </div>
            </div>
          </UCard>

          <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <p class="text-yellow-700 dark:text-yellow-400">No color scheme selected</p>
          </div>
        </div>
      </div>
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

const selectedTemplate = ref<any>(null)
const selectedColorScheme = ref<any>(null)

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

const fetchUserPreferences = async () => {
  if (!userStore.user?.id) return
  
  try {
    const templatesResponse = await $fetch('/api/templates')
    const templates = (templatesResponse as any) || []

    const colorsResponse = await $fetch('/api/colors', {
      query: {
        userId: userStore.user.id
      }
    })
    const colors = (colorsResponse as any)?.data || []

    const userPreferencesResponse = await $fetch('/api/user-preferences', {
      query: {
        userId: userStore.user.id
      }
    })

    if (userPreferencesResponse && (userPreferencesResponse as any)?.success && (userPreferencesResponse as any)?.data) {
      const preferences = (userPreferencesResponse as any).data
      
      const selectedTemplateItem = templates.find((t: any) => t.id === preferences.template_id)
      if (selectedTemplateItem) {
        selectedTemplate.value = selectedTemplateItem
      }
      
      const selectedColorItem = colors.find((c: any) => c.id === preferences.color_id)
      if (selectedColorItem) {
        selectedColorScheme.value = selectedColorItem
      }
    } else {
      const defaultTemplate = templates.find((t: any) => t.is_default === true)
      if (defaultTemplate) {
        selectedTemplate.value = defaultTemplate
      }
      
      const defaultColor = colors.find((c: any) => c.is_default === true)
      if (defaultColor) {
        selectedColorScheme.value = defaultColor
      }
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error)
  }
}

onMounted(async () => {
  await fetchUserData()
  await fetchUserPreferences()
})
</script>

