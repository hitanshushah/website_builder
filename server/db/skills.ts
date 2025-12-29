import { query } from './db'
import type { Skill } from '../../app/types'

export async function createSkill(skillData: Omit<Skill, 'id'> & { profile_id: number }): Promise<Skill> {
  const { profile_id, name, category_id, proficiency_level, description } = skillData

  if (!profile_id || !name) {
    throw new Error('Profile ID and skill name are required')
  }

  const sql = `
    INSERT INTO skills (profile_id, name, category_id, proficiency_level, description, hide_on_website)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, category_id, proficiency_level, description, hide_on_website
  `

  const values = [profile_id, name, category_id || null, proficiency_level || 'intermediate', description || null, skillData.hide_on_website || false]
  const result = await query<any>(sql, values)

  const skill = result[0]

  // Fetch the category information if category_id exists
  if (skill.category_id) {
    const categoryQuery = `
      SELECT id, name, user_id
      FROM skill_categories
      WHERE id = $1
    `
    const categoryResult = await query<any>(categoryQuery, [skill.category_id])
    if (categoryResult.length > 0) {
      skill.category = categoryResult[0]
    }
  }

  return skill
}

export async function updateSkill(skillId: number, skillData: Omit<Skill, 'id'>): Promise<Skill> {
  const sql = `
    UPDATE skills 
    SET name = $2, category_id = $3, proficiency_level = $4, description = $5, hide_on_website = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, name, category_id, proficiency_level, description, hide_on_website
  `

  const { name, category_id, proficiency_level, description, hide_on_website } = skillData

  const result = await query<any>(sql, [
    skillId,
    name,
    category_id,
    proficiency_level,
    description,
    hide_on_website
  ])

  if (result.length === 0) {
    throw new Error('Skill not found')
  }

  const skill = result[0]

  // Fetch the category information if category_id exists
  if (skill.category_id) {
    const categoryQuery = `
      SELECT id, name, user_id
      FROM skill_categories
      WHERE id = $1
    `
    const categoryResult = await query<any>(categoryQuery, [skill.category_id])
    if (categoryResult.length > 0) {
      skill.category = categoryResult[0]
    }
  }

  return skill
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

export async function toggleHideOnWebsite(skillId: number): Promise<Skill> {
  const sql = `
    UPDATE skills 
    SET hide_on_website = NOT COALESCE(hide_on_website, false), updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, name, category_id, proficiency_level, description, hide_on_website
  `

  const result = await query<any>(sql, [skillId])

  if (result.length === 0) {
    throw new Error('Skill not found')
  }

  // Fetch the category information if category_id exists
  const skill = result[0]
  if (skill.category_id) {
    const categoryQuery = `
      SELECT id, name, user_id
      FROM skill_categories
      WHERE id = $1
    `
    const categoryResult = await query<any>(categoryQuery, [skill.category_id])
    if (categoryResult.length > 0) {
      skill.category = categoryResult[0]
    }
  }

  return skill
}
