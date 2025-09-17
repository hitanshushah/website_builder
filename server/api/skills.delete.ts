import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const skillId = Number(getQuery(event).id)
    
    if (!skillId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Skill ID is required'
      })
    }

    const sql = `
      DELETE FROM skills 
      WHERE id = $1
      RETURNING *
    `

    const result = await query(sql, [skillId])

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Skill not found'
      })
    }

    return {
      success: true,
      message: 'Skill deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting skill:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete skill'
    })
  }
})
