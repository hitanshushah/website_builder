import { query } from './db'
import type { Profile } from '../../app/types'

export async function findProfileByHostUrl(hostUrl: string): Promise<Profile | null> {
  const profiles = await query<Profile>(
    `SELECT p.* FROM profiles p
     JOIN users u ON p.user_id = u.id
     JOIN premium_plans pp ON u.premium_plan_id = pp.id
     WHERE p.personal_website_url = $1 
     AND p.share_personal_website = true 
     AND pp.key = 'pro'`,
    [hostUrl]
  )
  return profiles.length > 0 ? profiles[0] : null
}

export async function findProfileByWebsiteUrl(websiteUrl: string): Promise<Profile | null> {
  const profiles = await query<Profile>(
    'SELECT * FROM profiles WHERE website_url = $1 AND share_website = true',
    [websiteUrl]
  )
  return profiles.length > 0 ? profiles[0] : null
}

