import { deleteCertification } from '../db/certifications'

export default defineEventHandler(async (event) => {
  try {
    const certificationId = Number(getQuery(event).id)
    
    if (!certificationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certification ID is required'
      })
    }

    await deleteCertification(certificationId)

    return {
      success: true,
      message: 'Certification deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting certification:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete certification'
    })
  }
})
