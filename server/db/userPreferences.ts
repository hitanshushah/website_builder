import { query } from './db'

export interface UserPreferences {
  user_id: number
  template_id: number
  color_id: number
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<any> {
  const { user_id, template_id, color_id } = preferences

  // Check if user preferences already exist
  const existingQuery = `
    SELECT id FROM user_templates 
    WHERE user_id = $1 AND is_active = true AND deleted_at IS NULL
  `
  
  const existing = await query(existingQuery, [user_id])
  
  if (existing.length > 0) {
    // Update existing record
    const updateQuery = `
      UPDATE user_templates 
      SET template_id = $2, color_id = $3, updated_at = NOW()
      WHERE user_id = $1 AND is_active = true AND deleted_at IS NULL
      RETURNING id, user_id, template_id, color_id, is_active, created_at, updated_at
    `
    
    const result = await query(updateQuery, [user_id, template_id, color_id])
    return result[0]
  } else {
    // Insert new record
    const insertQuery = `
      INSERT INTO user_templates (user_id, template_id, color_id, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, true, NOW(), NOW())
      RETURNING id, user_id, template_id, color_id, is_active, created_at, updated_at
    `
    
    const result = await query(insertQuery, [user_id, template_id, color_id])
    return result[0]
  }
}

export async function getUserPreferences(userId: number): Promise<any> {
  const queryString = `
       SELECT ut.*, t.name as template_name, tk.file_name as template_identifier, 
           c.name as color_name, c.key as color_key
    FROM user_templates ut
    JOIN templates t ON ut.template_id = t.id
    JOIN colors c ON ut.color_id = c.id
    JOIN template_keys tk ON tk.key = t.identifier
    WHERE ut.user_id = $1 AND ut.is_active = true AND ut.deleted_at IS NULL
  `
  
  const result = await query(queryString, [userId])
  return result.length > 0 ? result[0] : null
}

export async function ensureUserTemplateExists(userId: number): Promise<void> {
  const existingQuery = `
    SELECT id FROM user_templates 
    WHERE user_id = $1 AND is_active = true AND deleted_at IS NULL
  `
  
  const existing = await query(existingQuery, [userId])
  
  if (existing.length > 0) {
    return
  }
  
  const { getDefaultTemplateId } = await import('./templates')
  const { getDefaultColorId } = await import('./colors')
  
  const defaultTemplateId = await getDefaultTemplateId()
  const defaultColorId = await getDefaultColorId()
  
  const insertQuery = `
    INSERT INTO user_templates (user_id, template_id, color_id, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, true, NOW(), NOW())
  `
  
  await query(insertQuery, [userId, defaultTemplateId, defaultColorId])
}
