import { createAchievements } from '../db/achievements'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, achievements } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!achievements || !Array.isArray(achievements) || achievements.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Achievements array is required'
      })
    }

    const insertedAchievements = await createAchievements(userId, achievements)

    return {
      success: true,
      message: `Successfully added ${insertedAchievements.length} achievement(s)`,
      achievements: insertedAchievements
    }
  } catch (error: any) {
    console.error('Error adding achievements:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to add achievements'
    })
  }
})
