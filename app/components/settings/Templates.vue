<script setup lang="ts">
import type { Template } from '~/types'
import { useTemplatesStore } from '../../../stores/templates'
import { useUserPreferences } from '../../composables/useUserPreferences'
import { useUserStore } from '../../../stores/user'
import TemplatePreviewModal from '../modals/TemplatePreviewModal.vue'

const emit = defineEmits<{
  selectTemplate: [identifier: string]
}>()

const userStore = useUserStore()
const templatesStore = useTemplatesStore()
const { savePreferences } = useUserPreferences()

const isPremiumUser = computed(() => userStore.isPremium)
const selectedTemplateIsPremium = computed(() => templatesStore.selectedTemplate?.is_premium || false)
const needsUpgrade = computed(() => selectedTemplateIsPremium.value && !isPremiumUser.value)

const templates = ref<Template[]>([])
const validTemplates = ref<Template[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Modal state
const showPreviewModal = ref(false)
const previewTemplate = ref<Template | null>(null)

const fetchTemplates = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $fetch<Template[]>('/api/templates')
    templates.value = response

    const filtered = templates.value.filter(t => {
      try {
        const availableComponents = import.meta.glob('@/components/templates/*.vue', { eager: true })
        return availableComponents[`/components/templates/${t.identifier}.vue`]
      } catch (err) {
        return false
      }
    })

    validTemplates.value = filtered
  } catch (err) {
    console.error('Error fetching templates:', err)
    error.value = 'Failed to load templates. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTemplates()
})

const selectTemplate = (identifier: string) => {
  emit('selectTemplate', identifier)
  
  // Also update the store
  const template = validTemplates.value.find(t => t.identifier === identifier)
  if (template) {
    templatesStore.setSelectedTemplate(template)
  }
}

const saveTemplate = async () => {
  const toast = useToast()
  
  try {
    await savePreferences()
    toast.add({
      title: 'Preferences Saved',
      description: `Template and color preferences have been saved successfully`,
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Save Failed',
      description: error.message || 'Failed to save preferences',
      color: 'error'
    })
  }
}

const resetToDefault = () => {
  templatesStore.clearSelection()
  const toast = useToast()
  toast.add({
    title: 'Reset to Default',
    description: `Restored to ${templatesStore.defaultTemplate?.name || 'default'} template`,
    color: 'primary'
  })
}

const handleUpgrade = () => {
  navigateTo('/pricing')
}

const openPreview = (template: Template) => {
  previewTemplate.value = template
  showPreviewModal.value = true
}

const closePreview = () => {
  showPreviewModal.value = false
  previewTemplate.value = null
}
</script>

<template>
  <div class="w-full px-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose a Template</h2>
      <p class="text-gray-600 dark:text-gray-400">Select a template for your website.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-screen">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 mb-4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
      <p class="text-red-700 dark:text-red-400 mb-4">{{ error }}</p>
      <UButton @click="fetchTemplates" color="error" variant="outline">
        Try Again
      </UButton>
    </div>

    <!-- Template Cards -->
    <div v-else class="flex flex-wrap md:gap-10 gap-2 justify-center">
      <div 
        v-for="template in validTemplates" 
        :key="template.id"
        class="rounded-lg overflow-hiddentransition group w-sm"
        :class="{
          'ring-2 ring-primary-500 ring-offset-2': templatesStore.selectedTemplate?.identifier === template.identifier
        }"
      >
        <!-- Thumbnail -->
        <div class="rounded-lg relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden group">
          <img 
            v-if="template.thumbnail"
            :src="template.thumbnail" 
            :alt="template.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="w-16 h-16 text-gray-400" />
          </div>
          
          <!-- Hover View Button -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <UButton 
              @click="openPreview(template)"
              color="neutral"
              variant="solid"
              icon="i-heroicons-eye"
              class="cursor-pointer shadow-lg bg-white text-primary-600 hover:bg-primary-50"
            >
              View
            </UButton>
          </div>
          
          <div v-if="template.is_premium" class="absolute top-2 right-2">
            <span class="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
              Premium
            </span>
          </div>
        </div>
        <!-- Content -->
        <div class="ml-1 p-2 flex flex-row gap-4">
          <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ template.name }}</h3>
          <p v-if="template.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ template.description }}
          </p>
          </div>
          <div 
          v-if="templatesStore.selectedTemplate?.identifier === template.identifier" class="mt-1">
          <UIcon
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-primary-500"
            />
          </div>
          <div v-else>
          <UButton 
            @click="selectTemplate(template.identifier)"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
          >
            Select
          </UButton>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!loading" class="flex justify-center gap-4 mt-8 flex-col md:flex-row w-fit justify-self-center">
        <UBadge v-if="needsUpgrade" color="warning" variant="subtle">Plus Plan Required to Save</UBadge>
        <UButton
          v-else
          @click="saveTemplate"
          size="xl"
          color="success"
          variant="subtle"
          icon="i-heroicons-check-circle"
          class="cursor-pointer"
        >
          Save Template
        </UButton>
        <UButton
          @click="resetToDefault"
          color="neutral"
          size="xl"
          variant="subtle"
          icon="i-heroicons-arrow-path"
          class="cursor-pointer"
        >
          Reset to Default
        </UButton>
      </div>

    <!-- Template Preview Modal -->
    <TemplatePreviewModal
      v-if="showPreviewModal && previewTemplate"
      :template-name="previewTemplate.name"
      :template-description="previewTemplate.description || undefined"
      :image-url="previewTemplate.thumbnail || undefined"
      @close="closePreview"
    />
  </div>
</template>