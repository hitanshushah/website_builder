import { toggleHideOnWebsite } from '../db/publications'

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Publication ID is required'
      })
    }

    const publication = await toggleHideOnWebsite(id)

    return {
      success: true,
      message: 'Publication visibility toggled successfully',
      publication
    }
  } catch (error: any) {
    console.error('Error toggling publication visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle publication visibility'
    })
  }
})
