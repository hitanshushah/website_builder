import { savePersonalWebsiteUrl } from '../db/websiteUrl'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, personalWebsiteUrl } = body

    if (!userId || !personalWebsiteUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and personal website URL are required'
      })
    }

    const data = await savePersonalWebsiteUrl(userId, personalWebsiteUrl)

    return {
      success: true,
      data
    }
  } catch (err: any) {
    console.error('Error saving personal website URL:', err)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save personal website URL'
    })
  }
})

