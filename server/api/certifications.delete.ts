import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const certificationId = Number(getQuery(event).id)
    
    if (!certificationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certification ID is required'
      })
    }

    // Soft delete by setting deleted_at timestamp
    const sql = `
      UPDATE certifications 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `

    const result = await query(sql, [certificationId])

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Certification not found or already deleted'
      })
    }

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
