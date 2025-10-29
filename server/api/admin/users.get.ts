import { UserModel, ProfileModel } from '../../db/models'
import { getAllPremiumPlans } from '../../db/premiumPlans'
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
  
  if (!userDb.is_super_admin) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found'
    })
  }

  const method = getMethod(event)
  
  if (method === 'GET') {
    // Get all users with their profiles and plan information
    const users = await query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.premium_plan_id,
        u.is_lifetime_plan,
        u.is_super_admin,
        u.created_at,
        u.updated_at,
        p.name as profile_name,
        p.personal_website_url,
        p.website_url,
        p.domain_verified,
        p.domain_key,
        p.domain_value,
        pp.name as plan_name,
        pp.key as plan_key,
        pp.price as plan_price
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN premium_plans pp ON u.premium_plan_id = pp.id
      ORDER BY u.created_at DESC
    `)
    
    return {
      success: true,
      users
    }
  }
  
  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})
