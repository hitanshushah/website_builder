<template>
  <div class="mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Personal Access Token</h2>
        <span v-if="!isPremium" class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium rounded-full">
          Premium Subscription Needed
        </span>
      </div>
      
      <!-- Premium Content -->
      <div v-if="isPremium">
        <div v-if="accessToken" class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Your personal access token for API authentication
          </p>
          <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <UIcon name="i-heroicons-key" class="w-5 h-5 text-primary-500 flex-shrink-0" />
            <code class="flex-1 text-sm font-mono text-gray-900 dark:text-white break-all">
              {{ accessToken }}
            </code>
            <UButton
              @click="copyToken"
              variant="outline"
              color="neutral"
              size="sm"
              :icon="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
              class="cursor-pointer"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </UButton>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-yellow-800 dark:text-yellow-200">
                <p class="font-medium mb-1">Keep this token secure!</p>
                <p class="text-xs">This token cannot be regenerated. If you lose it, you'll need to contact support.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Show Generate Button if no token -->
        <div v-else class="text-center">
          <UIcon name="i-heroicons-key" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Generate a personal access token for API authentication
          </p>
          <UButton
            @click="generateToken"
            color="primary"
            size="lg"
            icon="i-heroicons-sparkles"
            :loading="generating"
            :disabled="generating"
            class="cursor-pointer"
          >
            {{ generating ? 'Generating...' : 'Generate Access Token' }}
          </UButton>
        </div>
      </div>

      <!-- Non-Premium Message -->
      <div v-else class="text-center">
        <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          Upgrade to Premium to generate API access tokens
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500">
          Personal access tokens allow you to authenticate with our API
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  userId: number | string
  isPremium: boolean
}>()

const toast = useToast()

const accessToken = ref<string | null>(null)
const generating = ref(false)
const copied = ref(false)

const fetchAccessToken = async () => {
  try {
    const data = await $fetch('/api/access-token', {
      query: { userId: props.userId }
    })
    accessToken.value = (data as any).access_token || null
  } catch (error) {
    console.error('Error fetching access token:', error)
  }
}

const generateToken = async () => {
  generating.value = true
  
  try {
    const response = await $fetch('/api/access-token', {
      method: 'POST',
      body: {
        userId: props.userId
      }
    })
    
    accessToken.value = (response as any).data.access_token
    
    toast.add({
      title: 'Success',
      description: 'Your personal access token has been generated successfully',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error generating access token:', error)
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'Failed to generate access token',
      color: 'error'
    })
  } finally {
    generating.value = false
  }
}

const copyToken = async () => {
  if (!accessToken.value) return
  
  try {
    await navigator.clipboard.writeText(accessToken.value)
    copied.value = true
    
    toast.add({
      title: 'Copied!',
      description: 'Access token copied to clipboard',
      color: 'success'
    })
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to copy to clipboard',
      color: 'error'
    })
  }
}

onMounted(() => {
  fetchAccessToken()
})

defineExpose({
  fetchAccessToken
})
</script>

