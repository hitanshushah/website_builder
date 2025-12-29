import { UserModel } from '../../db/models'
import { query } from '../../db/db'

export default defineEventHandler(async (event) => {
  // Check if user is super admin by getting user info from headers
  const headers = getRequestHeaders(event)
  const username = headers['x-username']
  const email = headers['x-authentik-email']

  if (!username || !email) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found'
    })
  }

  // Get user from database
  const userDb = await UserModel.firstOrCreate(username, email)
  
  if (!(userDb as any).is_super_admin) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found'
    })
  }

  const body = await readBody(event)
  const { userId, updates } = body
  
  if (!userId || !updates) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId or updates'
    })
  }
  
  // Update user based on provided fields
  if (updates.premium_plan_id) {
    await UserModel.updatePlan(userId, updates.premium_plan_id, userDb.id)
  }
  
  if (updates.is_lifetime_plan !== undefined) {
    await UserModel.updateLifetimePlan(userId, updates.is_lifetime_plan, userDb.id)
  }
  
  if (updates.is_super_admin !== undefined) {
    await UserModel.updateSuperAdmin(userId, updates.is_super_admin, userDb.id)
  }
  
  // Update profile domain verification if provided
  if (updates.domain_verified !== undefined) {
    await query(
      'UPDATE profiles SET domain_verified = $2, updated_at = NOW() WHERE user_id = $1',
      [userId, updates.domain_verified]
    )
  }
  
  return {
    success: true,
    message: 'User updated successfully'
  }
})
