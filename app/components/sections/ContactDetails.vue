<template>
  <div class="space-y-4">
    <div v-if="!hasContactDetails" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">📞</span>
      <p>No contact details available</p>
    </div>

    <div v-else-if="userProfile" class="space-y-4">
      <!-- Phone Number Card -->
      <UCard 
        v-if="userProfile.phone_number"
        class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3 flex-1">
            <UIcon name="i-heroicons-phone" class="text-primary-600 dark:text-primary-400 text-lg flex-shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
              <p class="text-gray-900 dark:text-white font-medium truncate">{{ userProfile.phone_number }}</p>
            </div>
          </div>

          <!-- Action Buttons for Phone -->
          <ActionButtons 
            :item="phoneItem"
            item-type="Phone Number"
            :item-name="userProfile.phone_number"
            @toggle-visibility="() => toggleFieldVisibility('phone')"
            @edit="editContactDetails"
            @delete="() => deleteField('phone')"
          />
        </div>
      </UCard>

      <!-- Secondary Email Card -->
      <UCard 
        v-if="userProfile.secondary_email"
        class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        <div class="flex justify-between items-start flex-col md:flex-row gap-4">
          <div class="flex items-center gap-3 flex-1">
            <UIcon name="i-heroicons-envelope" class="text-primary-600 dark:text-primary-400 text-lg flex-shrink-0" />
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <p class="text-xs text-gray-500 dark:text-gray-400">Secondary Email</p>
                <span v-if="userProfile.override_email" class="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-medium">
                  Overriding
                </span>
              </div>

              <!-- Email text + Override Button in same row -->
              <div class="flex items-center gap-2">
                <p class="text-gray-900 dark:text-white font-medium truncate">
                  {{ userProfile.secondary_email }}
                </p>

                <UButton 
                  size="xs" 
                  :color="userProfile.override_email ? 'success' : 'neutral'"
                  variant="soft"
                  @click="openOverrideEmailModal"
                  class="flex-shrink-0"
                >
                  <UIcon name="i-heroicons-arrow-path" class="w-3 h-3 mr-1 cursor-pointer" />
                  {{ userProfile.override_email ? 'Restore' : 'Override' }}
                </UButton>
              </div>
            </div>
          </div>

          <!-- Action Buttons for Secondary Email -->
          <ActionButtons 
            :item="secondaryEmailItem"
            item-type="Secondary Email"
            :item-name="userProfile.secondary_email"
            @toggle-visibility="() => toggleFieldVisibility('secondary_email')"
            @edit="editContactDetails"
            @delete="() => deleteField('secondary_email')"
          />
        </div>
      </UCard>


      <!-- Introduction Card -->
      <UCard 
        v-if="userProfile.introduction"
        class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        <div class="flex justify-between items-start gap-4 flex-col md:flex-row">
          <div class="w-full md:flex-1 md:min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Introduction</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">{{ userProfile.introduction }}</p>
          </div>

          <!-- Action Buttons for Introduction -->
          <div class="flex-shrink-0 self-start">
            <ActionButtons 
              :item="introductionItem"
              item-type="Introduction"
              item-name="introduction text"
              @toggle-visibility="() => toggleFieldVisibility('introduction')"
              @edit="editContactDetails"
              @delete="() => deleteField('introduction')"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>

  <!-- Edit Contact Details Modal -->
  <FormsContactDetailsEditForm 
    v-if="isEditing"
    :contact-details="contactDetailsData"
    @updated="handleContactDetailsUpdated"
    @close="closeEditModal"
  />

  <!-- Delete Confirmation Modal -->
  <ModalsDeleteConfirmModal 
    v-if="showDeleteModal"
    :item-type="deleteFieldType"
    :item-name="deleteFieldName"
    :item-id="userProfile?.profile_id || 0"
    :delete-api="`/api/contact-details?field=${deletingField}`"
    @cancel="closeDeleteModal"
    @deleted="handleDeleteSuccess"
  />

  <!-- Override Email Warning Modal -->
  <ModalsOverrideEmailModal
    v-if="showOverrideEmailModal && userProfile"
    :primary-email="userProfile.email"
    :secondary-email="userProfile.secondary_email || ''"
    :is-currently-overridden="userProfile.override_email || false"
    @confirm="confirmOverrideEmail"
    @cancel="closeOverrideEmailModal"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserProfile } from '@/types'

