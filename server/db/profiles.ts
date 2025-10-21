import { query } from './db'
import type { Profile } from '../../app/types'
import { getBaseDomain } from '../utils/domainUtils'

async function verifyDomainOwnership(profile: Profile, hostUrl: string): Promise<{ isVerified: boolean; error?: string }> {
  try {
    const baseDomain = getBaseDomain(hostUrl)
    const config = useRuntimeConfig()
    const ddns = config.public.ddns
    // Check if profile has domain verification keys
    if (!profile.domain_key || !profile.domain_value) {
      return { isVerified: false, error: 'Domain verification keys not found' }
    }

    // Use the existing ping-domain API to verify domain ownership
    const pingResponse = await $fetch('/api/ping-domain', {
      method: 'POST',
      body: {
        domain: baseDomain,
        expectedHostname: ddns,
        userId: profile.user_id
      }
    })

    if (pingResponse.success && pingResponse.isCorrect) {
      return { isVerified: true }
    } else {
      const errorMsg = 'error' in pingResponse ? String(pingResponse.error) : 'Domain verification failed'
      return { 
        isVerified: false, 
        error: errorMsg 
      }
    }
  } catch (error: any) {
    return { isVerified: false, error: `Domain verification error: ${error.message}` }
  }
}

export async function findProfileByHostUrl(hostUrl: string): Promise<Profile | null> {
  const baseDomain = getBaseDomain(hostUrl)

  const profiles = await query<Profile>(
    `SELECT p.* FROM profiles p
     JOIN users u ON p.user_id = u.id
     JOIN premium_plans pp ON u.premium_plan_id = pp.id
     WHERE p.personal_website_url = $1 
     AND p.share_personal_website = true 
     AND pp.key = 'pro'`,
    [baseDomain]
  )

  if (profiles.length > 0) {
    const profile = profiles[0]
    if(profile.domain_verified) {
      return profile
    }
    
    // Perform domain verification
    const verification = await verifyDomainOwnership(profile, hostUrl)
    
    if (verification.isVerified) {
      // Update domain_verified status if not already verified
      if (!profile.domain_verified) {
        await query(
          'UPDATE profiles SET domain_verified = true, updated_at = NOW() WHERE id = $1',
          [profile.id]
        )
        profile.domain_verified = true
      }
      return profile
    } else {
      // Domain verification failed, throw error
      throw new Error(`Domain not verified: ${verification.error}`)
    }
  }
  
  return null
}

export async function findProfileByWebsiteUrl(websiteUrl: string): Promise<Profile | null> {
  const profiles = await query<Profile>(
    'SELECT * FROM profiles WHERE website_url = $1 AND share_website = true',
    [websiteUrl]
  )
  return profiles.length > 0 ? profiles[0] : null
}

