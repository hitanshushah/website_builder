import { useUserStore } from '../../stores/user'
import type { User } from '../types'
import { handleSubdomainAccess } from './subdomain.internal'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/logout') {
    return;
  }
  
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
  const logoutUrl = (config.public.authentikLogoutUrl as string) || '/logout'

  if (!username || !email) {
    const result = await handleSubdomainAccess(event, headers, logoutUrl)
    
    if (result.shouldLogout) {
      return navigateTo(logoutUrl, { external: true })
    }
    
    if (result.show404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true
      })
    }
    
    if (to.path === '/') {
      return
    }
    
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true
    })
  }

  try {
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
      website_premium: userDb.website_premium || false,
      created_at: userDb.created_at,
      updated_at: userDb.updated_at,
    }
    userStore.setUser(user)
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return navigateTo(logoutUrl, { external: true })
  }
})
