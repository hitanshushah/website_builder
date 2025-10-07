import type { H3Event } from 'h3'

export async function handleSubdomainAccess(event: H3Event, headers: Record<string, string | undefined>, logoutUrl: string | null | undefined) {
  const host = headers['host']
  let subdomain = null
  
  if (host) {
    const parts = host.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]
    }
  }

  if (!subdomain) {
    return { shouldLogout: true, show404: false }
  }

  try {
    const { findProfileByWebsiteUrl, findProfileByAccessToken } = await import('../../server/db/profiles')
    const { getUserPreferences } = await import('../../server/db/userPreferences')
    const { getPublicWebsiteData } = await import('../../server/db/getProjectsBoardData')
    const { getColors } = await import('../../server/db/colors')
    const { query } = await import('../../server/db/db')

    let profile = null
    let userId = null

    profile = await findProfileByWebsiteUrl(subdomain)
    
    if (!profile) {
      profile = await findProfileByAccessToken(subdomain)
    }

    if (!profile) {
      const subdomainExists = await query(
        'SELECT id FROM profiles WHERE website_url = $1 OR acess_token = $1',
        [subdomain]
      )
      
      if (subdomainExists.length > 0) {
        return { shouldLogout: false, show404: true }
      }
      
      return { shouldLogout: true, show404: false }
    }

    userId = profile.user_id

    const userPreferences = await getUserPreferences(userId)
    
    if (!userPreferences) {
      console.error('No user preferences found for subdomain access')
      return { shouldLogout: true, show404: false }
    }

    const websiteData = await getPublicWebsiteData(userId)

    const allColors = await getColors(userId)
    const selectedColor = allColors.find((c: any) => c.id === userPreferences.color_id)

    if (!selectedColor) {
      console.error('Selected color not found for subdomain access')
      return { shouldLogout: true, show404: false }
    }

    if (event.context) {
      event.context.subdomainAccess = {
        userId: userId,
        templateId: userPreferences.template_id,
        colorId: userPreferences.color_id,
        templateIdentifier: userPreferences.template_identifier,
        colorName: userPreferences.color_name,
        colorKey: userPreferences.color_key,
        templateName: userPreferences.template_name,
        isSubdomainAccess: true,
        websiteData: websiteData,
        colors: {
          primary: selectedColor.primary_color,
          secondary: selectedColor.secondary_color,
          background: selectedColor.background_color,
          fourth: selectedColor.fourth_color || selectedColor.primary_color
        }
      }
    }
    
    return { 
      shouldLogout: false, 
      show404: false,
      redirectTo: null
    }
  } catch (error) {
    console.error('Subdomain authentication error:', error)
    return { shouldLogout: true, show404: false }
  }
}


