import { toggleHidePhoneOnWebsite, toggleHideSecondaryEmailOnWebsite, toggleHideIntroductionOnWebsite } from '../db/contactDetails'

export default defineEventHandler(async (event) => {
  try {
    const { userId, field } = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!field) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Field is required (phone, secondary_email, or introduction)'
      })
    }

    let profile
    
    if (field === 'phone') {
      profile = await toggleHidePhoneOnWebsite(userId)
    } else if (field === 'secondary_email') {
      profile = await toggleHideSecondaryEmailOnWebsite(userId)
    } else if (field === 'introduction') {
      profile = await toggleHideIntroductionOnWebsite(userId)
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid field. Must be phone, secondary_email, or introduction'
      })
    }

    return {
      success: true,
      message: `${field} visibility toggled successfully`,
      profile
    }
  } catch (error: any) {
    console.error('Error toggling contact detail visibility:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to toggle contact detail visibility'
    })
  }
})

