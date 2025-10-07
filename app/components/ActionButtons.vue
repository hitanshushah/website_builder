<template>
  <div class="flex gap-2" :class="containerClass">
    <!-- Visibility Toggle Button -->
    <UButton 
      v-if="showVisibility"
      :size="size" 
      variant="ghost" 
      :color="item.hide_on_website ? 'warning' : 'success'"
      @click="openVisibilityModal"
      :title="item.hide_on_website ? 'Show on website' : 'Hide from website'"
      class="cursor-pointer"
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
      class="cursor-pointer"
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
      class="cursor-pointer"
      >
      <UIcon name="i-heroicons-trash" :class="iconClass" />
    </UButton>
  </div>

  <!-- Visibility Toggle Modal -->
  <ModalsVisibilityToggleModal
    v-if="showVisibilityModal"
    :item-type="itemType"
    :item-name="itemName"
    :will-hide="!item.hide_on_website"
    @cancel="closeVisibilityModal"
    @confirm="confirmToggleVisibility"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  item: any
  itemType?: string
  itemName?: string
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
  containerClass: 'ml-4',
  itemType: 'Item',
  itemName: 'this item'
})

const emit = defineEmits<{
  (e: 'toggle-visibility', item: any): void
  (e: 'edit', item: any): void
  (e: 'delete', item: any): void
}>()

const showVisibilityModal = ref(false)

const openVisibilityModal = () => {
  showVisibilityModal.value = true
}

const closeVisibilityModal = () => {
  showVisibilityModal.value = false
}

const confirmToggleVisibility = () => {
  showVisibilityModal.value = false
  emit('toggle-visibility', props.item)
}

const iconClass = computed(() => {
  return props.size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'
})
</script>

