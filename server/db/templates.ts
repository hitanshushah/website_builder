import { query } from './db'

export interface Template {
  id: number
  name: string
  identifier: string
  description: string | null
  is_active: boolean
  is_premium: boolean
  is_default: boolean
  thumbnail: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function getActiveTemplates(): Promise<Template[]> {
  const sql = `
    SELECT 
      t.id,
      t.name,
      tk.file_name AS identifier,  -- use file_name as identifier
      t.description,
      t.is_active,
      t.is_premium,
      t.is_default,
      t.thumbnail,
      t.created_at,
      t.updated_at,
      t.deleted_at
    FROM templates t
    LEFT JOIN template_keys tk ON tk.key = t.identifier
    WHERE deleted_at IS NULL 
    AND is_active = TRUE
    ORDER BY is_default DESC, created_at DESC
  `
  
  const result = await query<Template>(sql)
  return result
}
