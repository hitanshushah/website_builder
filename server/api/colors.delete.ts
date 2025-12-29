import { softDeleteColor, updateUserTemplatesWithDefaultColor } from '../db/colors'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const colorId = query.id

    if (!colorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Color ID is required'
      })
    }

    const id = parseInt(colorId as string)

    await softDeleteColor(id)
    
    await updateUserTemplatesWithDefaultColor(id)

    return {
      success: true,
      message: 'Color scheme deleted successfully and users updated to default'
    }
  } catch (error: any) {
    console.error('Error deleting color scheme:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete color scheme'
    })
  }
})

