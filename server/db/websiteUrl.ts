import { query } from './db'

export interface WebsiteUrlData {
  website_url: string | null
  personal_website_url: string | null
  share_website: boolean
  share_personal_website: boolean
}

export async function getWebsiteUrl(userId: number): Promise<WebsiteUrlData> {
  const sql = `
    SELECT 
      website_url,
      personal_website_url,
      share_website,
      share_personal_website
    FROM profiles
    WHERE user_id = $1
  `

  const result = await query(sql, [userId])

  if (result.length === 0) {
    return {
      website_url: null,
      personal_website_url: null,
      share_website: false,
      share_personal_website: false
    }
  }

  return result[0] as WebsiteUrlData
}

export async function saveWebsiteUrl(userId: number, websiteUrl: string): Promise<WebsiteUrlData> {
  const checkSql = `
    SELECT user_id 
    FROM profiles 
    WHERE website_url = $1 AND user_id != $2
  `
  const existingUrl = await query(checkSql, [websiteUrl, userId])

  if (existingUrl.length > 0) {
    throw new Error('This website URL is already taken')
  }

  const checkProfileSql = `
    SELECT id FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query(checkProfileSql, [userId])

  let result
  if (existingProfile.length > 0) {
    const updateSql = `
      UPDATE profiles 
      SET website_url = $2, 
          share_website = true,
          share_personal_website = false,
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING website_url, personal_website_url, share_website, share_personal_website
    `
    result = await query(updateSql, [userId, websiteUrl])
  } else {
    const insertSql = `
      INSERT INTO profiles (user_id, website_url, share_website, share_personal_website, created_at, updated_at)
      VALUES ($1, $2, true, false, NOW(), NOW())
      RETURNING website_url, personal_website_url, share_website, share_personal_website
    `
    result = await query(insertSql, [userId, websiteUrl])
  }

  return result[0] as WebsiteUrlData
}

export async function deleteWebsiteUrl(userId: number): Promise<WebsiteUrlData> {
  const checkProfileSql = `
    SELECT id FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query(checkProfileSql, [userId])

  if (existingProfile.length === 0) {
    return {
      website_url: null,
      personal_website_url: null,
      share_website: false,
      share_personal_website: false
    }
  }

  const updateSql = `
    UPDATE profiles 
    SET website_url = NULL, 
        share_website = false,
        updated_at = NOW()
    WHERE user_id = $1
    RETURNING website_url, personal_website_url, share_website, share_personal_website
  `
  
  const result = await query(updateSql, [userId])
  return result[0] as WebsiteUrlData
}

export async function toggleShareWebsite(userId: number, shareWebsite: boolean): Promise<WebsiteUrlData> {
  const checkProfileSql = `
    SELECT id FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query(checkProfileSql, [userId])

  if (existingProfile.length === 0) {
    return {
      website_url: null,
      personal_website_url: null,
      share_website: false,
      share_personal_website: false
    }
  }

  // When setting share_website to true, set share_personal_website to false
  const updateSql = `
    UPDATE profiles 
    SET share_website = $2,
        share_personal_website = CASE WHEN $2 = true THEN false ELSE share_personal_website END,
        updated_at = NOW()
    WHERE user_id = $1
    RETURNING website_url, personal_website_url, share_website, share_personal_website
  `
  
  const result = await query(updateSql, [userId, shareWebsite])
  return result[0] as WebsiteUrlData
}

export async function savePersonalWebsiteUrl(userId: number, personalWebsiteUrl: string): Promise<WebsiteUrlData> {
  const checkProfileSql = `
    SELECT id FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query(checkProfileSql, [userId])

  let result
  if (existingProfile.length > 0) {
    const updateSql = `
      UPDATE profiles 
      SET personal_website_url = $2, 
          share_personal_website = true,
          share_website = false,
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING website_url, personal_website_url, share_website, share_personal_website
    `
    result = await query(updateSql, [userId, personalWebsiteUrl])
  } else {
    const insertSql = `
      INSERT INTO profiles (user_id, personal_website_url, share_personal_website, share_website, created_at, updated_at)
      VALUES ($1, $2, true, false, NOW(), NOW())
      RETURNING website_url, personal_website_url, share_website, share_personal_website
    `
    result = await query(insertSql, [userId, personalWebsiteUrl])
  }

  return result[0] as WebsiteUrlData
}

export async function deletePersonalWebsiteUrl(userId: number): Promise<WebsiteUrlData> {
  const checkProfileSql = `
    SELECT id FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query(checkProfileSql, [userId])

  if (existingProfile.length === 0) {
    return {
      website_url: null,
      personal_website_url: null,
      share_website: false,
      share_personal_website: false
    }
  }

  const updateSql = `
    UPDATE profiles 
    SET personal_website_url = NULL,
        share_personal_website = false,
        updated_at = NOW()
    WHERE user_id = $1
    RETURNING website_url, personal_website_url, share_website, share_personal_website
  `
  
  const result = await query(updateSql, [userId])
  return result[0] as WebsiteUrlData
}

export async function toggleSharePersonalWebsite(userId: number, sharePersonalWebsite: boolean): Promise<WebsiteUrlData> {
  const checkProfileSql = `
    SELECT id FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query(checkProfileSql, [userId])

  if (existingProfile.length === 0) {
    return {
      website_url: null,
      personal_website_url: null,
      share_website: false,
      share_personal_website: false
    }
  }

  // When setting share_personal_website to true, set share_website to false
  const updateSql = `
    UPDATE profiles 
    SET share_personal_website = $2,
        share_website = CASE WHEN $2 = true THEN false ELSE share_website END,
        updated_at = NOW()
    WHERE user_id = $1
    RETURNING website_url, personal_website_url, share_website, share_personal_website
  `
  
  const result = await query(updateSql, [userId, sharePersonalWebsite])
  return result[0] as WebsiteUrlData
}

