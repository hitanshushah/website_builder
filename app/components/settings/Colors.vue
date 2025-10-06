<template>
  <div class="p-2">
    <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center h-screen">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      <UCard
        v-for="n in 3"
        :key="n"
        class="cursor-pointer transition-all duration-200"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <USkeleton class="w-8 h-8 rounded-full" />
              <USkeleton class="w-8 h-8 rounded-full" />
              <USkeleton class="w-8 h-8 rounded-full" />
            </div>
            <USkeleton class="w-6 h-6 rounded-full" />
          </div>
        </template>

        <div class="space-y-4">
          <USkeleton class="h-6 w-32 rounded" />

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <USkeleton class="w-4 h-4 rounded" />
              <USkeleton class="h-4 w-20 rounded" />
            </div>
            <div class="flex items-center gap-3">
              <USkeleton class="w-4 h-4 rounded" />
              <USkeleton class="h-4 w-24 rounded" />
            </div>
            <div class="flex items-center gap-3">
              <USkeleton class="w-4 h-4 rounded" />
              <USkeleton class="h-4 w-16 rounded" />
            </div>
          </div>
        </div>
      </UCard>
    </div>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="error"
      variant="soft"
      title="Failed to load color schemes"
      description="Please try again"
      class="mb-6"
    >
      <template #actions>
        <UButton @click="refresh()" color="error" variant="soft">
          Retry
        </UButton>
      </template>
    </UAlert>

    <div v-else class="flex flex-wrap gap-6 w-full justify-center">
      <UCard
        v-for="colorScheme in colors"
        :key="colorScheme.id"
        class="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 w-72"
        :class="{
          'ring-2 ring-primary-500 ring-offset-2': selectedColorId === colorScheme.id
        }"
        @click="selectColorScheme(colorScheme)"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <div v-if="colorScheme.primary_color"
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                :style="{ backgroundColor: colorScheme.primary_color }"
              />
              <div v-if="colorScheme.secondary_color"
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                :style="{ backgroundColor: colorScheme.secondary_color }"
              />
              <div v-if="colorScheme.background_color"
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                :style="{ backgroundColor: colorScheme.background_color }"
              />
              <div v-if="colorScheme.fourth_color"
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                :style="{ backgroundColor: colorScheme.fourth_color }"
              />
            </div>
            
            <!-- Selection Indicator -->
            <UIcon
              v-if="selectedColorId === colorScheme.id"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-primary-500"
            />
            <UButton
              v-else
              size="sm"
              variant="subtle"
              color="neutral"
              class="cursor-pointer"
            >
              Select
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ colorScheme.name }}</h3>

          <div class="space-y-3">
            <div v-if="colorScheme.primary_color" class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded border border-gray-200"
                :style="{ backgroundColor: colorScheme.primary_color }"
              />
              <span class="text-sm text-gray-700 dark:text-white">Primary</span>
            </div>
            <div v-if="colorScheme.secondary_color" class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded border border-gray-200"
                :style="{ backgroundColor: colorScheme.secondary_color }"
              />
              <span class="text-sm text-gray-700 dark:text-white">Secondary</span>
            </div>
            <div v-if="colorScheme.background_color" class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded border border-gray-200"
                :style="{ backgroundColor: colorScheme.background_color }"
              />
              <span class="text-sm text-gray-700 dark:text-white">Background</span>
            </div>
            <div v-if="colorScheme.fourth_color" class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded border border-gray-200"
                :style="{ backgroundColor: colorScheme.fourth_color }"
              />
              <span class="text-sm text-gray-700 dark:text-white">Accent</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-center gap-5 cursor-default" @click.stop>
            <UButton
              size="sm"
              variant="subtle"
              color="neutral"
              @click="customize(colorScheme)"
            >
              Customize
            </UButton>
              <UButton v-if="colorScheme.user_id"
                size="sm"
                variant="subtle"
                color="error"
                @click="deleteColorScheme(colorScheme)"
              >
                Delete
              </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Custom Colors Section -->
    <div v-if="isCustomizing && customColorScheme" class="mt-12 px-8 mx-auto">
      <UCard>
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Custom Colors</h2>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Create your own color scheme</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scheme Name
            </label>
            <UInput
              v-model="customColorScheme.name"
              placeholder="Enter color scheme name"
              size="lg"
            />
          </div>

          <div class="flex flex-wrap gap-6">
            <div v-if="customColorScheme.primary_color">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Primary Color
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  v-model="customColorScheme.primary_color"
                  class="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <UInput
                  v-model="customColorScheme.primary_color"
                  class="flex-1 w-fit"
                />
              </div>
            </div>

            <div v-if="customColorScheme.secondary_color">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Secondary Color
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  v-model="customColorScheme.secondary_color"
                  class="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <UInput
                  v-model="customColorScheme.secondary_color"
                  class="flex-1 w-fit"
                />
              </div>
            </div>

            <div v-if="customColorScheme.background_color">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Background Color
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  v-model="customColorScheme.background_color"
                  class="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <UInput
                  v-model="customColorScheme.background_color"
                  class="flex-1 w-fit"
                />
              </div>
            </div>

            <div v-if="customColorScheme.fourth_color">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Accent Color
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  v-model="customColorScheme.fourth_color"
                    class="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <UInput
                  v-model="customColorScheme.fourth_color"
                  class="flex-1 w-fit"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-center gap-4 pt-4">
            <UButton
              @click="tryCustomColors"
              size="lg"
              color="neutral"
              variant="subtle"
              icon="i-heroicons-eye"
            >
              Try
            </UButton>
            <UButton
              @click="saveCustomColors"
              size="lg"
              variant="subtle"
              color="success"
              icon="i-heroicons-check"
            >
              Save
            </UButton>
            <UButton
              @click="cancelCustomization"
              size="lg"
              color="neutral"
              variant="outline"
              icon="i-heroicons-x-mark"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

      <div v-if="!pending" class="flex justify-center gap-4 mt-8">
        <UButton
          @click="saveColorScheme"
          size="xl"
          color="success"
          variant="subtle"
          icon="i-heroicons-check-circle"
          class="cursor-pointer"
        >
          Save Color Scheme
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
        <UButton
          @click="customize(null)"
          color="neutral"
          size="xl"
          variant="subtle"
          icon="i-heroicons-cog-6-tooth"
          class="cursor-pointer"
        >
          Create Color Scheme
        </UButton>
      </div>

    <!-- Delete Confirmation Modal -->
    <ModalsDeleteConfirmModal
      v-if="showDeleteModal && colorToDelete"
      :itemType="'Color Scheme'"
      :itemName="colorToDelete.name"
      :itemId="colorToDelete.id"
      :deleteApi="'/api/colors'"
      @deleted="handleDeleteConfirmed"
      @cancel="handleDeleteCancelled"
    />
  </div>
