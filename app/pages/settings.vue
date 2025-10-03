<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

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

</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <UTabs :items="items" color="neutral" variant="link" :ui="{ trigger: 'grow' }" class="gap-4 w-full py-8 px-16">
    <template #templates="{ item }">
        <settingsTemplates />
    </template>

    <template #colors="{ item }">
      <settingsColors />
    </template>
  </UTabs>
  </div>
</template>

