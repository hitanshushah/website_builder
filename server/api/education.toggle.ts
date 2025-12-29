import { toggleHideOnWebsite } from '../db/education'

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Education ID is required'
      })
    }

    const education = await toggleHideOnWebsite(id)

    return {
      success: true,
      message: 'Education visibility toggled successfully',
      education
    }
  } catch (error: any) {
    console.error('Error toggling education visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle education visibility'
    })
  }
})
