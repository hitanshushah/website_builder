<template>
  <div class="mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Website URL</h2>
      
      <!-- Show URL if it exists -->
      <div v-if="displayUrl && !showUrlForm" class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-globe-alt" class="w-6 h-6 text-black dark:text-white" />
          <a 
            :href="fullUrl || undefined" 
            target="_blank"
            class="text-lg hover:underline text-black dark:text-white dark:bg-gray-700 dark:hover:bg-gray-500 py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            {{ displayUrl }}
          </a>
          <UButton
            @click="copyToClipboard"
            variant="ghost"
            color="neutral"
            size="md"
            class="cursor-pointer"
            icon="i-heroicons-clipboard-document"
          />
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg">
            <span 
              class="text-sm font-medium"
              :class="websiteUrlData?.share_website ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'"
            >
              {{ websiteUrlData?.share_website ? 'Live' : 'Hidden' }}
            </span>
            <USwitch
              :model-value="websiteUrlData?.share_website || false"
              @update:model-value="initiateToggleShare"
              class="cursor-pointer"
            />
          </div>
          <UButton
            @click="editUrl"
            variant="outline"
            color="neutral"
            size="sm"
            class="cursor-pointer"
          >
            Change URL
          </UButton>
          <UButton
            @click="showDeleteModal = true"
            variant="outline"
            color="error"
            size="sm"
            class="cursor-pointer"
          >
            Delete URL
          </UButton>
        </div>
      </div>

      <!-- Show form if no URL or editing -->
      <div v-else>
        <div v-if="!showUrlForm" class="text-center py-4">
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            You haven't created your custom domain yet
          </p>
          <UButton
            @click="showUrlForm = true"
            color="neutral"
            size="lg"
            icon="i-heroicons-plus-circle"
            class="cursor-pointer"
          >
            Create Your Custom Domain
          </UButton>
        </div>

        <!-- URL Input Form -->
        <div v-if="showUrlForm" class="space-y-4">
          <div class="flex items-center gap-2">
            <UInput
              v-model="customUrl"
              placeholder="yourname"
              size="lg"
              class="flex-1"
              :disabled="saving"
            />
            <span class="text-lg text-gray-600 dark:text-gray-400">.{{ domainUrl }}</span>
          </div>
          
          <div v-if="urlError" class="text-red-600 dark:text-red-400 text-sm">
            {{ urlError }}
          </div>

          <div class="flex gap-3">
            <UButton
              @click="saveWebsiteUrl"
              color="neutral"
              :loading="saving"
              :disabled="!customUrl || saving"
              class="cursor-pointer"
            >
              Submit
            </UButton>
            <UButton
              @click="cancelUrlForm"
              color="neutral"
              variant="outline"
              :disabled="saving"
              class="cursor-pointer"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ModalsDeleteConfirmModal
      v-if="showDeleteModal"
      itemType="Website URL"
      :itemName="displayUrl || 'Custom Domain'"
      :itemId="userId"
      deleteApi="/api/website-url"
      @deleted="handleDeleteConfirmed"
      @cancel="handleDeleteCancelled"
    />

    <!-- Visibility Toggle Modal -->
    <ModalsVisibilityToggleModal
      v-if="showVisibilityModal"
      itemType="Website URL"
      :itemName="displayUrl || 'Custom Domain'"
      :willHide="!pendingShareState"
      @confirm="handleVisibilityConfirm"
      @cancel="handleVisibilityCancel"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  userId: number | string
  domainUrl: string
}>()

const emit = defineEmits<{
  refresh: []
}>()

const toast = useToast()

const websiteUrlData = ref<{
  website_url: string | null
  personal_website_url: string | null
  share_website: boolean
  share_personal_website: boolean
} | null>(null)
const showUrlForm = ref(false)
const customUrl = ref('')
const saving = ref(false)
const urlError = ref('')
const showDeleteModal = ref(false)
const showVisibilityModal = ref(false)
const pendingShareState = ref(false)

const displayUrl = computed(() => {
  if (!websiteUrlData.value) return null
  
  if (websiteUrlData.value.website_url) {
    return `${websiteUrlData.value.website_url}.${props.domainUrl}`
  }
  
  return null
})

const fullUrl = computed(() => {
  if (!displayUrl.value) return null
  return `https://${displayUrl.value}`
})

const copyToClipboard = async () => {
  if (!fullUrl.value) return
  
  try {
    await navigator.clipboard.writeText(fullUrl.value)
    toast.add({
      title: 'Copied!',
      description: 'URL copied to clipboard',
      color: 'success'
    })
  } catch (error) {
    console.error('Failed to copy:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to copy URL to clipboard',
      color: 'error'
    })
  }
}

const fetchWebsiteUrl = async () => {
  try {
    const data = await $fetch('/api/website-url', {
      query: { userId: props.userId }
    })
    websiteUrlData.value = data as any
  } catch (error) {
    console.error('Error fetching website URL:', error)
  }
}

const saveWebsiteUrl = async () => {
  if (!customUrl.value) return
  
  urlError.value = ''
  saving.value = true
  
  try {
    const response = await $fetch('/api/website-url', {
      method: 'POST',
      body: {
        userId: props.userId,
        websiteUrl: customUrl.value
      }
    })
    
    websiteUrlData.value = (response as any).data
    showUrlForm.value = false
    customUrl.value = ''
    
    toast.add({
      title: 'Success',
      description: 'Your custom domain has been created successfully',
      color: 'success'
    })
  } catch (error: any) {
    if (error.statusCode === 409) {
      urlError.value = 'This website URL is already taken. Please try another one.'
    } else {
      urlError.value = error.data?.statusMessage || 'Failed to save website URL'
    }
    
    toast.add({
      title: 'Error',
      description: urlError.value,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const editUrl = () => {
  if (websiteUrlData.value?.website_url) {
    customUrl.value = websiteUrlData.value.website_url
  }
  showUrlForm.value = true
}

const cancelUrlForm = () => {
  showUrlForm.value = false
  customUrl.value = ''
  urlError.value = ''
}

const handleDeleteConfirmed = async () => {
  showDeleteModal.value = false
  await fetchWebsiteUrl()
  
  toast.add({
    title: 'Success',
    description: 'Your website URL has been deleted',
    color: 'success'
  })
}

const handleDeleteCancelled = () => {
  showDeleteModal.value = false
}

const initiateToggleShare = (newValue: boolean) => {
  pendingShareState.value = newValue
  showVisibilityModal.value = true
}

const handleVisibilityConfirm = async () => {
  try {
    const response = await $fetch('/api/website-url-share.toggle', {
      method: 'POST',
      body: {
        userId: props.userId,
        shareWebsite: pendingShareState.value
      }
    })
    
    websiteUrlData.value = (response as any).data
    showVisibilityModal.value = false
    
    // Emit refresh event so other components can update
    emit('refresh')
    
    toast.add({
      title: 'Success',
      description: pendingShareState.value 
        ? 'Your website is now accessible to everyone on the internet'
        : 'Your website is now private',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error toggling share website:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to update website visibility',
      color: 'error'
    })
  }
}

const handleVisibilityCancel = () => {
  showVisibilityModal.value = false
}

onMounted(() => {
  fetchWebsiteUrl()
})

defineExpose({
  fetchWebsiteUrl
})
</script>

