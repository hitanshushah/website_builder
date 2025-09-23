import { query } from './db'
import type { Publication } from '../../app/types'

export async function createPublications(userId: number, publications: Omit<Publication, 'id'>[]): Promise<Publication[]> {
  // First, get the profile_id for the user
  const profileQuery = `
    SELECT p.id as profile_id 
    FROM profiles p 
    WHERE p.user_id = $1
  `
  const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
  
  if (profileResult.length === 0) {
    throw new Error('Profile not found for user')
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

  const insertedPublications: Publication[] = []

  for (const publication of publications) {
    const { paper_name, conference_name, description, published_date, paper_pdf, paper_link } = publication

    if (!paper_name || !paper_name.trim()) {
      throw new Error('Paper name is required')
    }

    const result = await query<Publication>(insertQuery, [
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

  return insertedPublications
}

export async function deletePublication(publicationId: number): Promise<void> {
  // Soft delete by setting deleted_at timestamp
  const sql = `
    UPDATE publications 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `

  const result = await query(sql, [publicationId])

  if (result.length === 0) {
    throw new Error('Publication not found or already deleted')
  }
}
