import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = Number(getQuery(event).userId)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const sql = `
      SELECT id, name, user_id
      FROM skill_categories
      WHERE user_id = $1
      ORDER BY name ASC
    `

    const result = await query(sql, [userId])

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch categories'
    })
  }
})
