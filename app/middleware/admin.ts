export default defineNuxtRouteMiddleware(async (to) => {
  if (!process.server) {
    return;
  }

  const event = useRequestEvent()
  if (!event) return

  const headers = useRequestHeaders()
  const username = headers['x-username']
  const email = headers['x-authentik-email']

  if (!username || !email) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true
    })
  }

  try {
    const { UserModel } = await import('../../server/db/models')
    const userDb = await UserModel.firstOrCreate(username, email)
    
    if (!userDb.is_super_admin) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true
      })
    }
  } catch (error) {
    console.error('Admin middleware error:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true
    })
  }
})
