import { toggleShareWebsite } from '../db/websiteUrl'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, shareWebsite } = body

    if (userId === undefined || shareWebsite === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and share website status are required'
      })
    }

    const data = await toggleShareWebsite(userId, shareWebsite)

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('Error toggling share website:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to toggle share website'
    })
  }
})

