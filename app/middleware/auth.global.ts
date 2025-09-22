import { useUserStore } from '../../stores/user'
import type { User } from '../types'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/logout') {
    return;
  }
  
  // Only run on server side to avoid bundling database code for client
  if (!process.server) {
    return;
  }
  
  const event = useRequestEvent()
  if (!event) return

  const headers = useRequestHeaders()
  const username = headers['x-username']
  const name = headers['x-authentik-name']
  const email = headers['x-authentik-email']

  const config = useRuntimeConfig()
  const logoutUrl = config.public.authentikLogoutUrl || '/logout'

  if (!username || !email) {
    return navigateTo(logoutUrl, { external: true })
  }

  try {
    // Import database models only on server side
    const { UserModel, ProfileModel } = await import('../../server/db/models')
    
    const userDb = await UserModel.firstOrCreate(username, email)
    let profile = await ProfileModel.findByUserId(userDb.id)
    if (!profile) {
      profile = await ProfileModel.create(userDb.id, name || username)
    }

    const userStore = useUserStore()
    const user: User = {
      id: userDb.id,
      username,
      email,
      created_at: userDb.created_at,
      updated_at: userDb.updated_at,
    }
    userStore.setUser(user)
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return navigateTo(logoutUrl, { external: true })
  }
})
