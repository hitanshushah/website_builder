import { saveWebsiteUrl } from '../db/websiteUrl'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, websiteUrl } = body

    if (!userId || !websiteUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and website URL are required'
      })
    }

    const data = await saveWebsiteUrl(userId, websiteUrl)

    return {
      success: true,
      data
    }
  } catch (err: any) {
    console.error('Error saving website URL:', err)
    
    if (err.message === 'This website URL is already taken') {
      throw createError({
        statusCode: 409,
        statusMessage: err.message
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save website URL'
    })
  }
})
