import { query } from './db'
import { randomBytes } from 'crypto'

export async function getAccessToken(userId: number): Promise<{ access_token: string | null }> {
  const sql = `
    SELECT acess_token as access_token
    FROM profiles
    WHERE user_id = $1
  `

  const result = await query(sql, [userId]) as Array<{ access_token: string | null }>

  if (result.length === 0) {
    return { access_token: null }
  }

  return { access_token: result[0].access_token }
}

export async function generateAccessToken(userId: number): Promise<{ access_token: string }> {
  // Check if user already has a token
  const existingToken = await getAccessToken(userId)
  if (existingToken.access_token) {
    throw new Error('Access token already exists for this user')
  }

  // Generate a unique 32-character token
  let token: string
  let isUnique = false
  let attempts = 0
  const maxAttempts = 10

  while (!isUnique && attempts < maxAttempts) {
    // Generate random 32 character token
    token = randomBytes(16).toString('hex')
    
    // Check if token is unique
    const checkSql = `
      SELECT user_id 
      FROM profiles 
      WHERE acess_token = $1
    `
    const existingTokenCheck = await query(checkSql, [token])
    
    if (existingTokenCheck.length === 0) {
      isUnique = true
    }
    
    attempts++
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique token after multiple attempts')
  }

  // Check if profile exists
  const checkProfileSql = `
    SELECT id FROM profiles WHERE user_id = $1
  `
  const existingProfile = await query(checkProfileSql, [userId])

  let result: any
  if (existingProfile.length > 0) {
    // Update existing profile
    const updateSql = `
      UPDATE profiles 
      SET acess_token = $2,
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING acess_token as access_token
    `
    result = await query(updateSql, [userId, token!])
  } else {
    // Insert new profile
    const insertSql = `
      INSERT INTO profiles (user_id, acess_token, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING acess_token as access_token
    `
    result = await query(insertSql, [userId, token!])
  }

  return { access_token: result[0].access_token as string }
}

