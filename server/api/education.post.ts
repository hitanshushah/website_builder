import { EducationModel } from '../db/models'
import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      userId, 
      university_name, 
      degree, 
      from_date, 
      end_date, 
      location, 
      cgpa 
    } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!university_name || !degree) {
      throw createError({
        statusCode: 400,
        statusMessage: 'University name and degree are required'
      })
    }

    // First, get the profile_id for the user
    const profileQuery = `
      SELECT p.id as profile_id 
      FROM profiles p 
      WHERE p.user_id = $1
    `
    const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
    
    if (profileResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found for user'
      })
    }

    const profileId = profileResult[0].profile_id

    // Create education record
    const education = await EducationModel.create(
      profileId,
      university_name,
      degree,
      from_date,
      end_date,
      location,
      cgpa
    )

    return {
      success: true,
      message: 'Education record added successfully',
      education
    }
  } catch (error: any) {
    console.error('Error adding education:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add education record'
    })
  }
})
