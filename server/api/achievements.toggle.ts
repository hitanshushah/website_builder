import { toggleHideOnWebsite } from '../db/achievements'

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Achievement ID is required'
      })
    }

    const achievement = await toggleHideOnWebsite(id)

    return {
      success: true,
      message: 'Achievement visibility toggled successfully',
      achievement
    }
  } catch (error: any) {
    console.error('Error toggling achievement visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle achievement visibility'
    })
  }
})
