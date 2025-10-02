import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    // This endpoint is called from the delete modal which passes ID as query param
    const queryParams = getQuery(event)
    const profileId = Number(queryParams.id)
    const field = queryParams.field as string

    if (!profileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Profile ID is required'
      })
    }

    // If field is specified, delete only that field
    if (field) {
      let updateQuery = ''
      if (field === 'phone') {
        updateQuery = 'UPDATE profiles SET phone_number = NULL, updated_at = NOW() WHERE id = $1'
      } else if (field === 'secondary_email') {
        updateQuery = 'UPDATE profiles SET secondary_email = NULL, updated_at = NOW() WHERE id = $1'
      } else if (field === 'introduction') {
        updateQuery = 'UPDATE profiles SET introduction = NULL, updated_at = NOW() WHERE id = $1'
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid field. Must be phone, secondary_email, or introduction'
        })
      }

      await query(updateQuery, [profileId])

      return {
        success: true,
        message: `${field} deleted successfully`
      }
    }

    // If no field specified, delete all contact details
    await query(
      `UPDATE profiles 
       SET phone_number = NULL, secondary_email = NULL, introduction = NULL, updated_at = NOW() 
       WHERE id = $1`,
      [profileId]
    )

    return {
      success: true,
      message: 'Contact details deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting contact details:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete contact details'
    })
  }
})

