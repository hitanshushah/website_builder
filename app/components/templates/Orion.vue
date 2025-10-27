<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRef, watch } from 'vue'
import type { ProcessedTemplateData } from '../../composables/useTemplateData'
import { useTemplateFunctions } from '../../composables/useTemplateFunctions'
import { useContactForm } from '../../composables/useContactForm'

interface Props {
  data: ProcessedTemplateData | null
  primary?: string
  secondary?: string
  background?: string
  fourth?: string
  isPremiumUser?: boolean | false
  brandName?: string
  brandUrl?: string
}

const props = defineProps<Props>()

// Use template functions composable
const dataRef = toRef(props, 'data')
const {
  sortedExperiences,
  sortedEducation,
  getUserInitials,
  getCompanyInitials,
  formatDateRange,
  formatDate,
  formatYear,
  getProficiencyPercentage,
  setFavicon
} = useTemplateFunctions(dataRef)

// Navigation state
const currentSection = ref(0)
const isScrolling = ref(false)
const isMobileMenuOpen = ref(false)

// Total sections will be computed based on visible sections
const totalSections = computed(() => visibleSections.value.length)

// Computed properties
const userProfile = computed(() => props.data?.userProfile)
const skills = computed(() => props.data?.skills || [])
const projects = computed(() => props.data?.projects || [])
const education = computed(() => props.data?.education || [])
const experiences = computed(() => props.data?.experiences || [])
const achievements = computed(() => props.data?.achievements || [])
const certifications = computed(() => props.data?.certifications || [])
const publications = computed(() => props.data?.publications || [])

// Create visible sections based on content availability
const visibleSections = computed(() => {
  const sections = [
    { name: 'About', hasContent: true }, // About section always visible
    { name: 'Experience', hasContent: sortedExperiences.value?.length > 0 },
    { name: 'Projects', hasContent: projects.value?.length > 0 },
    { name: 'Skills', hasContent: (props.data?.skillsByCategory?.length || 0) > 0 },
    { name: 'Education', hasContent: sortedEducation.value?.length > 0 },
    { name: 'Certifications', hasContent: certifications.value?.length > 0 },
    { name: 'Achievements', hasContent: achievements.value?.length > 0 },
    { name: 'Publications', hasContent: publications.value?.length > 0 },
    { name: 'Contact', hasContent: true } // Contact section always visible
  ]
  
  return sections.filter(section => section.hasContent)
})

// Create a map of section names to their indices in the visible sections
const sectionIndices = computed(() => {
  const indices: Record<string, number> = {}
  visibleSections.value.forEach((section, index) => {
    indices[section.name] = index
  })
  return indices
})

// Project modal state
const showProjectModal = ref(false)
const activeProject = ref<any>(null)
const activeIndex = ref(0)

// Contact form state
const contactForm = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// Get project images
const getProjectImages = (assets: any[] = []) =>
  assets
    .filter(
      a =>
        a.asset_type?.key === 'images' ||
        a.type === 'images' ||
        a.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    )
    .map(a => ({ url: a.url || a.filename, display_name: a.display_name || 'Project Image' }))

// Open project image modal
const openProjectModal = (project: any) => {
  activeProject.value = project
  activeIndex.value = 0
  showProjectModal.value = true
}

// Close modal
const closeProjectModal = () => {
  showProjectModal.value = false
  activeProject.value = null
  activeIndex.value = 0
}

// Navigate images
const nextImage = () => {
  if (activeProject.value) {
    const images = getProjectImages(activeProject.value.assets)
    activeIndex.value = (activeIndex.value + 1) % images.length
  }
}

const prevImage = () => {
  if (activeProject.value) {
    const images = getProjectImages(activeProject.value.assets)
    activeIndex.value = activeIndex.value === 0 ? images.length - 1 : activeIndex.value - 1
  }
}

// Use contact form composable
const { sendMessage, isSubmitting, errors, resetForm } = useContactForm()

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success') // 'success' or 'error'

// Toast functions
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const hideToast = () => {
  showToast.value = false
}

// Submit contact form
const submitContactForm = async () => {
  const formDataWithUserId = {
    ...contactForm.value,
    userId: props.data?.userProfile?.user_id
  }
  const success = await sendMessage(formDataWithUserId)
  
  if (success) {
    showToastMessage('Thank you for your message! I will get back to you soon.')
    // Reset form
    contactForm.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
    resetForm()
  } else {
    // Show validation errors
    if (errors.value.name) showToastMessage(`Name: ${errors.value.name}`, 'error')
    if (errors.value.email) showToastMessage(`Email: ${errors.value.email}`, 'error')
    if (errors.value.general) showToastMessage(errors.value.general, 'error')
  }
}

// Navigation functions
const changeSection = (newIndex: number) => {
  if (newIndex < 0 || newIndex >= totalSections.value || isScrolling.value) return
  
  isScrolling.value = true
  
  // Remove active class from all sections
  const allSections = document.querySelectorAll('.section')
  allSections.forEach(section => {
    section.classList.remove('active')
  })
  
  // Remove active class from all nav dots
  const allNavDots = document.querySelectorAll('.nav-dot')
  allNavDots.forEach(dot => {
    dot.classList.remove('active')
  })
  
  // Update current section index
  currentSection.value = newIndex
  
  // Find and activate the section with matching data-index
  const targetSection = document.querySelector(`.section[data-index="${newIndex}"]`)
  if (targetSection) {
    targetSection.classList.add('active')
  }
  
  // Close mobile menu when navigating
  isMobileMenuOpen.value = false
  
  setTimeout(() => {
    isScrolling.value = false
  }, 900)
}

