import { getProjectsBoardData } from '../db/getProjectsBoardData'

export default defineEventHandler(async (event) => {
  try {
    // Get userId from query param
    const userId = Number(getQuery(event).userId)
    console.log(userId, 'adsdasd')
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      })
    }

    const projectsBoardData = await getProjectsBoardData(userId)
    return projectsBoardData
  } catch (err) {
    console.error('Error fetching projects board data:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch projects board data'
    })
  }
})