const props = defineProps<{
  userProfile: UserProfile | null
}>()

const emit = defineEmits<{
  (e: 'updated', userProfile: UserProfile): void
  (e: 'fieldDeleted', field: string): void
  (e: 'visibilityToggled', userProfile: UserProfile): void
}>()

const isEditing = ref(false)
const showDeleteModal = ref(false)
const showOverrideEmailModal = ref(false)
const deleteFieldType = ref('')
const deleteFieldName = ref('')
const deletingField = ref('')

const hasContactDetails = computed(() => {
  return props.userProfile && (props.userProfile.phone_number || props.userProfile.secondary_email || props.userProfile.introduction)
})

const contactDetailsData = computed(() => ({
  phone_number: props.userProfile?.phone_number || '',
  secondary_email: props.userProfile?.secondary_email || '',
  introduction: props.userProfile?.introduction || ''
}))

// Create items with hide_on_website property for ActionButtons component
const phoneItem = computed(() => ({
  id: props.userProfile?.profile_id || 0,
  hide_on_website: props.userProfile?.hide_phone_on_website || false
}))

const secondaryEmailItem = computed(() => ({
  id: props.userProfile?.profile_id || 0,
  hide_on_website: props.userProfile?.hide_secondary_email_on_website || false
}))

const introductionItem = computed(() => ({
  id: props.userProfile?.profile_id || 0,
  hide_on_website: props.userProfile?.hide_introduction_on_website || false
}))

const editContactDetails = () => {
  isEditing.value = true
}

const closeEditModal = () => {
  isEditing.value = false
}

const handleContactDetailsUpdated = (updatedProfile: UserProfile) => {
  isEditing.value = false
  emit('updated', updatedProfile)
}

const deleteField = (field: string) => {
  deletingField.value = field
  
  if (field === 'phone') {
    deleteFieldType.value = 'Phone Number'
    deleteFieldName.value = props.userProfile?.phone_number || ''
  } else if (field === 'secondary_email') {
    deleteFieldType.value = 'Secondary Email'
    deleteFieldName.value = props.userProfile?.secondary_email || ''
  } else if (field === 'introduction') {
    deleteFieldType.value = 'Introduction'
    deleteFieldName.value = 'introduction text'
  }
  
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingField.value = ''
}

const handleDeleteSuccess = async () => {
  try {
    const profileId = props.userProfile?.profile_id
    if (!profileId) return

    const field = deletingField.value
    
    // Call API to delete specific field
    // The modal already calls the API, so we just need to emit the event
    showDeleteModal.value = false
    emit('fieldDeleted', field)
  } catch (error) {
    console.error('Error deleting contact detail field:', error)
  }
}

const toggleFieldVisibility = async (field: string) => {
  try {
    const userId = props.userProfile?.user_id
    if (!userId) return

    const response = await $fetch<{ success: boolean; profile: UserProfile }>('/api/contact-details.toggle', {
      method: 'POST',
      body: { userId, field }
    })
    
    if (response.success) {
      emit('visibilityToggled', response.profile)
    }
  } catch (error) {
    console.error('Error toggling contact detail visibility:', error)
  }
}

const openOverrideEmailModal = () => {
  showOverrideEmailModal.value = true
}

const closeOverrideEmailModal = () => {
  showOverrideEmailModal.value = false
}

const confirmOverrideEmail = async () => {
  try {
    const userId = props.userProfile?.user_id
    if (!userId) return

    const response = await $fetch<{ success: boolean; profile: UserProfile }>('/api/override-email.toggle', {
      method: 'POST',
      body: { userId }
    })
    
    if (response.success) {
      showOverrideEmailModal.value = false
      emit('visibilityToggled', response.profile)
    }
  } catch (error) {
    console.error('Error toggling email override:', error)
  }
}
</script>

