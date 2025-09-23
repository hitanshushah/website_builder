import { query } from './db'
import type { Skill } from '../../app/types'

export async function createSkill(skillData: Omit<Skill, 'id'> & { profile_id: number }): Promise<Skill> {
  const { profile_id, name, category_id, proficiency_level, description } = skillData

  if (!profile_id || !name) {
    throw new Error('Profile ID and skill name are required')
  }

  const sql = `
    INSERT INTO skills (profile_id, name, category_id, proficiency_level, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `

  const values = [profile_id, name, category_id || null, proficiency_level || 'intermediate', description || null]
  const result = await query<Skill>(sql, values)

  return result[0]
}

export async function deleteSkill(skillId: number): Promise<void> {
  const sql = `
    DELETE FROM skills 
    WHERE id = $1
    RETURNING *
  `

  const result = await query(sql, [skillId])

  if (result.length === 0) {
    throw new Error('Skill not found')
  }
}
