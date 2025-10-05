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