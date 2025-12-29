import { toggleHideOnWebsite } from '../db/experiences'

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Experience ID is required'
      })
    }

    const experience = await toggleHideOnWebsite(id)

    return {
      success: true,
      message: 'Experience visibility toggled successfully',
      experience
    }
  } catch (error: any) {
    console.error('Error toggling experience visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle experience visibility'
    })
  }
})
