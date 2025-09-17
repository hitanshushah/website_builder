<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Add Achievements" 
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="space-y-6">
      <!-- Achievement List -->
      <div v-for="(achievement, index) in achievements" :key="index" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Achievement {{ index + 1 }}
          </h3>
          <Button 
            v-if="achievements.length > 1"
            icon="pi pi-trash" 
            severity="danger" 
            text 
            size="small"
            @click="removeAchievement(index)"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <Textarea 
            v-model="achievement.description"
            placeholder="Describe your achievement"
            rows="3"
            class="w-full"
            :class="{ 'p-invalid': errors[`${index}.description`] }"
          />
          <small v-if="errors[`${index}.description`]" class="text-red-500">
            {{ errors[`${index}.description`] }}
          </small>
        </div>
      </div>

      <!-- Add Another Achievement Button -->
      <div class="text-center">
        <Button 
          icon="pi pi-plus" 
          label="Add Another Achievement" 
          severity="secondary"
          @click="addAchievement"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="closeDialog"
        />
        <Button 
          label="Save Achievements" 
          :loading="saving"
          @click="saveAchievements"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { Achievement } from '../types'

interface Props {
  modelValue: boolean
  userId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(props.modelValue)
const saving = ref(false)
const errors = ref<Record<string, string>>({})

// Achievement form data
const achievements = ref<Partial<Achievement>[]>([
  {
    description: ''
  }
])

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const addAchievement = () => {
  achievements.value.push({
    description: ''
  })
}

const removeAchievement = (index: number) => {
  if (achievements.value.length > 1) {
    achievements.value.splice(index, 1)
  }
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  achievements.value.forEach((achievement, index) => {
    if (!achievement.description?.trim()) {
      errors.value[`${index}.description`] = 'Description is required'
      isValid = false
    }
  })

  return isValid
}

const saveAchievements = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  errors.value = {}

  try {
    const achievementsToSave = achievements.value.map(achievement => ({
      description: achievement.description?.trim()
    }))

    await $fetch('/api/achievements', {
      method: 'POST',
      body: {
        userId: props.userId,
        achievements: achievementsToSave
      }
    })

    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Error saving achievements:', error)
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  visible.value = false
  // Reset form
  achievements.value = [{
    description: ''
  }]
  errors.value = {}
}
</script>
