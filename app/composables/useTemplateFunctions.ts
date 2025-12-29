import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProcessedTemplateData } from './useTemplateData'

export const useTemplateFunctions = (data: Ref<ProcessedTemplateData | null>) => {
  // Sort experiences by end date (present first, then descending)
  const sortedExperiences = computed(() => {
    if (!data.value?.experiences) return []
    
    return [...data.value.experiences].sort((a, b) => {
      if (a.end_date && b.end_date) {
        return new Date(b.end_date).getFullYear() - new Date(a.end_date).getFullYear()
      }
      if (!a.end_date && b.end_date) return -1
      if (a.end_date && !b.end_date) return 1
      if (!a.end_date && !b.end_date) {
        return new Date(b.start_date || '').getFullYear() - new Date(a.start_date || '').getFullYear()
      }
      return 0
    })
  })

  // Sort education by end date (present first, then descending)
  const sortedEducation = computed(() => {
    if (!data.value?.education) return []
    
    return [...data.value.education].sort((a, b) => {
      if (a.end_date && b.end_date) {
        return new Date(b.end_date).getFullYear() - new Date(a.end_date).getFullYear()
      }
      if (!a.end_date && b.end_date) return -1
      if (a.end_date && !b.end_date) return 1
      if (!a.end_date && !b.end_date) {
        return new Date(b.start_date || '').getFullYear() - new Date(a.start_date || '').getFullYear()
      }
      return 0
    })
  })

  // Get initials from a name
  const getInitials = (name: string): string => {
    if (!name) return '?'
    
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    
    return words
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  }

  // Get user profile initials
  const getUserInitials = computed(() => {
    if (!data.value?.userProfile?.name) return '?'
    return getInitials(data.value.userProfile.name)
  })

  // Get company/organization initials
  const getCompanyInitials = (companyName: string): string => {
    return getInitials(companyName)
  }

  // Get institution initials (for education)
  const getInstitutionInitials = (institutionName: string): string => {
    return getInitials(institutionName)
  }

  // Format date range (e.g., "Jan 2020 - Present" or "2020 - 2023")
  const formatDateRange = (startDate: string | null, endDate: string | null): string => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const startYear = start.getFullYear()
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    
    if (!endDate) {
      return `${startMonth} ${startYear} - Present`
    }
    
    const end = new Date(endDate)
    const endYear = end.getFullYear()
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    
    if (startYear === endYear) {
      return `${startMonth} - ${endMonth} ${endYear}`
    }
    
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`
  }

  // Format single date (e.g., "Jan 2020")
  const formatDate = (date: string | null): string => {
    if (!date) return ''
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    
    return `${month} ${year}`
  }

  // Format year only
  const formatYear = (date: string | null): string => {
    if (!date) return ''
    return new Date(date).getFullYear().toString()
  }

  // Get proficiency percentage for skills
  const getProficiencyPercentage = (level: string): number => {
    const percentages: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100
    }
    return percentages[level.toLowerCase()] || 50
  }

  // Generate favicon URL using placehold.co API
  const generateFavicon = (options: {
    primaryColor?: string
    secondaryColor?: string
    name?: string
    font?: string
  } = {}): string => {
    const config = useRuntimeConfig()
    const brandName = config.public.brandName
    const {
      primaryColor = '000000',
      secondaryColor = 'FFFFFF',
      name = brandName,
      font = 'roboto'
    } = options

    // Get initials from the name
    const initials = getInitials(name)

    // Remove hash symbols if present
    const cleanPrimaryColor = primaryColor.replace('#', '')
    const cleanSecondaryColor = secondaryColor.replace('#', '')

    // Construct the placehold.co URL
    const baseUrl = 'https://placehold.co'
    const faviconUrl = `${baseUrl}/10x10/transparent/${cleanPrimaryColor}?text=${encodeURIComponent(initials)}&font=${font}`

    return faviconUrl
  }

  // Set favicon for the current page
  const setFavicon = (options: {
    primaryColor?: string
    secondaryColor?: string
    name?: string
    font?: string
  } = {}) => {
    if (process.client) {
      const faviconUrl = generateFavicon(options)
      
      // Set document title to user's name
      if (options.name) {
        document.title = options.name
      }
      
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]')
      existingLinks.forEach(link => link.remove())
      
      // Create new favicon link
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.sizes = '32x32'
      link.href = faviconUrl
      
      document.head.appendChild(link)
    }
  }

  return {
    sortedExperiences,
    sortedEducation,
    getInitials,
    getUserInitials,
    getCompanyInitials,
    getInstitutionInitials,
    formatDateRange,
    formatDate,
    formatYear,
    getProficiencyPercentage,
    generateFavicon,
    setFavicon
  }
}

