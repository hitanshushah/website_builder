import { createPublications } from '../db/publications'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, publications } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!publications || !Array.isArray(publications) || publications.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Publications array is required'
      })
    }

    const insertedPublications = await createPublications(userId, publications)

    return {
      success: true,
      message: `Successfully added ${insertedPublications.length} publication(s)`,
      publications: insertedPublications
    }
  } catch (error: any) {
    console.error('Error adding publications:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to add publications'
    })
  }
})
