import { query } from './db'
import type { Color } from '../../app/types'

export async function getColors(userId?: number): Promise<Color[]> {
  let sql = `
    SELECT *
    FROM colors 
    WHERE deleted_at IS NULL 
    AND is_active = true
    AND (user_id IS NULL OR user_id = $1)
    ORDER BY is_default DESC, name ASC
  `
  
  return await query<Color>(sql, userId ? [userId] : [])
}

export async function checkColorKeyExists(key: string): Promise<boolean> {
  const sql = `
    SELECT EXISTS(
      SELECT 1 FROM colors WHERE key = $1 AND deleted_at IS NULL
    ) as exists
  `
  const result = await query<{ exists: boolean }>(sql, [key])
  return result[0]?.exists || false
}

export async function createCustomColor(data: {
  key: string
  name: string
  primary_color: string
  secondary_color: string
  background_color: string
  fourth_color?: string
  user_id: number
}): Promise<Color> {
  const sql = `
    INSERT INTO colors (
      key, name, primary_color, secondary_color, 
      background_color, fourth_color, user_id, 
      is_active, is_default
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, true, false
    )
    RETURNING *
  `
  
  const result = await query<Color>(sql, [
    data.key,
    data.name,
    data.primary_color,
    data.secondary_color,
    data.background_color,
    data.fourth_color || null,
    data.user_id
  ])
  
  return result[0]
}

export async function getDefaultColorId(): Promise<number> {
  const sql = `
    SELECT id FROM colors 
    WHERE is_default = true 
    AND deleted_at IS NULL 
    LIMIT 1
  `
  const result = await query<{ id: number }>(sql, [])
  if (!result.length) {
    throw new Error('No default color scheme found')
  }
  return result[0].id
}

export async function softDeleteColor(colorId: number): Promise<void> {
  const sql = `
    UPDATE colors 
    SET deleted_at = NOW(), updated_at = NOW() 
    WHERE id = $1
  `
  await query(sql, [colorId])
}

export async function updateUserTemplatesWithDefaultColor(colorId: number): Promise<void> {
  const defaultColorId = await getDefaultColorId()
  
  const sql = `
    UPDATE user_templates 
    SET color_id = $1, updated_at = NOW() 
    WHERE color_id = $2 AND deleted_at IS NULL
  `
  await query(sql, [defaultColorId, colorId])
}
