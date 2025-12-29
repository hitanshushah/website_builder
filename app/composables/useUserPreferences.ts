import { useUserStore } from '../../stores/user'
import { useTemplatesStore } from '../../stores/templates'
import { useColorsStore } from '../../stores/colors'

export const useUserPreferences = () => {
  const userStore = useUserStore()
  const templatesStore = useTemplatesStore()
  const colorsStore = useColorsStore()

  const savePreferences = async () => {
    if (!userStore.user?.id) {
      throw new Error('User must be logged in to save preferences')
    }

    if (!templatesStore.selectedTemplate) {
      throw new Error('No template selected')
    }

    if (!colorsStore.selectedColorScheme) {
      throw new Error('No color scheme selected')
    }

    try {
      const response = await $fetch('/api/user-preferences', {
        method: 'POST',
        body: {
          user_id: userStore.user.id,
          template_id: templatesStore.selectedTemplate.id,
          color_id: colorsStore.selectedColorScheme.id
        }
      })

      return response
    } catch (error) {
      console.error('Error saving user preferences:', error)
      throw error
    }
  }

  const loadUserPreferences = async () => {
    if (!userStore.user?.id) {
      return null
    }

    try {
      const response = await $fetch('/api/user-preferences', {
        query: {
          userId: userStore.user.id
        }
      })
      return response
    } catch (error) {
      console.error('Error loading user preferences:', error)
      return null
    }
  }

  return {
    savePreferences,
    loadUserPreferences
  }
}
