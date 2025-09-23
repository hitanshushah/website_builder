import { deleteEducation } from '../db/education'

export default defineEventHandler(async (event) => {
  try {
    const educationId = Number(getQuery(event).id)
    
    if (!educationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Education ID is required'
      })
    }

    await deleteEducation(educationId)

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
