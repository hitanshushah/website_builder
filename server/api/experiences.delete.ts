import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const experienceId = Number(getQuery(event).id)
    
    if (!experienceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Experience ID is required'
      })
    }

    // Soft delete by setting deleted_at timestamp
    const sql = `
      UPDATE experiences 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `

    const result = await query(sql, [experienceId])

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Experience not found or already deleted'
      })
    }

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
