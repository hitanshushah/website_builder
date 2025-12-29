import { getPublicWebsiteData } from '../db/getProjectsBoardData'

export default defineEventHandler(async (event) => {
  try {
    // Get userId from query param
    const userId = Number(getQuery(event).userId)
    
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      })
    }

    const publicWebsiteData = await getPublicWebsiteData(userId)
    
    return publicWebsiteData
  } catch (err) {
    console.error('Error fetching public website data:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch public website data'
    })
  }
})
