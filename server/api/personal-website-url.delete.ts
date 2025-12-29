import { deletePersonalWebsiteUrl } from '../db/websiteUrl'
import { validateProPlan } from '../utils/planValidation'

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

    const userIdInt = parseInt(userId as string)

    // Validate Pro plan for personal website URL deletion
    const planValidation = await validateProPlan(userIdInt)
    if (!planValidation.isValid) {
      throw createError({
        statusCode: 403,
        statusMessage: planValidation.message || 'Personal website URL management requires a Pro plan'
      })
    }

    const data = await deletePersonalWebsiteUrl(userIdInt)

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('Error deleting personal website URL:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete personal website URL'
    })
  }
})

