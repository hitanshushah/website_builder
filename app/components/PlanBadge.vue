<template>
  <UBadge 
    :color="badgeColor" 
    :variant="badgeVariant"
    class="font-medium"
    size="xl"
  >
    {{ planName }}
  </UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  planId: number
}

const props = defineProps<Props>()

const planConfig = computed(() => {
  switch (props.planId) {
    case 1:
      return {
        name: 'Basic',
        color: 'error',
        variant: 'solid'
      }
    case 2:
      return {
        name: 'Plus',
        color: 'warning',
        variant: 'solid'
      }
    case 3:
      return {
        name: 'Pro',
        color: 'primary',
        variant: 'solid'
      }
    default:
      return {
        name: 'Basic',
        color: 'error',
        variant: 'solid'
      }
  }
})

const planName = computed(() => planConfig.value.name)
const badgeColor = computed(() => planConfig.value.color)
const badgeVariant = computed(() => planConfig.value.variant)
</script>
