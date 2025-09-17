import { EducationModel } from '../db/models'

export default defineEventHandler(async (event) => {
  try {
    const educationId = Number(getQuery(event).id)
    
    if (!educationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Education ID is required'
      })
    }

    // Soft delete by setting deleted_at timestamp
    await EducationModel.delete(educationId)

    return {
      success: true,
      message: 'Education record deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting education:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete education record'
    })
  }
})
