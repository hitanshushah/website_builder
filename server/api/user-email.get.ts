import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = getQuery(event).userId

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Fetch user email based on override_email logic
    const sql = `
      SELECT 
        u.email as user_email,
        p.override_email,
        p.secondary_email
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
    `

    const result = await query(sql, [userId])

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const user = result[0]
    let emailToReturn = null

    // Check override_email logic
    if (user.override_email && user.secondary_email) {
      // If override_email is true and secondary_email exists, use secondary_email
      emailToReturn = user.secondary_email
    } else if (user.override_email && !user.secondary_email) {
      // If override_email is true and secondary_email does not exist, use email from users table
      emailToReturn = user.user_email
    }
    else if (!user.override_email) {
      // If override_email is false, use email from users table
      emailToReturn = user.user_email
    }

    return {
      success: true,
      email: emailToReturn,
      override_email: user.override_email,
      has_secondary_email: !!user.secondary_email,
      user_email: user.user_email,
      secondary_email: user.secondary_email
    }
  } catch (error: any) {
    console.error('Error fetching user email:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch user email'
    })
  }
})
