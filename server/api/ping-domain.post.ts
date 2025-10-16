import { promisify } from 'util'
import { lookup } from 'dns'

const dnsLookup = promisify(lookup)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { domain, expectedHostname } = body

    if (!domain || !expectedHostname) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Domain and expected hostname are required'
      })
    }

    try {
      // Use DNS lookup to resolve the domain to IP
      const domainResult = await dnsLookup(domain, { all: true })
      const domainAddresses = Array.isArray(domainResult) ? domainResult.map(r => r.address) : [domainResult.address]
      
      // Also resolve the expected hostname to IP for comparison
      const expectedResult = await dnsLookup(expectedHostname, { all: true })
      const expectedAddresses = Array.isArray(expectedResult) ? expectedResult.map(r => r.address) : [expectedResult.address]
      
      // Check if any of the resolved addresses match
      const matchingAddresses = domainAddresses.filter(domainAddr => 
        expectedAddresses.includes(domainAddr)
      )
      
      const isCorrect = matchingAddresses.length > 0
      
      return {
        success: true,
        domain,
        resolvedHostname: domainAddresses[0],
        allAddresses: domainAddresses,
        expectedHostname,
        expectedAddresses,
        matchingAddresses,
        isCorrect,
        pingOutput: `DNS lookup results:\n${domain} resolves to: ${domainAddresses.join(', ')}\n${expectedHostname} resolves to: ${expectedAddresses.join(', ')}\nMatching IPs: ${matchingAddresses.join(', ') || 'None'}\nStatus: ${isCorrect ? 'CORRECTLY CONFIGURED' : 'NOT CONFIGURED'}`
      }
    } catch (dnsError: any) {
      // If DNS lookup fails, return error info
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
