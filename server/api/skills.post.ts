import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { profile_id, name, category_id, proficiency_level, description } = body

    if (!profile_id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Profile ID and skill name are required'
      })
    }

    const sql = `
      INSERT INTO skills (profile_id, name, category_id, proficiency_level, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    const values = [profile_id, name, category_id || null, proficiency_level || 'intermediate', description || null]
    const result = await query(sql, values)

    return {
      success: true,
      data: result[0]
    }
  } catch (error: any) {
    console.error('Error creating skill:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create skill'
    })
  }
})