</template>

<script setup lang="ts">
import type { Color } from '../../types/index'
import { useUserStore } from './../../../stores/user'
import { useColorsStore } from './../../../stores/colors'
import { useTemplatesStore } from './../../../stores/templates'
import { useUserPreferences } from '~/composables/useUserPreferences'

const userStore = useUserStore()
const colorsStore = useColorsStore()
const templatesStore = useTemplatesStore()
const { savePreferences } = useUserPreferences()

const selectedColorId = computed(() => colorsStore.selectedColorScheme?.id || null)

const isCustomizing = ref(false)
const customColorScheme = ref<Color | null>(null)

// Delete modal state
const showDeleteModal = ref(false)
const colorToDelete = ref<Color | null>(null)

const { data: colorsResponse, pending, error, refresh } = useFetch('/api/colors', {
  query: {
    userId: userStore.user?.id || null
  }
})

const colors = computed(() => {
  const colorsData = (colorsResponse.value as any)?.data || []
  colorsStore.setAvailableColors(colorsData)
  return colorsData
})

const selectColorScheme = (colorScheme: Color) => {
  colorsStore.setSelectedColorScheme(colorScheme)
  
  const toast = useToast()
  toast.add({
    title: 'Color Scheme Selected',
    description: `${colorScheme.name} color scheme has been applied`,
    color: 'success'
  })
}

