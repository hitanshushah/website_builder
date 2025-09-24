import { toggleHideOnWebsite } from '../db/projects'

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Project ID is required'
      })
    }

    const project = await toggleHideOnWebsite(id)

    return {
      success: true,
      message: 'Project visibility toggled successfully',
      project
    }
  } catch (error: any) {
    console.error('Error toggling project visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle project visibility'
    })
  }
})
