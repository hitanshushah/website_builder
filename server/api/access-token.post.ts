import { generateAccessToken } from '../db/accessToken'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const data = await generateAccessToken(userId)

    return {
      success: true,
      data
    }
  } catch (err: any) {
    console.error('Error generating access token:', err)
    
    if (err.message === 'Access token already exists for this user') {
      throw createError({
        statusCode: 409,
        statusMessage: err.message
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to generate access token'
    })
  }
})

