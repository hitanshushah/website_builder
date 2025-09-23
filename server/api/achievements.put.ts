import { updateAchievement } from '../db/achievements'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, description } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Achievement ID is required'
      })
    }

    if (!description || !description.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Achievement description is required'
      })
    }

    const updatedAchievement = await updateAchievement(id, description.trim())

    return {
      success: true,
      message: 'Achievement updated successfully',
      achievement: updatedAchievement
    }
  } catch (error: any) {
    console.error('Error updating achievement:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update achievement'
    })
  }
})
