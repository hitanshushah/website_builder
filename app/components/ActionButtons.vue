<template>
  <div class="flex gap-2" :class="containerClass">
    <!-- Visibility Toggle Button -->
    <UButton 
      v-if="showVisibility"
      :size="size" 
      variant="ghost" 
      :color="item.hide_on_website ? 'warning' : 'success'"
      @click="$emit('toggle-visibility', item)"
      :title="item.hide_on_website ? 'Show on website' : 'Hide from website'"
    >
      <UIcon :name="item.hide_on_website ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" :class="iconClass" />
    </UButton>

    <!-- Edit Button -->
    <UButton 
      v-if="showEdit"
      :size="size" 
      variant="ghost" 
      color="neutral" 
      @click="$emit('edit', item)"
    >
      <UIcon name="i-heroicons-pencil" :class="iconClass" />
    </UButton>

    <!-- Delete Button -->
    <UButton 
      v-if="showDelete"
      :size="size" 
      variant="ghost" 
      color="error" 
      @click="$emit('delete', item)"
    >
      <UIcon name="i-heroicons-trash" :class="iconClass" />
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  item: any
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showVisibility?: boolean
  showEdit?: boolean
  showDelete?: boolean
  containerClass?: string
}>(), {
  size: 'sm',
  showVisibility: true,
  showEdit: true,
  showDelete: true,
  containerClass: 'ml-4'
})

const emit = defineEmits<{
  (e: 'toggle-visibility', item: any): void
  (e: 'edit', item: any): void
  (e: 'delete', item: any): void
}>()

const iconClass = computed(() => {
  return props.size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'
})
</script>

