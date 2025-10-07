<template>
  <div class="mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Personal Website URL</h2>
        <span v-if="!isPremium" class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium rounded-full">
          Premium Subscription Needed
        </span>
      </div>
      
      <!-- Premium Content -->
      <div v-if="isPremium">
        <div v-if="websiteUrlData?.personal_website_url && !showPersonalUrlForm" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-link" class="w-6 h-6 text-primary-500" />
            <a 
              :href="websiteUrlData.personal_website_url" 
              target="_blank"
              class="text-lg text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              {{ websiteUrlData.personal_website_url }}
            </a>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg">
              <span 
                class="text-sm font-medium"
                :class="websiteUrlData?.share_personal_website ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'"
              >
                {{ websiteUrlData?.share_personal_website ? 'Live' : 'Hidden' }}
              </span>
              <USwitch
                :model-value="websiteUrlData?.share_personal_website || false"
                @update:model-value="initiateToggleShare"
              />
            </div>
            <UButton
              @click="editPersonalUrl"
              variant="outline"
              color="neutral"
              size="sm"
            >
              Change URL
            </UButton>
            <UButton
              @click="showDeletePersonalModal = true"
              variant="outline"
              color="error"
              size="sm"
            >
              Delete URL
            </UButton>
          </div>
        </div>

        <!-- Show form if no URL or editing -->
        <div v-else>
          <div v-if="!showPersonalUrlForm" class="text-center py-4">
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              You haven't added your personal website URL yet
            </p>
            <UButton
              @click="showPersonalUrlForm = true"
              color="primary"
              size="lg"
              icon="i-heroicons-plus-circle"
            >
              Add Personal Website URL
            </UButton>
          </div>

          <!-- URL Input Form -->
          <div v-if="showPersonalUrlForm" class="space-y-4">
            <UInput
              v-model="customPersonalUrl"
              placeholder="https://yourdomain.com"
              size="lg"
              :disabled="savingPersonal"
            />
            
            <div v-if="personalUrlError" class="text-red-600 dark:text-red-400 text-sm">
              {{ personalUrlError }}
            </div>

            <div class="flex gap-3">
              <UButton
                @click="savePersonalWebsiteUrl"
                color="success"
                :loading="savingPersonal"
                :disabled="!customPersonalUrl || savingPersonal"
              >
                Submit
              </UButton>
              <UButton
                @click="cancelPersonalUrlForm"
                color="neutral"
                variant="outline"
                :disabled="savingPersonal"
              >
                Cancel
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Non-Premium Message -->
      <div v-else class="text-center">
        <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          Upgrade to Premium to use your own custom domain
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500">
          With Premium, you can use any domain name you own
        </p>
      </div>
    </div>

    <!-- Delete Personal URL Confirmation Modal -->
    <ModalsDeleteConfirmModal
      v-if="showDeletePersonalModal"
      itemType="Personal Website URL"
      :itemName="websiteUrlData?.personal_website_url || 'Custom Domain'"
      :itemId="userId"
      deleteApi="/api/personal-website-url"
      @deleted="handleDeletePersonalConfirmed"
      @cancel="handleDeletePersonalCancelled"
    />

    <!-- Visibility Toggle Modal -->
    <ModalsVisibilityToggleModal
      v-if="showVisibilityModal"
      itemType="Personal Website URL"
      :itemName="websiteUrlData?.personal_website_url || 'Custom Domain'"
      :willHide="!pendingShareState"
      @confirm="handleVisibilityConfirm"
      @cancel="handleVisibilityCancel"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  userId: number | string
  isPremium: boolean
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
const showPersonalUrlForm = ref(false)
const customPersonalUrl = ref('')
const savingPersonal = ref(false)
const personalUrlError = ref('')
const showDeletePersonalModal = ref(false)
const showVisibilityModal = ref(false)
const pendingShareState = ref(false)

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

const savePersonalWebsiteUrl = async () => {
  if (!customPersonalUrl.value) return
  
  personalUrlError.value = ''
  savingPersonal.value = true
  
  try {
    const response = await $fetch('/api/personal-website-url', {
      method: 'POST',
      body: {
        userId: props.userId,
        personalWebsiteUrl: customPersonalUrl.value
      }
    })
    
    websiteUrlData.value = (response as any).data
    showPersonalUrlForm.value = false
    customPersonalUrl.value = ''
    
    toast.add({
      title: 'Success',
      description: 'Your personal website URL has been saved successfully',
      color: 'success'
    })
  } catch (error: any) {
    personalUrlError.value = error.data?.statusMessage || 'Failed to save personal website URL'
    
    toast.add({
      title: 'Error',
      description: personalUrlError.value,
      color: 'error'
    })
  } finally {
    savingPersonal.value = false
  }
}

const editPersonalUrl = () => {
  if (websiteUrlData.value?.personal_website_url) {
    customPersonalUrl.value = websiteUrlData.value.personal_website_url
  }
  showPersonalUrlForm.value = true
}

const cancelPersonalUrlForm = () => {
  showPersonalUrlForm.value = false
  customPersonalUrl.value = ''
  personalUrlError.value = ''
}

const handleDeletePersonalConfirmed = async () => {
  showDeletePersonalModal.value = false
  await fetchWebsiteUrl()
  
  toast.add({
    title: 'Success',
    description: 'Your personal website URL has been deleted',
    color: 'success'
  })
}

const handleDeletePersonalCancelled = () => {
  showDeletePersonalModal.value = false
}

const initiateToggleShare = (newValue: boolean) => {
  pendingShareState.value = newValue
  showVisibilityModal.value = true
}

const handleVisibilityConfirm = async () => {
  try {
    const response = await $fetch('/api/personal-website-share.toggle', {
      method: 'POST',
      body: {
        userId: props.userId,
        sharePersonalWebsite: pendingShareState.value
      }
    })
    
    websiteUrlData.value = (response as any).data
    showVisibilityModal.value = false
    
    // Emit refresh event so other components can update
    emit('refresh')
    
    toast.add({
      title: 'Success',
      description: pendingShareState.value 
        ? 'Your personal website is now accessible to everyone on the internet'
        : 'Your personal website is now private',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error toggling share personal website:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to update personal website visibility',
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

