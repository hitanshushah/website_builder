import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const achievementId = Number(getQuery(event).id)
    
    if (!achievementId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Achievement ID is required'
      })
    }

    // Soft delete by setting deleted_at timestamp
    const sql = `
      UPDATE achievements 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `

    const result = await query(sql, [achievementId])

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Achievement not found or already deleted'
      })
    }

    return {
      success: true,
      message: 'Achievement deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting achievement:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete achievement'
    })
  }
})
