import { UserModel } from '../db/models'

export default defineEventHandler(async (event) => {
  try {
    console.log('Fetching all users...')
    const users = await UserModel.getAllUsers()
    console.log(`Found ${users.length} users`)
    return users
  } catch (err) {
    console.error('Error fetching users:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})