// Mobile menu functions
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Event handlers
const handleWheel = (e: WheelEvent) => {
  if (isScrolling.value) return
  
  const activeSection = document.querySelector('.section.active')
  if (!activeSection) return
  
  const sectionContent = activeSection.querySelector('.section-content')
  if (!sectionContent) {
    e.preventDefault()
    if (e.deltaY > 0) {
      changeSection(currentSection.value + 1)
    } else {
      changeSection(currentSection.value - 1)
    }
    return
  }
  
  // Check if the content is scrollable and at the boundary
  const isAtTop = sectionContent.scrollTop === 0
  const isAtBottom = sectionContent.scrollTop >= sectionContent.scrollHeight - sectionContent.clientHeight
  
  // If scrolling up and at top, or scrolling down and at bottom, change section
  if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
    e.preventDefault()
    if (e.deltaY > 0) {
      changeSection(currentSection.value + 1)
    } else {
      changeSection(currentSection.value - 1)
    }
  }
  // Otherwise, allow normal scrolling within the section
}

const handleKeydown = (e: KeyboardEvent) => {
  if (isScrolling.value) return
  
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    changeSection(currentSection.value + 1)
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    changeSection(currentSection.value - 1)
  }
}

// Touch events
let touchStartY = 0
let touchEndY = 0

const handleTouchStart = (e: TouchEvent) => {
  touchStartY = e.changedTouches[0]?.screenY || 0
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndY = e.changedTouches[0]?.screenY || 0
  handleSwipe()
}

const handleSwipe = () => {
  if (isScrolling.value) return
  
  if (touchStartY - touchEndY > 50) {
    changeSection(currentSection.value + 1)
  } else if (touchEndY - touchStartY > 50) {
    changeSection(currentSection.value - 1)
  }
}

// Intersection Observer for section detection
const setupIntersectionObserver = () => {
  let hasInitialized = false
  
  const observer = new IntersectionObserver(
    (entries) => {
      if (!hasInitialized) {
        // Skip the first few intersection events to let the page settle
        setTimeout(() => {
          hasInitialized = true
        }, 1000)
        return
      }
      
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const sectionIndex = parseInt(entry.target.getAttribute('data-index') || '0')
          // Don't switch to Contact section unless we're actually scrolling to it
          if (sectionIndex !== currentSection.value && !isScrolling.value && sectionIndex !== (totalSections.value - 1)) {
            currentSection.value = sectionIndex
          }
        }
      })
    },
    {
      threshold: 0.6, // Higher threshold to ensure section is more visible
      rootMargin: '-10% 0px -10% 0px' // Add margin to avoid edge cases
    }
  )

  // Observe all sections
  const sections = document.querySelectorAll('.section')
  sections.forEach((section) => {
    observer.observe(section)
  })

  return observer
}

// Store observer reference for cleanup
let observerInstance: IntersectionObserver | null = null

// Track if we're still in initial load phase
const isInitialLoad = ref(true)

// Watch for changes in currentSection to update active states
watch(currentSection, (newIndex) => {
  // During initial load, prevent switching to Contact section
  if (isInitialLoad.value && newIndex === (totalSections.value - 1)) {
    currentSection.value = 0
    return
  }
  
  // Update section active states
  const allSections = document.querySelectorAll('.section')
  allSections.forEach(section => {
    const sectionIndex = parseInt(section.getAttribute('data-index') || '-1')
    if (sectionIndex === newIndex) {
      section.classList.add('active')
    } else {
      section.classList.remove('active')
    }
  })
})

// Lifecycle
onMounted(() => {
  // Add event listeners
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('touchstart', handleTouchStart)
  window.addEventListener('touchend', handleTouchEnd)
  
  // Ensure About section is active on initial load
  currentSection.value = 0
  
  // Force About section to be active on initial load with multiple attempts
  const forceAboutSectionActive = () => {
    // Remove active class from all sections
    const allSections = document.querySelectorAll('.section')
    allSections.forEach(section => {
      section.classList.remove('active')
    })
    
    // Set About section as active
    const aboutSection = document.querySelector('.section[data-index="0"]')
    if (aboutSection) {
      aboutSection.classList.add('active')
    }
    
    // Ensure currentSection is 0
    currentSection.value = 0
  }
  
  // Force About section active immediately
  forceAboutSectionActive()
  
  // Force it again after a short delay
  setTimeout(forceAboutSectionActive, 100)
  
  // Force it again after a longer delay to ensure it sticks
  setTimeout(forceAboutSectionActive, 500)
  
  // Set up intersection observer for section detection after ensuring About is active
  setTimeout(() => {
    observerInstance = setupIntersectionObserver()
    // Mark initial load as complete
    isInitialLoad.value = false
  }, 1000)
  
  // Set favicon
  if (props.data?.userProfile?.name && props.primary && props.background) {
    setFavicon({
      primaryColor: props.primary,
      secondaryColor: props.background,
      name: props.data.userProfile.name
    })
  }
})

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
  
  // Disconnect intersection observer
  if (observerInstance) {
    observerInstance.disconnect()
  }
})

