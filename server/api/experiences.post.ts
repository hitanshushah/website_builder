import { createExperiences } from '../db/experiences'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, experiences } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Experiences array is required'
      })
    }

    const insertedExperiences = await createExperiences(userId, experiences)

    return {
      success: true,
      message: `Successfully added ${insertedExperiences.length} experience(s)`,
      experiences: insertedExperiences
    }
  } catch (error: any) {
    console.error('Error adding experiences:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to add experiences'
    })
  }
})
