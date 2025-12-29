/**
 * Utility functions for domain operations
 */

/**
 * Cleans and normalizes a domain string by removing protocol, www prefix, and trailing slash
 * @param domain - The domain string to clean
 * @returns The cleaned domain string
 */
export function getBaseDomain(domain: string): string {
  // Remove protocol (http:// or https://) if present
  let cleanDomain = domain.replace(/^https?:\/\//, '')
  
  // Remove www. prefix if present
  cleanDomain = cleanDomain.replace(/^www\./, '')
  
  // Remove trailing slash if present
  cleanDomain = cleanDomain.replace(/\/$/, '')
  
  return cleanDomain
}
