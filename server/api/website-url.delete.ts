import { deleteWebsiteUrl } from '../db/websiteUrl'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId || query.id

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const data = await deleteWebsiteUrl(parseInt(userId as string))

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('Error deleting website URL:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete website URL'
    })
  }
})

