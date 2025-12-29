import { query } from '../db/db'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Check if user already has a domain key (can't generate new one)
    const existingProfile = await query(
      'SELECT domain_key, domain_value FROM profiles WHERE user_id = $1',
      [userId]
    )

    if (existingProfile.length > 0 && existingProfile[0].domain_key) {
      return {
        success: true,
        domain_key: existingProfile[0].domain_key,
        domain_value: existingProfile[0].domain_value,
        message: 'Domain key already exists'
      }
    }

    // Generate new domain key and value
    const domainKey = `_domain-verification-${crypto.randomBytes(8).toString('hex')}`
    const domainValue = crypto.randomBytes(32).toString('hex')

    // Store in database
    await query(
      'UPDATE profiles SET domain_key = $1, domain_value = $2, domain_verified = false, updated_at = NOW() WHERE user_id = $3',
      [domainKey, domainValue, userId]
    )

    return {
      success: true,
      domain_key: domainKey,
      domain_value: domainValue,
      message: 'Domain verification key generated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to generate domain key'
    })
  }
})
