import { UserModel } from '../db/models'

export default defineEventHandler(async (event) => {
  try {
    const users = await UserModel.getAllUsers()
    return users
  } catch (err) {
    console.error('Error fetching users:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})