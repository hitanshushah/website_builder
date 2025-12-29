import { promisify } from 'util'
import { lookup, resolveTxt } from 'dns'
import { query } from '../db/db'
import { getBaseDomain } from '../utils/domainUtils'

const dnsLookup = promisify(lookup)
const dnsResolveTxt = promisify(resolveTxt)

// Helper function to resolve TXT with timeout and retry
async function resolveTxtWithTimeout(domain: string, timeoutMs: number = 10000): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`DNS TXT lookup timeout for ${domain}`))
    }, timeoutMs)
    
    resolveTxt(domain, (err, records) => {
      clearTimeout(timer)
      if (err) {
        reject(err)
      } else {
        resolve(records.flat())
      }
    })
  })
}

// Helper function to retry DNS lookup with exponential backoff
async function resolveTxtWithRetry(domain: string, maxRetries: number = 3): Promise<string[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DNS Debug] Attempt ${attempt}/${maxRetries} for ${domain}`)
      return await resolveTxtWithTimeout(domain, 10000)
    } catch (error: any) {
      console.log(`[DNS Debug] Attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retry with exponential backoff
      const waitTime = Math.pow(2, attempt) * 1000
      console.log(`[DNS Debug] Waiting ${waitTime}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed`)
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
          
          console.log(`[DNS Debug] Looking up TXT record for: ${fullDomainKey}`)
          console.log(`[DNS Debug] Expected domain value: ${domainValue}`)
          
          // Try with retry mechanism first, then fallback to regular lookup
          try {
            txtRecords = await resolveTxtWithRetry(fullDomainKey, 3)
          } catch (retryErr: any) {
            console.log(`[DNS Debug] Retry approach failed, trying regular lookup:`, retryErr.message)
            try {
              const txtResults = await dnsResolveTxt(fullDomainKey)
              txtRecords = txtResults.flat()
            } catch (fallbackErr: any) {
              console.log(`[DNS Debug] Fallback also failed:`, fallbackErr.message)
              throw fallbackErr
            }
          }
          
          console.log(`[DNS Debug] Found TXT records:`, txtRecords)
          
          // Check if any TXT record matches our expected value
          txtCorrect = txtRecords.some(record => 
            record.includes(domainValue) || record === domainValue
          )
          
          console.log(`[DNS Debug] TXT verification result: ${txtCorrect}`)
          
        } catch (txtErr: any) {
          console.log(`[DNS Debug] TXT lookup error:`, txtErr.message)
          console.log(`[DNS Debug] Error code:`, txtErr.code)
          console.log(`[DNS Debug] Full error:`, txtErr)
          
          // Provide more specific error messages
          const fullDomainKey = `${domainKey}.${getBaseDomain(domain)}`
          if (txtErr.code === 'ENOTFOUND') {
            txtError = `TXT record not found for ${fullDomainKey}. Please ensure the TXT record is properly configured in your DNS settings.`
          } else if (txtErr.code === 'ETIMEOUT') {
            txtError = `DNS lookup timeout for ${fullDomainKey}. This might be a DNS propagation issue.`
          } else {
            txtError = `DNS lookup failed: ${txtErr.message}`
          }
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
