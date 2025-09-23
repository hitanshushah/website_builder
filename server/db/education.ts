import { query } from './db'
import type { Education } from '../../app/types'

export async function createEducation(userId: number, educationData: Omit<Education, 'id'>): Promise<Education> {
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

  // Create education record
  const insertQuery = `
    INSERT INTO education (
      profile_id,
      university_name,
      degree,
      from_date,
      end_date,
      location,
      cgpa
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, university_name, degree, from_date, end_date, location, cgpa
  `

  const { university_name, degree, from_date, end_date, location, cgpa } = educationData

  const result = await query<Education>(insertQuery, [
    profileId,
    university_name,
    degree,
    from_date,
    end_date,
    location,
    cgpa
  ])

  return result[0]
}

export async function deleteEducation(educationId: number): Promise<void> {
  // Soft delete by setting deleted_at timestamp
  const sql = `
    UPDATE education 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `

  const result = await query(sql, [educationId])

  if (result.length === 0) {
    throw new Error('Education record not found or already deleted')
  }
}
