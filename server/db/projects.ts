import { query } from './db'
import type { Project } from '../../app/types'

export async function toggleHideOnWebsite(projectId: number): Promise<Project> {
  const sql = `
    UPDATE projects 
    SET hide_on_website = NOT COALESCE(hide_on_website, false), updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, key, name, description, start_date, end_date, is_public, hide_on_website, sorting_order, created_at, updated_at
  `

  const result = await query<Project>(sql, [projectId])

  if (result.length === 0) {
    throw new Error('Project not found or already deleted')
  }

  return result[0]
}
