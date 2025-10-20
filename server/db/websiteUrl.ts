import { query } from './db'

export interface WebsiteUrlData {
  website_url: string | null
  personal_website_url: string | null
  share_website: boolean
  share_personal_website: boolean
  domain_verified?: boolean
  domain_key?: string
  domain_value?: string
}

export async function getWebsiteUrl(userId: number): Promise<WebsiteUrlData> {
  const sql = `
    SELECT 
      website_url,
      personal_website_url,
      share_website,
      share_personal_website,
      domain_verified,
      domain_key,
      domain_value
    FROM profiles
    WHERE user_id = $1
  `

  const result = await query(sql, [userId])

  if (result.length === 0) {
    return {
      website_url: null,
      personal_website_url: null,
      share_website: false,
      share_personal_website: false,
      domain_verified: false,
      domain_key: null,
      domain_value: null
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
    SELECT id, personal_website_url FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query<{id: number, personal_website_url: string}>(checkProfileSql, [userId])

  let result
  if (existingProfile.length > 0) {
    // Check if the URL is actually changing
    const currentUrl = existingProfile[0].personal_website_url
    const urlChanged = currentUrl !== personalWebsiteUrl
    
    // If URL is not changing, return an error
    if (!urlChanged && currentUrl === personalWebsiteUrl) {
      throw new Error('This is already your personal website URL')
    }
    
    const updateSql = `
      UPDATE profiles 
      SET personal_website_url = $2, 
          share_personal_website = true,
          share_website = false,
          domain_verified = CASE WHEN $3 = true THEN false ELSE domain_verified END,
          domain_key = CASE WHEN $3 = true THEN NULL ELSE domain_key END,
          domain_value = CASE WHEN $3 = true THEN NULL ELSE domain_value END,
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING website_url, personal_website_url, share_website, share_personal_website
    `
    result = await query(updateSql, [userId, personalWebsiteUrl, urlChanged])
  } else {
    const insertSql = `
      INSERT INTO profiles (user_id, personal_website_url, share_personal_website, share_website, domain_verified, created_at, updated_at)
      VALUES ($1, $2, true, false, false, NOW(), NOW())
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
        domain_verified = false,
        domain_key = NULL,
        domain_value = NULL,
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

