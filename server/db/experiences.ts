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
      company_logo,
      hide_on_website
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, company_name, role, start_date, end_date, description, skills, location, company_logo, hide_on_website
  `

  const insertedExperiences: Experience[] = []

  for (const experience of experiences) {
    const { company_name, role, start_date, end_date, description, skills, location, company_logo, hide_on_website } = experience

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
      company_logo || null,
      hide_on_website || false
    ])

    insertedExperiences.push(result[0])
  }

  return insertedExperiences
}

export async function updateExperience(experienceId: number, experienceData: Omit<Experience, 'id'>): Promise<Experience> {
  const sql = `
    UPDATE experiences 
    SET company_name = $2, role = $3, start_date = $4, end_date = $5, description = $6, skills = $7, location = $8, company_logo = $9, hide_on_website = $10, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, company_name, role, start_date, end_date, description, skills, location, company_logo, hide_on_website
  `

  const { company_name, role, start_date, end_date, description, skills, location, company_logo, hide_on_website } = experienceData

  const result = await query<Experience>(sql, [
    experienceId,
    company_name,
    role,
    start_date,
    end_date,
    description,
    skills,
    location,
    company_logo,
    hide_on_website
  ])

  if (result.length === 0) {
    throw new Error('Experience not found or already deleted')
  }

  return result[0]
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

export async function toggleHideOnWebsite(experienceId: number): Promise<Experience> {
  const sql = `
    UPDATE experiences 
    SET hide_on_website = NOT hide_on_website, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, company_name, role, start_date, end_date, description, skills, location, company_logo, hide_on_website
  `

  const result = await query<Experience>(sql, [experienceId])

  if (result.length === 0) {
    throw new Error('Experience not found or already deleted')
  }

  return result[0]
}
