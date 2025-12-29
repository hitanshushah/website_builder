import { updateContactDetails } from '../db/contactDetails'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, phone_number, secondary_email, introduction } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const profile = await updateContactDetails(userId, {
      phone_number: phone_number || null,
      secondary_email: secondary_email || null,
      introduction: introduction || null
    })

    return {
      success: true,
      message: 'Contact details saved successfully',
      profile
    }
  } catch (error: any) {
    console.error('Error saving contact details:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to save contact details'
    })
  }
})

