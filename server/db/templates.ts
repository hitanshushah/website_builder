import { query } from './db'

export interface Template {
  id: number
  name: string
  identifier: string
  description: string | null
  is_active: boolean
  is_premium: boolean
  thumbnail: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function getActiveTemplates(): Promise<Template[]> {
  const sql = `
    SELECT * FROM templates 
    WHERE deleted_at IS NULL 
    AND is_active = TRUE
    ORDER BY created_at DESC
  `
  
  const result = await query<Template>(sql)
  return result
}