const saveColorScheme = async () => {
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
  colorsStore.clearSelection()
  const toast = useToast()
  toast.add({
    title: 'Reset to Default',
    description: `Restored to ${colorsStore.defaultColorScheme?.name || 'default'} color scheme`,
    color: 'primary'
  })
}

const customize = (colorScheme: Color | null) => {
  if (!templatesStore.selectedTemplate) {
    const toast = useToast()
    toast.add({
      title: 'Template Required',
      description: 'Please select a template first before customizing colors',
      color: 'warning'
    })
    return
  }

  if (colorScheme === null) {
    // Create new color scheme from scratch
    customColorScheme.value = {
      id: 0,
      key: '',
      name: 'My Custom Scheme',
      primary_color: '#000000',
      secondary_color: '#000000',
      background_color: '#000000',
      fourth_color: '#000000',
      is_active: true,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } else {
    // Customize existing color scheme
    customColorScheme.value = {
      ...colorScheme,
      name: `${colorScheme.name} (Custom)`
    }
  }
  
  isCustomizing.value = true
  
  nextTick(() => {
    const customSection = document.querySelector('.mt-12')
    customSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const tryCustomColors = () => {
  if (customColorScheme.value) {
    colorsStore.setSelectedColorScheme(customColorScheme.value)
    
    const toast = useToast()
    toast.add({
      title: 'Preview Applied',
      description: 'Custom colors are being previewed',
      color: 'primary'
    })
  }
}

const saveCustomColors = async () => {
  const toast = useToast()
  
  if (!customColorScheme.value) {
    toast.add({
      title: 'Error',
      description: 'No custom color scheme to save',
      color: 'error'
    })
    return
  }

  if (!userStore.user?.id) {
    toast.add({
      title: 'Error',
      description: 'You must be logged in to save custom colors',
      color: 'error'
    })
    return
  }

  if (!templatesStore.selectedTemplate) {
    toast.add({
      title: 'Error',
      description: 'Please select a template first',
      color: 'error'
    })
    return
  }

  try {
    const response = await $fetch('/api/colors', {
      method: 'POST',
      body: {
        name: customColorScheme.value.name,
        primary_color: customColorScheme.value.primary_color,
        secondary_color: customColorScheme.value.secondary_color,
        background_color: customColorScheme.value.background_color,
        fourth_color: customColorScheme.value.fourth_color,
        user_id: userStore.user.id
      }
    }) as any

    const newColor = response.data

    colorsStore.setSelectedColorScheme(newColor)

    await savePreferences()

    toast.add({
      title: 'Success',
      description: 'Custom color scheme created and saved successfully',
      color: 'success'
    })

    isCustomizing.value = false
    customColorScheme.value = null

    await refresh()
  } catch (error: any) {
    console.error('Error saving custom colors:', error)
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || error.message || 'Failed to save custom color scheme',
      color: 'error'
    })
  }
}

const cancelCustomization = () => {
  isCustomizing.value = false
  customColorScheme.value = null
  
  const toast = useToast()
  toast.add({
    title: 'Customization Cancelled',
    description: 'Returned to color scheme selection',
    color: 'neutral'
  })
}

const deleteColorScheme = (colorScheme: Color) => {
  colorToDelete.value = colorScheme
  showDeleteModal.value = true
}

const handleDeleteConfirmed = async () => {
  showDeleteModal.value = false
  
  if (colorToDelete.value?.id) {
    const isCurrentlySelected = selectedColorId.value === colorToDelete.value.id
    
    if (isCurrentlySelected) {
      colorsStore.clearSelection()
    }
    
    await refresh()
    
    colorToDelete.value = null
  }
}

const handleDeleteCancelled = () => {
  showDeleteModal.value = false
  colorToDelete.value = null
}
</script>
