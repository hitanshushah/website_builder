import { query } from '../db/db'

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

    // First, get the profile_id for the user
    const profileQuery = `
      SELECT p.id as profile_id 
      FROM profiles p 
      WHERE p.user_id = $1
    `
    const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
    
    if (profileResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found for user'
      })
    }

    const profileId = profileResult[0].profile_id

    // Insert achievements
    const insertQuery = `
      INSERT INTO achievements (
        profile_id, 
        description
      ) VALUES ($1, $2)
      RETURNING id, description
    `

    const insertedAchievements = []

    for (const achievement of achievements) {
      const { description } = achievement

      if (!description || !description.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Description is required'
        })
      }

      const result = await query<{
        id: number
        description: string
      }>(insertQuery, [
        profileId,
        description.trim()
      ])

      insertedAchievements.push(result[0])
    }

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
      statusMessage: 'Failed to add achievements'
    })
  }
})
