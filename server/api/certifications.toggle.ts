import { toggleHideOnWebsite } from '../db/certifications'

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certification ID is required'
      })
    }

    const certification = await toggleHideOnWebsite(id)

    return {
      success: true,
      message: 'Certification visibility toggled successfully',
      certification
    }
  } catch (error: any) {
    console.error('Error toggling certification visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle certification visibility'
    })
  }
})
