import { ref } from 'vue'

export interface ContactFormData {
  name: string
  email: string
  subject?: string
  message?: string
}

export const useContactForm = () => {
  const isSubmitting = ref(false)
  const errors = ref<Record<string, string>>({})

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
    console.log('📧 Contact form submission:', {
      timestamp: new Date().toISOString(),
      formData: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'No subject',
        message: formData.message || 'No message'
      }
    })

    // Validate form
    if (!validateForm(formData)) {
      console.error('❌ Form validation failed:', errors.value)
      return false
    }

    isSubmitting.value = true

    try {
      // Simulate API call or email sending
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('✅ Message sent successfully:', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      })

      // Clear errors on success
      errors.value = {}
      return true
    } catch (error) {
      console.error('❌ Error sending message:', error)
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
    resetForm
  }
}
