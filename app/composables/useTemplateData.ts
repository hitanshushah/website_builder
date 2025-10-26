import type { ProjectsBoardData, Skill } from '~/types'

export interface ProcessedTemplateData {
  userProfile: ProjectsBoardData['userProfile']
  skills: ProjectsBoardData['skills']
  projects: ProjectsBoardData['projects']
  education: ProjectsBoardData['education']
  experiences: ProjectsBoardData['experiences']
  achievements: ProjectsBoardData['achievements']
  certifications: ProjectsBoardData['certifications']
  publications: ProjectsBoardData['publications']
  skillsByCategory: Array<[string, Skill[]]>
}

// Fetch and process template data
export function useFetchTemplateData(userId: number | undefined) {
  const config = useRuntimeConfig()
  const logoutUrl = config.public.authentikLogoutUrl || '/logout'
  
  // If userId is undefined, logout
  if (userId === undefined) {
    navigateTo(logoutUrl, { external: true })
    return {
      data: ref(null),
      loading: ref(false),
      error: ref('User not authenticated'),
      refetch: async () => {}
    }
  }

  const data = ref<ProcessedTemplateData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchData = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch<ProjectsBoardData>('/api/projectsboard', {
        query: { userId }
      })
      
      data.value = processTemplateData(response)
    } catch (err) {
      console.error('Error fetching projects board data:', err)
      error.value = 'Failed to load data. Please try again.'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

function processTemplateData(data: ProjectsBoardData | null): ProcessedTemplateData | null {
  if (!data) return null

  // Filter visible items
  const visibleSkills = data.skills?.filter(skill => !skill.hide_on_website) || []
  const visibleProjects = data.projects?.filter(project => !project.hide_on_website) || []
  const visibleEducation = data.education?.filter(edu => !edu.hide_on_website) || []
  const visibleExperiences = data.experiences?.filter(exp => !exp.hide_on_website) || []
  const visibleAchievements = data.achievements?.filter(achievement => !achievement.hide_on_website) || []
  const visibleCertifications = data.certifications?.filter(cert => !cert.hide_on_website) || []
  const visiblePublications = data.publications?.filter(pub => !pub.hide_on_website) || []

  const categories = Array.from(
    new Set(visibleSkills.map(skill => skill.category?.name || null))
  )

  const singleNullCategory = categories.length === 1 && categories[0] === null

  const skillsGrouped = new Map<string, Skill[]>()

  visibleSkills.forEach(skill => {
    let categoryName = skill.category?.name

    if (!categoryName) {
      categoryName = singleNullCategory ? '' : 'Other Skills'
    }

    const groupKey = categoryName || ''

    if (!skillsGrouped.has(groupKey)) {
      skillsGrouped.set(groupKey, [])
    }
    skillsGrouped.get(groupKey)!.push(skill)
  })

  let skillsByCategory = Array.from(skillsGrouped.entries()).map(([key, value]) => [
    key || null,
    value
  ])

  const processedUserProfile = { ...data.userProfile }
  if (data.userProfile.override_email && data.userProfile.secondary_email) {
    processedUserProfile.email = data.userProfile.secondary_email
  }

  if (skillsByCategory.length > 1) {
    skillsByCategory = skillsByCategory.sort(([a], [b]) => {
      if (a === 'Other Skills') return 1
      if (b === 'Other Skills') return -1
      return 0
    })
  }

  return {
    userProfile: processedUserProfile,
    skills: visibleSkills,
    projects: visibleProjects,
    education: visibleEducation,
    experiences: visibleExperiences,
    achievements: visibleAchievements,
    certifications: visibleCertifications,
    publications: visiblePublications,
    skillsByCategory
  }
}

// Utility functions for templates
export function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return ''
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'
  return `${start} - ${end}`
}

export function formatPublishDate(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getProficiencyColor(level: string): string {
  const colors: Record<string, string> = {
    beginner: 'bg-blue-500',
    intermediate: 'bg-green-500',
    advanced: 'bg-orange-500',
    expert: 'bg-purple-500'
  }
  return colors[level] || 'bg-gray-500'
}

export function getProficiencyWidth(level: string): string {
  const widths: Record<string, string> = {
    beginner: 'w-1/4',
    intermediate: 'w-1/2',
    advanced: 'w-3/4',
    expert: 'w-full'
  }
  return widths[level] || 'w-1/2'
}

