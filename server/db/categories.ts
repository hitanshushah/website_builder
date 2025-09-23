import { query } from './db'

// Define the skill category interface locally since there are two Category interfaces
export interface SkillCategory {
  id: number
  name: string
  user_id: number
}

export async function createCategory(categoryData: Omit<SkillCategory, 'id'>): Promise<SkillCategory> {
  const { name, user_id } = categoryData

  if (!name || !user_id) {
    throw new Error('Name and user_id are required')
  }

  const sql = `
    INSERT INTO skill_categories (user_id, name)
    VALUES ($1, $2)
    ON CONFLICT (user_id, name) DO UPDATE SET
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `

  const result = await query<SkillCategory>(sql, [user_id, name])
  return result[0]
}

export async function deleteCategory(categoryId: number): Promise<void> {
  // First, update all skills in this category to have no category (set category_id to null)
  const updateSkillsSql = `
    UPDATE skills 
    SET category_id = NULL 
    WHERE category_id = $1
  `
  await query(updateSkillsSql, [categoryId])

  // Then delete the category
  const deleteCategorySql = `
    DELETE FROM skill_categories 
    WHERE id = $1
    RETURNING *
  `

  const result = await query(deleteCategorySql, [categoryId])

  if (result.length === 0) {
    throw new Error('Category not found')
  }
}

export async function getCategories(userId: number): Promise<SkillCategory[]> {
  const sql = `
    SELECT id, name, user_id
    FROM skill_categories
    WHERE user_id = $1
    ORDER BY name ASC
  `

  const result = await query<SkillCategory>(sql, [userId])
  return result
}
