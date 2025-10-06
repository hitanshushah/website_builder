import { UserModel } from '../db/models'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId ? parseInt(query.userId as string) : null

    if (userId) {
      const user = await UserModel.findById(userId)
      return user ? [user] : []
    }

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