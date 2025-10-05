import { saveUserPreferences } from '../db/userPreferences'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { user_id, template_id, color_id } = body

    if (!user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!template_id || !color_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Template ID and Color ID are required'
      })
    }

    const result = await saveUserPreferences({
      user_id: parseInt(user_id),
      template_id: parseInt(template_id),
      color_id: parseInt(color_id)
    })

    return {
      success: true,
      message: 'User preferences saved successfully',
      data: result
    }
  } catch (error: any) {
    console.error('Error saving user preferences:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to save user preferences'
    })
  }
})
