import { toggleHideOnWebsite } from '../db/skills'

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Skill ID is required'
      })
    }

    const skill = await toggleHideOnWebsite(id)

    return {
      success: true,
      message: 'Skill visibility toggled successfully',
      skill
    }
  } catch (error: any) {
    console.error('Error toggling skill visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle skill visibility'
    })
  }
})
