import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, experiences } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Experiences array is required'
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

    // Insert experiences
    const insertQuery = `
      INSERT INTO experiences (
        profile_id, 
        company_name, 
        role, 
        start_date, 
        end_date, 
        description, 
        skills, 
        location,
        company_logo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, company_name, role, start_date, end_date, description, skills, location, company_logo
    `

    const insertedExperiences = []

    for (const experience of experiences) {
      const { company_name, role, start_date, end_date, description, skills, location, company_logo } = experience

      if (!company_name || !role) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Company name and role are required'
        })
      }

      const result = await query<{
        id: number
        company_name: string
        role: string
        start_date: string | null
        end_date: string | null
        description: string | null
        skills: string[]
        location: string | null
        company_logo: string | null
      }>(insertQuery, [
        profileId,
        company_name,
        role,
        start_date,
        end_date,
        description,
        skills || [],
        location,
        company_logo || null
      ])

      insertedExperiences.push(result[0])
    }

    return {
      success: true,
      message: `Successfully added ${insertedExperiences.length} experience(s)`,
      experiences: insertedExperiences
    }
  } catch (error: any) {
    console.error('Error adding experiences:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add experiences'
    })
  }
})