// Skill level mapping
const getSkillLevelWidth = (level: string) => {
  const levels: Record<string, string> = {
    beginner: '25%',
    intermediate: '50%',
    advanced: '75%',
    expert: '100%'
  }
  return levels[level.toLowerCase()] || '50%'
}

const getSkillLevelText = (level: string) => {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

// Color props with fallbacks
const primary = computed(() => props.primary || '#3b82f6')
const secondary = computed(() => props.secondary || '#8b5cf6')
const background = computed(() => props.background || '#1f2937')
const fourth = computed(() => props.fourth || '#10b981')
</script>

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" />
  <div class="fullscreen-portfolio bg-gray-900">
    <!-- Desktop Navigation -->
    <div class="fixed right-8 ml-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-4">
      <div 
        v-for="(section, index) in visibleSections" 
        :key="index"
        :class="[
          'nav-item cursor-pointer transition-all duration-300',
          { active: currentSection === index }
        ]"
        :style="{
          color: currentSection === index ? background : `${background}40`
        }"
        @click="changeSection(index)"
      >
        <span class="text-sm font-semibold whitespace-nowrap">{{ section.name }}</span>
      </div>
    </div>

    <!-- Mobile Hamburger Menu -->
    <div class="lg:hidden fixed top-4 right-4 z-50">
      <!-- Hamburger Button -->
      <button 
        @click="toggleMobileMenu"
        class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-lg"
        :style="{ 
          backgroundColor: `${background}20`, 
          color: background,
          borderColor: `${background}40`
        }"
      >
        <i 
          :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'"
          class="text-xl transition-transform duration-300"
        ></i>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen"
      class="lg:hidden fixed inset-0 z-40 w-screen h-screen"
      :style="{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }"
      @click="closeMobileMenu"
    >
      <!-- Mobile Menu Content -->
      <div 
        class="absolute inset-0 w-full h-full backdrop-blur-lg"
        :style="{ 
          backgroundColor: `${background}95`
        }"
        @click.stop
      >
        <!-- Menu Header -->
        <div class="flex items-center justify-between p-6 border-b" :style="{ borderColor: `${background}40` }">
          <h3 class="text-2xl font-bold" :style="{ color: background }">Navigation</h3>
          <button 
            @click="closeMobileMenu"
            class="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80"
            :style="{ backgroundColor: `${background}20` }"
          >
            <i class="fas fa-times text-xl" :style="{ color: background }"></i>
          </button>
        </div>

        <!-- Menu Items -->
        <div class="p-8 space-y-6 flex-1 overflow-y-auto">
          <div 
            v-for="(section, index) in visibleSections" 
            :key="index"
            :class="[
              'nav-mobile-item cursor-pointer transition-all duration-300 p-2 rounded-xl',
              { 'active': currentSection === index }
            ]"
            :style="{
              backgroundColor: currentSection === index ? `${primary}20` : `${background}10`,
              color: currentSection === index ? primary : background,
              borderColor: currentSection === index ? primary : `${background}30`
            }"
            @click="changeSection(index)"
          >
            <div class="flex items-center gap-4">
              <div 
                class="w-3 h-3 rounded-full transition-all duration-300"
                :style="{ 
                  backgroundColor: currentSection === index ? primary : `${background}60`
                }"
              ></div>
              <span class="text-xl font-semibold">{{ section.name }}</span>
              <i 
                v-if="currentSection === index"
                class="fas fa-check ml-auto text-xl"
                :style="{ color: primary }"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 1: Hero/About -->
    <div class="section active" data-index="0">
      <div class="h-full flex items-center justify-center px-4 md:px-8" :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }">
        <div class="max-w-6xl w-full flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <div class="flex-1 min-w-0 order-2 md:order-1" :style="{ color: background }">
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              {{ userProfile?.name }}
            </h1>
            <p v-if="userProfile?.designation" class="text-xl sm:text-2xl md:text-3xl mb-6" :style="{ color: background }">{{ userProfile.designation }}</p>
            <p v-if="userProfile?.bio" class="text-lg sm:text-xl mb-4 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full" :style="{ color: `${background}` }">
              {{ userProfile.bio }}
            </p>
            <p v-if="userProfile?.introduction && !userProfile?.hide_introduction_on_website" class="text-lg sm:text-xl mb-6 md:mb-8 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full" :style="{ color: `${background}` }">
              {{ userProfile.introduction }}
            </p>
            <div v-if="userProfile?.links?.length" class="flex flex-wrap gap-3 mb-6 md:mb-8">
              <a 
                v-for="link in userProfile.links.slice(0, 2)" 
                :key="link.url"
                :href="link.url" 
                target="_blank" 
                :style="{ backgroundColor: background, color: primary }"
                class="px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition hover:opacity-90 text-sm md:text-base"
              >
                {{ link.title }}
              </a>
            </div>
            <!-- Documents -->
            <div v-if="userProfile?.documents?.length" class="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
              <a 
                v-for="doc in userProfile.documents" 
                :key="doc.id"
                :href="doc.url" 
                target="_blank"
                :style="{ backgroundColor: `${background}20`, color: background, borderColor: background }"
                class="px-3 py-2 md:px-4 md:py-2 rounded-lg transition hover:opacity-90 border backdrop-blur-lg text-sm md:text-base"
              >
                {{ doc.display_name || (doc as any).name || 'Download' }}
              </a>
            </div>
            <div class="flex flex-col gap-2 text-sm md:text-base" :style="{ color: `${background}CC` }">
              <span v-if="userProfile?.city || userProfile?.province || userProfile?.country"><i class="fas fa-map-marker-alt"></i> {{ [userProfile?.city, userProfile?.province, userProfile?.country].filter(Boolean).join(', ') }}</span>
              <span v-if="userProfile?.email"><i class="fas fa-envelope"></i> <a :href="`mailto:${userProfile.email}`" target="_blank" class="hover:underline">{{ userProfile.email }}</a></span>
              <span v-if="userProfile?.phone_number"><i class="fas fa-phone"></i> <a :href="`tel:${userProfile.phone_number}`" target="_blank" class="hover:underline">{{ userProfile.phone_number }}</a></span>
              <span v-if="userProfile?.website_url"><i class="fas fa-globe"></i> <a :href="userProfile.website_url.startsWith('http') ? userProfile.website_url : `https://${userProfile.website_url}`" target="_blank" class="hover:underline">{{ userProfile.website_url.replace(/^https?:\/\//, '') }}</a></span>
              <span v-if="userProfile?.projects_board_url"><i class="fas fa-globe"></i> <a :href="userProfile.projects_board_url.startsWith('http') ? userProfile.projects_board_url : `https://${userProfile.projects_board_url}`" target="_blank" class="hover:underline">{{ userProfile.projects_board_url.replace(/^https?:\/\//, '') }}</a></span>
            </div>
          </div>
          <div class="flex-shrink-0 order-1 md:order-2">
            <img 
              v-if="userProfile?.profile_photo_url"
              :src="userProfile.profile_photo_url" 
              alt="Profile" 
              class="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl border-4 md:border-8" :style="{ borderColor: `${background}33` }"
            >
            <div 
              v-else
              class="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center shadow-2xl border-4 md:border-8"
              :style="{ backgroundColor: `${background}20`, borderColor: `${background}33` }"
            >
              <span class="text-3xl sm:text-4xl md:text-6xl font-bold" :style="{ color: background }">
                {{ getUserInitials }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Experience -->
    <div v-if="sortedExperiences?.length > 0" class="section" :data-index="sectionIndices['Experience']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${secondary}90 0%, ${background}10 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 v-if="sortedExperiences?.length > 0" class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Experience</h2>
          <div class="space-y-8">
            <div 
              v-if="sortedExperiences?.length > 0"
              v-for="(experience, index) in sortedExperiences" 
              :key="index"
              class="backdrop-blur-lg p-8 rounded-2xl border transition"
              :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
              :class="{ 'hover:opacity-90': true }"
            >
              <div class="flex items-start gap-6">
                <div class="flex-1">
                  <h3 class="text-3xl font-bold mb-2" :style="{ color: background }">{{ experience.role }}</h3>
                  <p class="text-xl font-semibold mb-2" :style="{ color: background }">{{ experience.company_name }}</p>
                  <p class="mb-4" :style="{ color: `${background}` }">
                    {{ experience.location }} | {{ formatDateRange(experience.start_date || '', experience.end_date || '') }}
                  </p>
                  <p class="mb-4 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full" :style="{ color: `${background}` }">{{ experience.description }}</p>
                  <div v-if="experience.skills?.length" class="flex flex-wrap gap-2">
                    <span 
                      v-for="skill in experience.skills" 
                      :key="skill"
                      :style="{ backgroundColor: `${primary}20`, color: background }"
                      class="px-4 py-2 rounded-full"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Projects -->
    <div v-if="projects?.length > 0" class="section" :data-index="sectionIndices['Projects']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${fourth} 0%, ${secondary}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 v-if="projects?.length > 0" class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Projects</h2>
          <div v-if="data?.userProfile.projects_board_url" class="flex justify-center items-center mb-12">
            <a :href="`https://${data.userProfile.projects_board_url}`" target="_blank" class="text-lg shadow-lg hover:underline break-all px-4 py-2 rounded-lg transition-all duration-300" :style="{ color: background, backgroundColor: secondary }">
              View all projects
            </a>
          </div>
          <div class="grid md:grid-cols-2 gap-8">
            <div 
              v-if="projects?.length > 0"
              v-for="(project, index) in projects" 
              :key="index"
              class="backdrop-blur-lg rounded-2xl overflow-hidden border transition"
              :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
              :class="{ 'hover:opacity-90': true }"
            >
              <div class="p-6">
                <div class="flex items-center gap-4 mb-4">
                  <!-- Small Circular Project Image -->
                  <div 
                    v-if="getProjectImages(project.assets).length"
                    class="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group flex-shrink-0" :style="{ borderColor: `${background}33` }"
                    @click="openProjectModal(project)"
                  >
                    <img 
                      :src="getProjectImages(project.assets)[0]?.url" 
                      :alt="project.name" 
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div 
                      class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      :style="{ backgroundColor: `${background}80` }"
                    >
                      <i class="fas fa-images text-sm" :style="{ color: background }"></i>
                    </div>
                    <!-- Image Count Badge -->
                    <div 
                      v-if="getProjectImages(project.assets).length > 1"
                      class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      :style="{ backgroundColor: primary, color: background }"
                    >
                      {{ getProjectImages(project.assets).length }}
                    </div>
                  </div>
                  <!-- Fallback Initial -->
                  <div 
                    v-else
                    class="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    :style="{ backgroundColor: `${primary}20` }"
                  >
                    <span class="text-2xl font-bold" :style="{ color: primary }">
                      {{ project.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <h3 class="text-3xl font-bold" :style="{ color: background }">{{ project.name }}</h3>
                      <span 
                        v-if="project.category"
                        :style="{ backgroundColor: `${secondary}`, color: background }"
                        class="px-4 py-2 rounded-full"
                      >
                        {{ project.category }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- See More Button -->
                <div v-if="getProjectImages(project.assets).length" class="mb-4">
                  <a 
                    @click="openProjectModal(project)"
                    class=" text-sm transition underline cursor-pointer" :style="{ color: primary }"
                  >
                    See More Images →
                </a>
                </div>
                <p class="mb-4 whitespace-pre-wrap" :style="{ color: `${background}` }">{{ project.description }}</p>
                <div v-if="project.technologies?.length" class="flex flex-wrap gap-2 mb-4">
                  <span 
                    v-for="tech in project.technologies" 
                    :key="tech"
                    :style="{ backgroundColor: `${background}50`, color: `${background}` }"
                    class="px-3 py-1 rounded-full text-sm"
                  >
                    {{ tech }}
                  </span>
                </div>
                <div v-if="project.links?.length" class="flex gap-4 mt-4">
                  <a 
                    v-for="link in project.links" 
                    :key="link.url"
                    :href="link.url" 
                    target="_blank" 
                    :style="{ color: background, borderColor: background }"
                    class="hover:opacity-80 font-semibold transition border backdrop-blur-lg px-4 py-2 rounded-full mt-4"
                  >
                    {{ link.title }} →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Skills -->
    <div v-if="(props.data?.skillsByCategory?.length || 0) > 0" class="section" :data-index="sectionIndices['Skills']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${fourth}80 0%, ${secondary}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 v-if="(props.data?.skillsByCategory?.length || 0) > 0" class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Skills</h2>
          <div class="space-y-10">
            <div 
              v-if="(props.data?.skillsByCategory?.length || 0) > 0"
              v-for="(categoryGroup, index) in props.data?.skillsByCategory" 
              :key="index"
            >
              <h3 class="text-3xl font-semibold mb-6 mt-8" :style="{ color: background }">{{ categoryGroup[0] }}</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div 
                  v-for="skill in categoryGroup[1]" 
                  :key="skill.id"
                  class="backdrop-blur-lg p-6 rounded-xl border"
                  :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
                >
                  <div class="flex justify-between mb-3">
                    <span class="text-xl font-semibold" :style="{ color: background }">{{ skill.name }}</span>
                    <span :style="{ color: background }">{{ getSkillLevelText(skill.proficiency_level || '') }}</span>
                  </div>
                  <div class="w-full rounded-full h-3" :style="{ backgroundColor: `${background}50` }">
                    <div 
                      class="h-3 rounded-full transition-all duration-500"
                      :style="{ width: getSkillLevelWidth(skill.proficiency_level || ''), background: primary }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 5: Education -->
    <div v-if="sortedEducation?.length > 0" class="section" :data-index="sectionIndices['Education']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${primary}80 0%, ${fourth}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 v-if="sortedEducation?.length > 0"  class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Education</h2>
          <div class="space-y-6">
            <div 
              v-if="sortedEducation?.length > 0"
              v-for="(edu, index) in sortedEducation" 
              :key="index"
              class="backdrop-blur-lg p-8 rounded-2xl border transition"
              :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
              :class="{ 'hover:opacity-90': true }"
            >
              <h3 class="text-3xl font-bold mb-2" :style="{ color: background }">{{ edu.degree }}, <span class="text-xl font-semibold" :style="{ color: background }">{{ edu.university_name }}</span></h3>
              <p class="mb-2" :style="{ color: `${background}` }">{{ edu.location }}, {{ formatDateRange(edu.from_date || null, edu.end_date || null) }}</p>
              <div 
                v-if="edu.cgpa"
                :style="{ backgroundColor: `${fourth}`, color: background }"
                class="inline-block px-4 py-2 rounded-full font-semibold"
              >
                Grade: {{ edu.cgpa }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 6: Certifications -->
    <div v-if="certifications?.length > 0" class="section" :data-index="sectionIndices['Certifications']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${secondary}80 0%, ${primary} 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 v-if="certifications?.length > 0" class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Certifications</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div 
              v-if="certifications?.length > 0"
              v-for="(cert, index) in certifications" 
              :key="index"
              class="backdrop-blur-lg rounded-2xl overflow-hidden border transition"
              :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
              :class="{ 'hover:opacity-90': true }"
            >
              <div class="p-8">
                <div class="flex items-start gap-6 mb-4">
                  <div class="flex-1">
                    <h3 class="text-3xl font-bold mb-2" :style="{ color: background }">{{ cert.name }}</h3>
                    <p v-if="cert.institute_name" class="text-xl font-semibold mb-2" :style="{ color: background }">{{ cert.institute_name }}</p>
                    <p v-if="cert.description" class="mb-4 leading-relaxed whitespace-pre-wrap" :style="{ color: `${background}` }">{{ cert.description }}</p>
                    <div v-if="cert.start_date || cert.end_date" class="text-sm mb-4" :style="{ color: `${background}` }">
                      {{ formatDateRange(cert.start_date || null, cert.end_date || null) }}
                    </div>
                    <div v-if="cert.certificate_pdf" class="flex gap-4">
                      <a 
                        :href="cert.certificate_pdf" 
                        target="_blank" 
                        :style="{ color: background }"
                        class="hover:opacity-80 font-semibold transition border backdrop-blur-lg px-4 py-2 rounded-full mt-4"
                      >
                        View Certificate →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 7: Achievements -->
    <div v-if="achievements?.length > 0" class="section" :data-index="sectionIndices['Achievements']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${background}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 v-if="achievements?.length > 0" class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Achievements</h2>
          <div class="max-w-4xl mx-auto">
            <ul class="space-y-4">
              <li 
                v-if="achievements?.length > 0"
                v-for="(achievement, index) in achievements" 
                :key="index"
                class="flex items-start gap-4"
              >
                <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1" :style="{ backgroundColor: background }">
                </div>
                <p class="text-xl leading-relaxed font-bold whitespace-pre-wrap" :style="{ color: background }">{{ achievement.description }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 8: Publications -->
    <div v-if="publications?.length > 0" class="section" :data-index="sectionIndices['Publications']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${fourth}80 0%, ${secondary}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 v-if="publications?.length > 0" class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Publications</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div 
              v-if="publications?.length > 0"
              v-for="(pub, index) in publications" 
              :key="index"
              class="backdrop-blur-lg rounded-2xl overflow-hidden border transition"
              :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
              :class="{ 'hover:opacity-90': true }"
            >
              <div class="p-8">
                <div class="flex items-start gap-6 mb-4">
                  <div class="flex-1">
                    <h3 class="text-3xl font-bold mb-2" :style="{ color: background }">{{ pub.paper_name }}</h3>
                    <p v-if="pub.conference_name" class="text-xl font-semibold mb-2" :style="{ color: background }">{{ pub.conference_name }}</p>
                    <p v-if="pub.description" class="mb-4 leading-relaxed whitespace-pre-wrap" :style="{ color: `${background}` }">{{ pub.description }}</p>
                    <div v-if="pub.published_date" class="text-sm mb-4" :style="{ color: `${background}` }">
                      Published: {{ formatDate(pub.published_date || '') }}
                    </div>
                    <div class="flex gap-4">
                      <a 
                        v-if="pub.paper_pdf"
                        :href="pub.paper_pdf" 
                        target="_blank" 
                        :style="{ color: background }"
                        class="hover:opacity-80 font-semibold transition border backdrop-blur-lg px-4 py-2 rounded-full mt-4"
                      >
                        View PDF →
                      </a>
                      <a 
                        v-if="pub.paper_link"
                        :href="pub.paper_link" 
                        target="_blank" 
                        :style="{ color: background }"
                        class="hover:opacity-80 font-semibold transition border backdrop-blur-lg px-4 py-2 rounded-full mt-4"
                      >
                        View Paper →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 9: Contact -->
    <div class="section" :data-index="sectionIndices['Contact']">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${fourth} 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <div class="text-center mb-12">
            <h2 class="text-6xl font-bold mb-8" :style="{ color: background }">Get In Touch</h2>
          </div>
          
          <div class="grid md:grid-cols-2 gap-16 items-start">
            <!-- Contact Form -->
            <div class="space-y-6">
              <h3 class="text-3xl font-bold mb-6" :style="{ color: background }">Send Message</h3>
              <form @submit.prevent="submitContactForm" class="space-y-6">
                <div>
                  <label class="block text-lg font-semibold mb-2" :style="{ color: background }">Name</label>
                  <input 
                    v-model="contactForm.name"
                    type="text" 
                    required
                    class="w-full px-4 py-3 rounded-lg border backdrop-blur-lg transition focus:outline-none focus:ring-2"
                    :style="{ 
                      backgroundColor: `${background}20`, 
                      borderColor: `${background}40`,
                      color: background
                    }"
                    placeholder="Your name"
                  >
                </div>
                
                <div>
                  <label class="block text-lg font-semibold mb-2" :style="{ color: background }">Email</label>
                  <input 
                    v-model="contactForm.email"
                    type="email" 
                    required
                    class="w-full px-4 py-3 rounded-lg border backdrop-blur-lg transition focus:outline-none focus:ring-2"
                    :style="{ 
                      backgroundColor: `${background}20`, 
                      borderColor: `${background}40`,
                      color: background
                    }"
                    placeholder="your.email@example.com"
                  >
                </div>
                
                <div>
                  <label class="block text-lg font-semibold mb-2" :style="{ color: background }">Message</label>
                  <textarea 
                    v-model="contactForm.message"
                    required
                    rows="5"
                    class="w-full px-4 py-3 rounded-lg border backdrop-blur-lg transition focus:outline-none focus:ring-2 resize-none"
                    :style="{ 
                      backgroundColor: `${background}20`, 
                      borderColor: `${background}40`,
                      color: background
                    }"
                    placeholder="Tell me about your project or just say hello!"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full px-8 py-4 rounded-lg text-xl font-semibold transition hover:opacity-90 disabled:opacity-50"
                  :style="{ backgroundColor: background, color: primary }"
                >
                  <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-3"></i>
                  <i v-else class="fas fa-paper-plane mr-3"></i>
                  {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                </button>
              </form>
            </div>
            
            <!-- Contact Info -->
            <div class="space-y-8">
              <h3 class="text-3xl font-bold mb-6" :style="{ color: background }">Contact Info</h3>
              
              <div class="space-y-6">
                <div v-if="userProfile?.email" class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: `${background}20` }">
                    <i class="fas fa-envelope text-xl" :style="{ color: background }"></i>
                  </div>
                  <div>
                    <p class="font-semibold" :style="{ color: background }">Email</p>
                    <a :href="`mailto:${userProfile.email}`" class="hover:underline" :style="{ color: `${background}CC` }">
                      {{ userProfile.email }}
                    </a>
                  </div>
                </div>
                
                <div v-if="userProfile?.phone_number" class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: `${background}20` }">
                    <i class="fas fa-phone text-xl" :style="{ color: background }"></i>
                  </div>
                  <div>
                    <p class="font-semibold" :style="{ color: background }">Phone</p>
                    <a :href="`tel:${userProfile.phone_number}`" class="hover:underline" :style="{ color: `${background}CC` }">
                      {{ userProfile.phone_number }}
                    </a>
                  </div>
                </div>
                
                <div v-if="userProfile?.city || userProfile?.province || userProfile?.country" class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: `${background}20` }">
                    <i class="fas fa-map-marker-alt text-xl" :style="{ color: background }"></i>
                  </div>
                  <div>
                    <p class="font-semibold" :style="{ color: background }">Location</p>
                    <p :style="{ color: `${background}CC` }">
                      {{ [userProfile?.city, userProfile?.province, userProfile?.country].filter(Boolean).join(', ') }}
                    </p>
                  </div>
                </div>
                <div v-if="userProfile?.website_url" class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: `${background}20` }">
                    <i class="fas fa-globe text-xl" :style="{ color: background }"></i>
                  </div>
                  <div>
                    <p class="font-semibold" :style="{ color: background }">Website</p>
                    <a :href="userProfile.website_url.startsWith('http') ? userProfile.website_url : `https://${userProfile.website_url}`" target="_blank" class="hover:underline" :style="{ color: `${background}CC` }">{{ userProfile.website_url.replace(/^https?:\/\//, '') }}</a>
                  </div>
                </div>
                <div v-if="userProfile?.projects_board_url" class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: `${background}20` }">
                    <i class="fas fa-globe text-xl" :style="{ color: background }"></i>
                  </div>
                  <div>
                    <p class="font-semibold" :style="{ color: background }">Projects Board</p>
                    <a :href="userProfile.projects_board_url.startsWith('http') ? userProfile.projects_board_url : `https://${userProfile.projects_board_url}`" target="_blank" class="hover:underline" :style="{ color: `${background}CC` }">{{ userProfile.projects_board_url.replace(/^https?:\/\//, '') }}</a>
                  </div>
                </div>
              </div>
              
              <!-- Social Links -->
              <div v-if="userProfile?.links?.length" class="pt-6">
                <h4 class="text-xl font-semibold mb-4" :style="{ color: background }">Connect With Me</h4>
                <div class="flex flex-wrap gap-3">
                  <a 
                    v-for="link in userProfile.links" 
                    :key="link.url"
                    :href="link.url" 
                    target="_blank"
                    :style="{ 
                      backgroundColor: `${background}20`, 
                      color: background,
                      borderColor: `${background}40`
                    }"
                    class="px-4 py-2 rounded-full border backdrop-blur-lg transition hover:opacity-90 font-semibold"
                  >
                    {{ link.title }}
                  </a>
                </div>
              </div>
              <p v-if="!isPremiumUser">Powered by <a :href="brandUrl" target="_blank" class="hover:underline">{{ brandName }}</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Images Modal -->
    <div 
      v-if="showProjectModal && activeProject" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      :style="{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }"
      @click="closeProjectModal"
    >
      <div 
        class="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl"
        :style="{ backgroundColor: background }"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b" :style="{ borderColor: `${background}20` }">
          <h3 class="text-2xl font-bold" :style="{ color: background }">{{ activeProject?.name }}</h3>
          <button 
            @click="closeProjectModal"
            class="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80"
            :style="{ backgroundColor: `${background}20` }"
          >
            <i class="fas fa-times" :style="{ color: background }"></i>
          </button>
        </div>

        <!-- Image Display -->
        <div v-if="getProjectImages(activeProject?.assets).length > 0" class="relative">
          <img 
            :src="getProjectImages(activeProject?.assets)[activeIndex]?.url" 
            :alt="activeProject?.name"
            class="w-full h-96 object-cover"
          >
          
          <!-- Navigation Buttons -->
          <button 
            v-if="getProjectImages(activeProject.assets).length > 1"
            @click="prevImage"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full transition-all flex items-center justify-center shadow-lg"
            :style="{ backgroundColor: `${background}90`, color: background }"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button 
            v-if="getProjectImages(activeProject.assets).length > 1"
            @click="nextImage"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full transition-all flex items-center justify-center shadow-lg"
            :style="{ backgroundColor: `${background}90`, color: background }"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Image Counter -->
          <div 
            v-if="getProjectImages(activeProject.assets).length > 1" 
            class="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-sm"
            :style="{ backgroundColor: `${background}70`, color: background }"
          >
            {{ activeIndex + 1 }} / {{ getProjectImages(activeProject.assets).length }}
          </div>
        </div>

        <!-- Thumbnail Navigation -->
        <div v-if="getProjectImages(activeProject.assets).length > 1" class="p-4 border-t" :style="{ borderColor: `${background}20` }">
          <div class="flex gap-2 overflow-x-auto">
            <button 
              v-for="(image, index) in getProjectImages(activeProject.assets)"
              :key="index"
              @click="activeIndex = index"
              class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
              :class="{ 'opacity-100': activeIndex === index, 'opacity-60': activeIndex !== index }"
              :style="{ borderColor: activeIndex === index ? primary : `${background}40` }"
            >
              <img 
                :src="image.url" 
                :alt="`Thumbnail ${index + 1}`"
                class="w-full h-full object-cover"
              >
            </button>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-6 border-t" :style="{ borderColor: `${background}20` }">
          <p v-if="activeProject?.description" class="mb-4 whitespace-pre-wrap" :style="{ color: background }">{{ activeProject?.description }}</p>
          <div v-if="activeProject?.links?.length" class="flex gap-4">
            <a 
              v-for="link in activeProject?.links" 
              :key="link.url"
              :href="link.url" 
              target="_blank" 
              :style="{ backgroundColor: primary, color: background }"
              class="px-4 py-2 rounded-lg font-semibold transition hover:opacity-90"
            >
              {{ link.title }} →
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div 
    v-if="showToast"
    class="fixed bottom-8 right-8 bg-gray-800 text-white px-5 py-4 rounded-lg shadow-lg opacity-0 pointer-events-none transform translate-y-5 transition-all duration-300 ease-in-out flex items-center gap-3 z-50"
    :class="{ 'opacity-100 translate-y-0 pointer-events-auto': showToast }"
    :style="{ 
      boxShadow: toastType === 'success' ? '0 0 15px rgba(34, 197, 94, 0.3)' : '0 0 15px rgba(239, 68, 68, 0.3)',
      borderLeft: toastType === 'success' ? '4px solid #22c55e' : '4px solid #ef4444'
    }"
  >
    <div class="flex items-center gap-3">
      <div v-if="toastType === 'success'" class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <div v-else class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <span class="text-sm font-medium">{{ toastMessage }}</span>
    </div>
    <button 
      @click="hideToast"
      class="ml-2 text-gray-300 hover:text-white transition-colors"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.fullscreen-portfolio {
  min-height: 100vh;
  position: relative;
  isolation: isolate;
}

.section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  pointer-events: none;
  z-index: 1;
}

.section.active {
  opacity: 1;
  pointer-events: auto;
  z-index: 2;
}

.section-content {
  max-height: 100vh;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.section-content::-webkit-scrollbar {
  width: 6px;
}

.section-content::-webkit-scrollbar-track {
  background: transparent;
}

.section-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.section-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.fullscreen-portfolio > .fixed {
  position: fixed;
  z-index: 100;
}

.nav-item {
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 50;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item:hover {
  transform: translateX(-4px);
  opacity: 0.9;
}

.nav-item.active {
  transform: translateX(-8px);
}

/* Mobile Navigation Styles */
.nav-mobile-item {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.nav-mobile-item:hover {
  transform: translateX(4px);
  opacity: 0.9;
}

.nav-mobile-item.active {
  transform: translateX(8px);
}

/* Ensure mobile menu covers full screen */
@media (max-width: 1023px) {
  /* Mobile menu overlay - full screen */
  .lg\:hidden.fixed[class*="inset"] {
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Hamburger button - top right */
  .lg\:hidden.fixed:not([class*="inset"]) {
    top: 1rem !important;
    right: 1rem !important;
    left: auto !important;
    bottom: auto !important;
    width: auto !important;
    height: auto !important;
  }
}

/* Adjust navigation for smaller screens */
@media (max-width: 1024px) {
  .nav-item {
    max-width: 120px;
  }
  
  .nav-item span {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .fullscreen-portfolio > .fixed {
    right: 1rem !important;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-item {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.4;
    max-width: none;
  }
  
  .nav-item.active {
    opacity: 1;
    transform: scale(1.5);
  }
  
  .nav-item:hover {
    transform: scale(1.2);
  }
  
  /* Adjust hamburger menu position to not overlap with nav dots */
  .lg\:hidden.fixed {
    top: 1rem;
    right: 1rem;
  }
}

.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}

.max-w-full {
  max-width: 100%;
}

@media (min-width: 1px) {
  .fullscreen-portfolio {
    contain: layout;
  }
  
  .fullscreen-portfolio > .fixed {
    position: absolute !important;
  }
}

@media (min-width: 1px) {
  body:has(.fullscreen-portfolio:only-child) .fullscreen-portfolio > .fixed,
  html:has(.fullscreen-portfolio:only-child) .fullscreen-portfolio > .fixed {
    position: fixed !important;
  }
}
</style>
