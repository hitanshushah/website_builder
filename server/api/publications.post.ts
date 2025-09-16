import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, publications } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!publications || !Array.isArray(publications) || publications.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Publications array is required'
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

    // Insert publications
    const insertQuery = `
      INSERT INTO publications (
        profile_id, 
        paper_name, 
        conference_name, 
        description, 
        published_date, 
        paper_pdf, 
        paper_link
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, paper_name, conference_name, description, published_date, paper_pdf, paper_link
    `

    const insertedPublications = []

    for (const publication of publications) {
      const { paper_name, conference_name, description, published_date, paper_pdf, paper_link } = publication

      if (!paper_name || !paper_name.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Paper name is required'
        })
      }

      const result = await query<{
        id: number
        paper_name: string
        conference_name: string | null
        description: string | null
        published_date: string | null
        paper_pdf: string | null
        paper_link: string | null
      }>(insertQuery, [
        profileId,
        paper_name.trim(),
        conference_name?.trim() || null,
        description?.trim() || null,
        published_date,
        paper_pdf?.trim() || null,
        paper_link?.trim() || null
      ])

      insertedPublications.push(result[0])
    }

    return {
      success: true,
      message: `Successfully added ${insertedPublications.length} publication(s)`,
      publications: insertedPublications
    }
  } catch (error: any) {
    console.error('Error adding publications:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add publications'
    })
  }
})
