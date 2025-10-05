import { getUserPreferences } from '../db/userPreferences'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId ? parseInt(query.userId as string) : null

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const preferences = await getUserPreferences(userId)

    return {
      success: true,
      data: preferences
    }
  } catch (error: any) {
    console.error('Error fetching user preferences:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch user preferences'
    })
  }
})
