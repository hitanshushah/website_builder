import { query } from './db'
import type { Profile } from '../../app/types'

export async function findProfileByWebsiteUrl(websiteUrl: string): Promise<Profile | null> {
  const profiles = await query<Profile>(
    'SELECT * FROM profiles WHERE website_url = $1 AND share_website = true',
    [websiteUrl]
  )
  return profiles.length > 0 ? profiles[0] : null
}

export async function findProfileByAccessToken(accessToken: string): Promise<Profile | null> {
  const profiles = await query<Profile>(
    'SELECT * FROM profiles WHERE acess_token = $1 AND share_personal_website = true',
    [accessToken]
  )
  return profiles.length > 0 ? profiles[0] : null
}

