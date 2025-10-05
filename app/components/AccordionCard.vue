<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <UContainer class="hover:shadow-md transition-shadow cursor-pointer p-4" @click="$emit('toggle')">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div 
            class="bg-blue-100 dark:bg-blue-900 w-10 h-10 rounded-lg flex items-center justify-center"
          >
            <UIcon :name="icon" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">{{ title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ itemCount }} item{{ itemCount !== 1 ? 's' : '' }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <UButton 
            size="sm" 
            variant="subtle" 
            color="neutral"
            @click.stop="$emit('add')"
            class="cursor-pointer"
          >
            + Add
          </UButton>
          <UIcon 
            name="i-heroicons-chevron-down" 
            class="w-4 h-4 text-gray-400 transition-transform duration-200"
            :class="isOpen ? 'rotate-180' : ''"
          />
        </div>
      </div>
    </UContainer>
    <div 
      v-show="isOpen" 
      class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
    >
      <div class="p-4">
        <slot>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ title }} content...</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  itemCount: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'blue'
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'add'])

</script>

