<template>
  <div class="max-w-6xl mx-auto p-8">
    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-16">
        <div class="flex items-center gap-4">
          <USkeleton class="h-12 w-12 rounded-full" />

          <div class="grid gap-2">
            <USkeleton class="h-4 w-[250px]" />
            <USkeleton class="h-4 w-[200px]" />
          </div>
        </div>
      <p class="mt-4 text-gray-600">Loading color schemes...</p>
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

    <!-- Color Schemes Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <UCard
        v-for="colorScheme in colors"
        :key="colorScheme.id"
        class="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        :class="{
          'ring-2 ring-primary-500 ring-offset-2': selectedColorId === colorScheme.id
        }"
        @click="selectColorScheme(colorScheme)"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <div
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                :style="{ backgroundColor: colorScheme.primary_color }"
              />
              <div
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                :style="{ backgroundColor: colorScheme.secondary_color }"
              />
              <div
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                :style="{ backgroundColor: colorScheme.background_color }"
              />
            </div>
            
            <!-- Selection Indicator -->
            <UIcon
              v-if="selectedColorId === colorScheme.id"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-primary-500"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Scheme Name -->
          <h3 class="text-xl font-semibold text-gray-900">{{ colorScheme.name }}</h3>

          <!-- Color Breakdown List -->
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded border border-gray-200"
                :style="{ backgroundColor: colorScheme.primary_color }"
              />
              <span class="text-sm text-gray-700">Primary</span>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded border border-gray-200"
                :style="{ backgroundColor: colorScheme.secondary_color }"
              />
              <span class="text-sm text-gray-700">Secondary</span>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded border border-gray-200"
                :style="{ backgroundColor: colorScheme.background_color }"
              />
              <span class="text-sm text-gray-700">Accent</span>
            </div>
          </div>
        </div>

        <template #footer v-if="selectedColorId === colorScheme.id">
          <div class="flex items-center justify-center">
            <UBadge color="primary" variant="soft">
              Selected
            </UBadge>
          </div>
        </template>
      </UCard>
    </div>
      <div class="flex justify-center gap-4 mt-8">
        <UButton
          @click="saveColorScheme"
          size="xl"
          color="success"
          variant="subtle"
          icon="i-heroicons-check-circle"
        >
          Save Color Scheme
        </UButton>
        <UButton
          @click="resetToDefault"
          color="neutral"
          size="xl"
          variant="subtle"
          icon="i-heroicons-arrow-path"
        >
          Reset to Default
        </UButton>
      </div>
  </div>
</template>

<script setup lang="ts">
import type { Color } from '../../types/index'
import { useUserStore } from './../../../stores/user'
import { useColorsStore } from './../../../stores/colors'

const userStore = useUserStore()
const colorsStore = useColorsStore()

const selectedColorId = computed(() => colorsStore.selectedColorScheme?.id || null)

const { data: colorsResponse, pending, error, refresh } = await useFetch('/api/colors', {
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
  
  // Show immediate feedback
  const toast = useToast()
  toast.add({
    title: 'Color Scheme Selected',
    description: `${colorScheme.name} color scheme has been applied`,
    color: 'success'
  })
}

const saveColorScheme = () => {
  const toast = useToast()
  toast.add({
    title: 'Color Scheme Saved',
    description: `${colorsStore.selectedColorScheme?.name || 'Selected'} color scheme has been applied`,
    color: 'success'
  })
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
</script>
