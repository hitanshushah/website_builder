import { getAllPremiumPlans } from '../../db/premiumPlans'
import { UserModel } from '../../db/models'

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

  const plans = await getAllPremiumPlans()
  
  return {
    success: true,
    plans
  }
})
