import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const publicationId = Number(getQuery(event).id)
    
    if (!publicationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Publication ID is required'
      })
    }

    // Soft delete by setting deleted_at timestamp
    const sql = `
      UPDATE publications 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `

    const result = await query(sql, [publicationId])

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Publication not found or already deleted'
      })
    }

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
