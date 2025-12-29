import { getColors } from '../db/colors'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId ? parseInt(query.userId as string) : undefined

    const colors = await getColors(userId)

    return {
      success: true,
      data: colors
    }
  } catch (error: any) {
    console.error('Error fetching colors:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch colors'
    })
  }
})
