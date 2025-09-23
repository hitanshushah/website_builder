import { query } from './db'
import type { Certification } from '../../app/types'

export async function createCertifications(userId: number, certifications: Omit<Certification, 'id'>[]): Promise<Certification[]> {
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

  const insertedCertifications: Certification[] = []

  for (const certification of certifications) {
    const { name, description, start_date, end_date, institute_name, certificate_pdf } = certification

    if (!name || !name.trim()) {
      throw new Error('Certification name is required')
    }

    const result = await query<Certification>(insertQuery, [
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

  return insertedCertifications
}

export async function updateCertification(certificationId: number, certificationData: Omit<Certification, 'id'>): Promise<Certification> {
  const sql = `
    UPDATE certifications 
    SET name = $2, description = $3, start_date = $4, end_date = $5, institute_name = $6, certificate_pdf = $7, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, name, description, start_date, end_date, institute_name, certificate_pdf
  `

  const { name, description, start_date, end_date, institute_name, certificate_pdf } = certificationData

  const result = await query<Certification>(sql, [
    certificationId,
    name,
    description,
    start_date,
    end_date,
    institute_name,
    certificate_pdf
  ])

  if (result.length === 0) {
    throw new Error('Certification not found or already deleted')
  }

  return result[0]
}

export async function deleteCertification(certificationId: number): Promise<void> {
  // Soft delete by setting deleted_at timestamp
  const sql = `
    UPDATE certifications 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `

  const result = await query(sql, [certificationId])

  if (result.length === 0) {
    throw new Error('Certification not found or already deleted')
  }
}
