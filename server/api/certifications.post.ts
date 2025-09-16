import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, certifications } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!certifications || !Array.isArray(certifications) || certifications.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certifications array is required'
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

    // Insert certifications
    const insertQuery = `
      INSERT INTO certifications (
        profile_id, 
        name, 
        description, 
        start_date, 
        end_date, 
        institute_name, 
        certificate_pdf
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, description, start_date, end_date, institute_name, certificate_pdf
    `

    const insertedCertifications = []

    for (const certification of certifications) {
      const { name, description, start_date, end_date, institute_name, certificate_pdf } = certification

      if (!name || !name.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Certification name is required'
        })
      }

      const result = await query<{
        id: number
        name: string
        description: string | null
        start_date: string | null
        end_date: string | null
        institute_name: string | null
        certificate_pdf: string | null
      }>(insertQuery, [
        profileId,
        name.trim(),
        description?.trim() || null,
        start_date,
        end_date,
        institute_name?.trim() || null,
        certificate_pdf?.trim() || null
      ])

      insertedCertifications.push(result[0])
    }

    return {
      success: true,
      message: `Successfully added ${insertedCertifications.length} certification(s)`,
      certifications: insertedCertifications
    }
  } catch (error: any) {
    console.error('Error adding certifications:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add certifications'
    })
  }
})
