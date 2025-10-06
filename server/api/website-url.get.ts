import { getWebsiteUrl } from '../db/websiteUrl'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = getQuery(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const data = await getWebsiteUrl(parseInt(userId as string))

    return data
  } catch (err) {
    console.error('Error fetching website URL:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch website URL'
    })
  }
})

