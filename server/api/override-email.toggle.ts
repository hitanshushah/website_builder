import { toggleOverrideEmail } from '../db/contactDetails'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const profile = await toggleOverrideEmail(userId)

    return {
      success: true,
      message: 'Email override toggled successfully',
      profile
    }
  } catch (error: any) {
    console.error('Error toggling email override:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle email override'
    })
  }
})

