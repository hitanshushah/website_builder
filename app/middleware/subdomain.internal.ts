import type { H3Event } from 'h3'

export async function handleSubdomainAccess(event: H3Event, headers: Record<string, string | undefined>, logoutUrl: string | null | undefined) {
  const host = headers['host']
  if (!host) {
    return { shouldLogout: true, show404: false }
  }

  try {
    const { findProfileByHostUrl, findProfileByWebsiteUrl } = await import('../../server/db/profiles')
    const { getUserPreferences } = await import('../../server/db/userPreferences')
    const { getPublicWebsiteData } = await import('../../server/db/getProjectsBoardData')
    const { getColors } = await import('../../server/db/colors')
    const { query } = await import('../../server/db/db')

    let profile: any = null
    let userId: number | null = null

    // First check for personal_website_url (full domain match)
    profile = await findProfileByHostUrl(host)
    
    // If not found, check for website_url (subdomain match)
    if (!profile) {
      const parts = host.split('.')
      if (parts.length > 2) {
        const subdomain = parts[0]
        profile = await findProfileByWebsiteUrl(subdomain)
        
        // If still not found, check if subdomain exists in database
        if (!profile) {
          const subdomainExists = await query(
            'SELECT id FROM profiles WHERE website_url = $1',
            [subdomain]
          )
          
          if (subdomainExists.length > 0) {
            return { shouldLogout: false, show404: true }
          }
        }
      }
    }

    if (!profile) {
      return { shouldLogout: true, show404: false }
    }

    userId = profile.user_id

    const userPreferences = await getUserPreferences(userId as number)
    
    if (!userPreferences) {
      console.error('No user preferences found for subdomain access')
      return { shouldLogout: true, show404: false }
    }

    const websiteData = await getPublicWebsiteData(userId as number)

    const allColors = await getColors(userId as number)
    const selectedColor = allColors.find((c: any) => c.id === userPreferences.color_id)

    if (!selectedColor) {
      console.error('Selected color not found for subdomain access')
      return { shouldLogout: true, show404: false }
    }

    // Get user's premium plan info
    const userQuery = await query(
      'SELECT premium_plan_id FROM users WHERE id = $1',
      [userId]
    )
    const user = userQuery[0]
    const isPremiumUser = user?.premium_plan_id > 2

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
        isPremiumUser: isPremiumUser,
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


