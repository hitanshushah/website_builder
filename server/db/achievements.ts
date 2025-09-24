import { query } from './db'
import type { Achievement } from '../../app/types'

export async function createAchievements(userId: number, achievements: Omit<Achievement, 'id'>[]): Promise<Achievement[]> {
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

  // Insert achievements
  const insertQuery = `
    INSERT INTO achievements (
      profile_id, 
      description,
      hide_on_website
    ) VALUES ($1, $2, $3)
    RETURNING id, description, hide_on_website
  `

  const insertedAchievements: Achievement[] = []

  for (const achievement of achievements) {
    const { description, hide_on_website } = achievement

    if (!description || !description.trim()) {
      throw new Error('Description is required')
    }

    const result = await query<Achievement>(insertQuery, [
      profileId,
      description.trim(),
      hide_on_website || false
    ])

    insertedAchievements.push(result[0])
  }

  return insertedAchievements
}

export async function updateAchievement(achievementId: number, achievementData: Omit<Achievement, 'id'>): Promise<Achievement> {
  const sql = `
    UPDATE achievements 
    SET description = $2, hide_on_website = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, description, hide_on_website
  `

  const { description, hide_on_website } = achievementData

  const result = await query<Achievement>(sql, [achievementId, description, hide_on_website])

  if (result.length === 0) {
    throw new Error('Achievement not found or already deleted')
  }

  return result[0]
}

export async function deleteAchievement(achievementId: number): Promise<void> {
  // Soft delete by setting deleted_at timestamp
  const sql = `
    UPDATE achievements 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `

  const result = await query(sql, [achievementId])

  if (result.length === 0) {
    throw new Error('Achievement not found or already deleted')
  }
}

export async function toggleHideOnWebsite(achievementId: number): Promise<Achievement> {
  const sql = `
    UPDATE achievements 
    SET hide_on_website = NOT hide_on_website, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, description, hide_on_website
  `

  const result = await query<Achievement>(sql, [achievementId])

  if (result.length === 0) {
    throw new Error('Achievement not found or already deleted')
  }

  return result[0]
}
