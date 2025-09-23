import { query } from './db'
import type { Experience } from '../../app/types'

export async function createExperiences(userId: number, experiences: Omit<Experience, 'id'>[]): Promise<Experience[]> {
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

  const insertedExperiences: Experience[] = []

  for (const experience of experiences) {
    const { company_name, role, start_date, end_date, description, skills, location, company_logo } = experience

    if (!company_name || !role) {
      throw new Error('Company name and role are required')
    }

    const result = await query<Experience>(insertQuery, [
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

  return insertedExperiences
}

export async function deleteExperience(experienceId: number): Promise<void> {
  // Soft delete by setting deleted_at timestamp
  const sql = `
    UPDATE experiences 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `

  const result = await query(sql, [experienceId])

  if (result.length === 0) {
    throw new Error('Experience not found or already deleted')
  }
}
