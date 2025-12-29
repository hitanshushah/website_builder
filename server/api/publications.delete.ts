import { deletePublication } from '../db/publications'

export default defineEventHandler(async (event) => {
  try {
    const publicationId = Number(getQuery(event).id)
    
    if (!publicationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Publication ID is required'
      })
    }

    await deletePublication(publicationId)

    return {
      success: true,
      message: 'Publication deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting publication:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete publication'
    })
  }
})
