import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { user_id, name } = body

    if (!user_id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and category name are required'
      })
    }

    const sql = `
      INSERT INTO skill_categories (user_id, name)
      VALUES ($1, $2)
      ON CONFLICT (user_id, name) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    const values = [user_id, name.trim()]
    const result = await query(sql, values)

    return {
      success: true,
      data: result[0]
    }
  } catch (error: any) {
    console.error('Error creating category:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create category'
    })
  }
})
