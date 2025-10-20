import { promisify } from 'util'
import { lookup, resolveTxt } from 'dns'
import { query } from '../db/db'

const dnsLookup = promisify(lookup)
const dnsResolveTxt = promisify(resolveTxt)

function getBaseDomain(domain: string): string {
  // Remove protocol (http:// or https://) if present
  let cleanDomain = domain.replace(/^https?:\/\//, '')
  
  // Remove www. prefix if present
  cleanDomain = cleanDomain.replace(/^www\./, '')
  
  // Remove trailing slash if present
  cleanDomain = cleanDomain.replace(/\/$/, '')
  
  return cleanDomain
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { domain, expectedHostname, userId } = body

    if (!domain || !expectedHostname) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Domain and expected hostname are required'
      })
    }

    // Get user's domain verification key if exists
    let domainKey = null
    let domainValue = null
    let domainVerified = false

    if (userId) {
      const userProfile = await query<{domain_key: string, domain_value: string, domain_verified: boolean}>(
        'SELECT domain_key, domain_value, domain_verified FROM profiles WHERE user_id = $1',
        [userId]
      )
      if (userProfile.length > 0) {
        domainKey = userProfile[0].domain_key
        domainValue = userProfile[0].domain_value
        domainVerified = userProfile[0].domain_verified
      }
    }

    try {
      // Check IP resolution (existing functionality)
      const domainResult = await dnsLookup(domain, { all: true })
      const domainAddresses = Array.isArray(domainResult) ? domainResult.map((r: any) => r.address) : [(domainResult as any).address]
      
      const expectedResult = await dnsLookup(expectedHostname, { all: true })
      const expectedAddresses = Array.isArray(expectedResult) ? expectedResult.map((r: any) => r.address) : [(expectedResult as any).address]
      
      const matchingAddresses = domainAddresses.filter(domainAddr => 
        expectedAddresses.includes(domainAddr)
      )
      
      const ipCorrect = matchingAddresses.length > 0

      // Check TXT record for domain ownership (new functionality)
      let txtCorrect = false
      let txtError = null
      let txtRecords: string[] = []

      if (domainKey && domainValue) {
        try {
          // Get base domain (remove www. if present) for TXT lookup
          const baseDomain = getBaseDomain(domain)
          const fullDomainKey = `${domainKey}.${baseDomain}`
          
          const txtResults = await dnsResolveTxt(fullDomainKey)
          txtRecords = txtResults.flat()
          
          // Check if any TXT record matches our expected value
          txtCorrect = txtRecords.some(record => 
            record.includes(domainValue) || record === domainValue
          )
          
        } catch (txtErr: any) {
          txtError = txtErr.message
        }
      }

      // Overall verification status
      const isCorrect = ipCorrect && (domainKey ? txtCorrect : true)
      
      // Update domain_verified status in database if both checks pass
      if (userId && ipCorrect && txtCorrect && domainKey && !domainVerified) {
        await query(
          'UPDATE profiles SET domain_verified = true, updated_at = NOW() WHERE user_id = $1',
          [userId]
        )
      }

      return {
        success: true,
        domain,
        resolvedHostname: domainAddresses[0],
        allAddresses: domainAddresses,
        expectedHostname,
        expectedAddresses,
        matchingAddresses,
        isCorrect,
        ipCorrect,
        txtCorrect: domainKey ? txtCorrect : null,
        txtError,
        txtRecords,
        domainKey,
        domainValue,
        domainVerified: isCorrect && domainKey ? true : domainVerified,
        pingOutput: `DNS lookup results:\n${domain} resolves to: ${domainAddresses.join(', ')}\n${expectedHostname} resolves to: ${expectedAddresses.join(', ')}\nMatching IPs: ${matchingAddresses.join(', ') || 'None'}\nIP Status: ${ipCorrect ? 'CORRECTLY CONFIGURED' : 'NOT CONFIGURED'}${domainKey ? `\nTXT Record Status: ${txtCorrect ? 'VERIFIED' : 'NOT VERIFIED'}\nDomain Key: ${domainKey}\nBase Domain: ${getBaseDomain(domain)}\nFull TXT Record: ${domainKey}.${getBaseDomain(domain)}\nDomain Value: ${domainValue}\nTXT Records: ${txtRecords.join(', ')}` : ''}`
      }
    } catch (dnsError: any) {
      return {
        success: false,
        domain,
        expectedHostname,
        isCorrect: false,
        error: dnsError.message || 'DNS lookup failed',
        pingOutput: `DNS lookup failed for ${domain}: ${dnsError.message}`
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to resolve domain'
    })
  }
})
