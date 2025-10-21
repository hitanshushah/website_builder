import { savePersonalWebsiteUrl } from '../db/websiteUrl'
import { validateProPlan } from '../utils/planValidation'
import { getBaseDomain } from '../utils/domainUtils'

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

    const userIdInt = parseInt(userId)

    // Validate Pro plan for personal website URL
    const planValidation = await validateProPlan(userIdInt)
    if (!planValidation.isValid) {
      throw createError({
        statusCode: 403,
        statusMessage: planValidation.message || 'Personal website URLs require a Pro plan'
      })
    }
    const baseDomain = getBaseDomain(personalWebsiteUrl)
    const data = await savePersonalWebsiteUrl(userIdInt, baseDomain)

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

