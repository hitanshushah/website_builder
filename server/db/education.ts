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
      cgpa,
      hide_on_website
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, university_name, degree, from_date, end_date, location, cgpa, hide_on_website
  `

  const { university_name, degree, from_date, end_date, location, cgpa, hide_on_website } = educationData

  const result = await query<Education>(insertQuery, [
    profileId,
    university_name,
    degree,
    from_date,
    end_date,
    location,
    cgpa,
    hide_on_website || false
  ])

  return result[0]
}

export async function updateEducation(educationId: number, educationData: Omit<Education, 'id'>): Promise<Education> {
  const sql = `
    UPDATE education 
    SET university_name = $2, degree = $3, from_date = $4, end_date = $5, location = $6, cgpa = $7, hide_on_website = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, university_name, degree, from_date, end_date, location, cgpa, hide_on_website
  `

  const { university_name, degree, from_date, end_date, location, cgpa, hide_on_website } = educationData

  const result = await query<Education>(sql, [
    educationId,
    university_name,
    degree,
    from_date,
    end_date,
    location,
    cgpa,
    hide_on_website
  ])

  if (result.length === 0) {
    throw new Error('Education record not found or already deleted')
  }

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

export async function toggleHideOnWebsite(educationId: number): Promise<Education> {
  const sql = `
    UPDATE education 
    SET hide_on_website = NOT COALESCE(hide_on_website, false), updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, university_name, degree, from_date, end_date, location, cgpa, hide_on_website
  `

  const result = await query<Education>(sql, [educationId])

  if (result.length === 0) {
    throw new Error('Education record not found or already deleted')
  }

  return result[0]
}
