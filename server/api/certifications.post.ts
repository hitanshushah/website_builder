import { createCertifications } from '../db/certifications'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, certifications } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!certifications || !Array.isArray(certifications) || certifications.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certifications array is required'
      })
    }

    const insertedCertifications = await createCertifications(userId, certifications)

    return {
      success: true,
      message: `Successfully added ${insertedCertifications.length} certification(s)`,
      certifications: insertedCertifications
    }
  } catch (error: any) {
    console.error('Error adding certifications:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to add certifications'
    })
  }
})
