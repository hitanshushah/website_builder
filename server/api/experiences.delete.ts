import { deleteExperience } from '../db/experiences'

export default defineEventHandler(async (event) => {
  try {
    const experienceId = Number(getQuery(event).id)
    
    if (!experienceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Experience ID is required'
      })
    }

    await deleteExperience(experienceId)

    return {
      success: true,
      message: 'Experience deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting experience:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete experience'
    })
  }
})
