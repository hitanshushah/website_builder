import { ref } from 'vue'

export interface ContactFormData {
  name: string
  email: string
  subject?: string
  message?: string
  userId?: number
  userEmail?: string
}

export const useContactForm = () => {
  const isSubmitting = ref(false)
  const errors = ref<Record<string, string>>({})
  
  // Fetch user email based on override_email logic
  const fetchUserEmail = async (userId: number): Promise<string | null> => {
    try {
      const response = await $fetch<{
        success: boolean
        email: string | null
        override_email: boolean | null
        has_secondary_email: boolean
      }>('/api/user-email', {
        query: { userId }
      })

      if (response.success) {
        return response.email
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // Validation function
  const validateForm = (data: ContactFormData): boolean => {
    errors.value = {}
    let isValid = true

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.value.name = 'Name is required'
      isValid = false
    } else if (data.name.trim().length < 2) {
      errors.value.name = 'Name must be at least 2 characters'
      isValid = false
    }

    // Email validation
    if (!data.email || data.email.trim().length === 0) {
      errors.value.email = 'Email is required'
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        errors.value.email = 'Please enter a valid email address'
        isValid = false
      }
    }

    return isValid
  }

  // Send message function
  const sendMessage = async (formData: ContactFormData): Promise<boolean> => {
    // Validate form
    if (!validateForm(formData)) {
      return false
    }

    isSubmitting.value = true

    try {
      // Send email via API endpoint
      const result = await $fetch('/api/send-contact-email', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          userId: formData.userId
        }
      })

      // Clear errors on success
      errors.value = {}
      return true
    } catch (error) {
      errors.value.general = 'Failed to send message. Please try again.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // Reset form function
  const resetForm = () => {
    errors.value = {}
    isSubmitting.value = false
  }

  return {
    isSubmitting,
    errors,
    sendMessage,
    validateForm,
    resetForm,
    fetchUserEmail
  }
}
