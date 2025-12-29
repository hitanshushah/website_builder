import { deleteAchievement } from '../db/achievements'

export default defineEventHandler(async (event) => {
  try {
    const achievementId = Number(getQuery(event).id)
    
    if (!achievementId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Achievement ID is required'
      })
    }

    await deleteAchievement(achievementId)

    return {
      success: true,
      message: 'Achievement deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting achievement:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete achievement'
    })
  }
})
