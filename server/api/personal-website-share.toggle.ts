import { toggleSharePersonalWebsite } from '../db/websiteUrl'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, sharePersonalWebsite } = body

    if (userId === undefined || sharePersonalWebsite === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and share personal website status are required'
      })
    }

    const data = await toggleSharePersonalWebsite(userId, sharePersonalWebsite)

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('Error toggling share personal website:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to toggle share personal website'
    })
  }
})

