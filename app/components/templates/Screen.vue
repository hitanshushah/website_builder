<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRef } from 'vue'
import type { ProcessedTemplateData } from '../../composables/useTemplateData'
import { useTemplateFunctions } from '../../composables/useTemplateFunctions'

interface Props {
  data: ProcessedTemplateData | null
  primary?: string
  secondary?: string
  background?: string
  fourth?: string
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
  getProficiencyPercentage
} = useTemplateFunctions(dataRef)

// Navigation state
const currentSection = ref(0)
const totalSections = 9
const isScrolling = ref(false)

// Section names for navigation
const sectionNames = [
  'About',
  'Experience',
  'Projects',
  'Skills',
  'Education',
  'Certifications',
  'Achievements',
  'Publications',
  'Contact'
]

// Computed properties
const userProfile = computed(() => props.data?.userProfile)
const skills = computed(() => props.data?.skills || [])
const projects = computed(() => props.data?.projects || [])
const education = computed(() => props.data?.education || [])
const experiences = computed(() => props.data?.experiences || [])
const achievements = computed(() => props.data?.achievements || [])
const certifications = computed(() => props.data?.certifications || [])
const publications = computed(() => props.data?.publications || [])

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
const isSubmitting = ref(false)

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

// Submit contact form
const submitContactForm = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Create mailto link with form data
    const subject = encodeURIComponent(contactForm.value.subject)
    const body = encodeURIComponent(
      `Name: ${contactForm.value.name}\n\n` +
      `Email: ${contactForm.value.email}\n\n` +
      `Message:\n${contactForm.value.message}`
    )
    
    const mailtoLink = `mailto:${userProfile.value?.email}?subject=${subject}&body=${body}`
    
    // Open email client
    window.open(mailtoLink, '_blank')
    
    // Reset form
    contactForm.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
    
    // Show success message (you could add a toast notification here)
    alert('Your email client will open with the message pre-filled. Please send the email to complete your message.')
    
  } catch (error) {
    console.error('Error submitting contact form:', error)
    alert('There was an error opening your email client. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Navigation functions
const changeSection = (newIndex: number) => {
  if (newIndex < 0 || newIndex >= totalSections || isScrolling.value) return
  
  isScrolling.value = true
  
  const sections = document.querySelectorAll('.section')
  const navDots = document.querySelectorAll('.nav-dot')
  
  if (sections[currentSection.value]) {
    sections[currentSection.value].classList.remove('active')
  }
  if (navDots[currentSection.value]) {
    navDots[currentSection.value].classList.remove('active')
  }
  
  currentSection.value = newIndex
  
  if (sections[currentSection.value]) {
    sections[currentSection.value].classList.add('active')
  }
  if (navDots[currentSection.value]) {
    navDots[currentSection.value].classList.add('active')
  }
  
  setTimeout(() => {
    isScrolling.value = false
  }, 900)
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
  touchStartY = e.changedTouches[0].screenY
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndY = e.changedTouches[0].screenY
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

// Lifecycle
onMounted(() => {
  // Add event listeners
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('touchstart', handleTouchStart)
  window.addEventListener('touchend', handleTouchEnd)
  
  // Navigation is now handled directly in template with @click handlers
})

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
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
  <div class="fullscreen-portfolio bg-gray-900">
    <!-- Navigation Section Names -->
    <div class="fixed right-8 ml-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-4">
      <div 
        v-for="(sectionName, index) in sectionNames" 
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
        <span class="text-sm font-semibold whitespace-nowrap">{{ sectionName }}</span>
      </div>
    </div>

    <!-- Section 1: Hero/About -->
    <div class="section active" data-index="0">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }">
        <div class="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12">
          <div class="flex-1 min-w-0" :style="{ color: background }">
            <h1 class="text-6xl md:text-7xl font-bold mb-4">
              {{ userProfile?.name }}
            </h1>
            <p v-if="userProfile?.designation" class="text-3xl mb-6" :style="{ color: background }">{{ userProfile.designation }}</p>
            <p v-if="userProfile?.bio" class="text-xl mb-4 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full" :style="{ color: `${background}` }">
              {{ userProfile.bio }}
            </p>
            <p v-if="userProfile?.introduction && !userProfile?.hide_introduction_on_website" class="text-xl mb-8 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full" :style="{ color: `${background}` }">
              {{ userProfile.introduction }}
            </p>
            <div v-if="userProfile?.links?.length" class="flex gap-4 mb-8">
              <a 
                v-for="link in userProfile.links.slice(0, 2)" 
                :key="link.url"
                :href="link.url" 
                target="_blank" 
                :style="{ backgroundColor: background, color: primary }"
                class="px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
              >
                {{ link.title }}
              </a>
            </div>
            <!-- Documents -->
            <div v-if="userProfile?.documents?.length" class="flex flex-wrap gap-3 mb-8">
              <a 
                v-for="doc in userProfile.documents" 
                :key="doc.id"
                :href="doc.url" 
                target="_blank"
                :style="{ backgroundColor: `${background}20`, color: background, borderColor: background }"
                class="px-4 py-2 rounded-lg transition hover:opacity-90 border backdrop-blur-lg"
              >
                {{ doc.display_name || doc.name || 'Download' }}
              </a>
            </div>
            <div class="flex flex-col gap-2" :style="{ color: `${background}CC` }">
              <span v-if="userProfile?.city || userProfile?.province || userProfile?.country"><i class="fas fa-map-marker-alt"></i> {{ [userProfile?.city, userProfile?.province, userProfile?.country].filter(Boolean).join(', ') }}</span>
              <span v-if="userProfile?.email"><i class="fas fa-envelope"></i> {{ userProfile.email }}</span>
              <span v-if="userProfile?.phone_number"><i class="fas fa-phone"></i> {{ userProfile.phone_number }}</span>
            </div>
          </div>
          <div class="flex-shrink-0">
            <img 
              v-if="userProfile?.profile_photo_url"
              :src="userProfile.profile_photo_url" 
              alt="Profile" 
              class="w-80 h-80 rounded-full object-cover shadow-2xl border-8" :style="{ borderColor: `${background}33` }"
            >
            <div 
              v-else
              class="w-80 h-80 rounded-full flex items-center justify-center shadow-2xl border-8"
              :style="{ backgroundColor: `${background}20`, borderColor: `${background}33` }"
            >
              <span class="text-6xl font-bold" :style="{ color: background }">
                {{ getUserInitials(userProfile) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Experience -->
    <div class="section" data-index="1">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${secondary}90 0%, ${background}10 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Experience</h2>
          <div class="space-y-8">
            <div 
              v-for="(experience, index) in sortedExperiences" 
              :key="index"
              class="backdrop-blur-lg p-8 rounded-2xl border transition"
              :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
              :class="{ 'hover:opacity-90': true }"
            >
              <div class="flex items-start gap-6">
                <div class="flex-1">
                  <h3 class="text-3xl font-bold mb-2" :style="{ color: background }">{{ experience.role }}</h3>
                  <p class="text-xl font-semibold mb-2" :style="{ color: primary }">{{ experience.company_name }}</p>
                  <p class="mb-4" :style="{ color: `${background}` }">
                    {{ experience.location }} | {{ formatDateRange(experience.start_date, experience.end_date) }}
                  </p>
                  <p class="mb-4 leading-relaxed" :style="{ color: `${background}` }">{{ experience.description }}</p>
                  <div v-if="experience.skills?.length" class="flex flex-wrap gap-2">
                    <span 
                      v-for="skill in experience.skills" 
                      :key="skill"
                      :style="{ backgroundColor: `${primary}20`, color: primary }"
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
    <div class="section" data-index="2">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${fourth} 0%, ${secondary}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Projects</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div 
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
                <p class="mb-4" :style="{ color: `${background}` }">{{ project.description }}</p>
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
    <div class="section" data-index="3">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${fourth}80 0%, ${secondary}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Skills</h2>
          <div class="space-y-10">
            <div 
              v-for="(categoryGroup, index) in data?.skillsByCategory" 
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
                    <span :style="{ color: background }">{{ getSkillLevelText(skill.proficiency_level) }}</span>
                  </div>
                  <div class="w-full rounded-full h-3" :style="{ backgroundColor: `${background}50` }">
                    <div 
                      class="h-3 rounded-full transition-all duration-500"
                      :style="{ width: getSkillLevelWidth(skill.proficiency_level), background: primary }"
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
    <div class="section" data-index="4">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${primary}80 0%, ${fourth}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Education</h2>
          <div class="space-y-6">
            <div 
              v-for="(edu, index) in sortedEducation" 
              :key="index"
              class="backdrop-blur-lg p-8 rounded-2xl border transition"
              :style="{ backgroundColor: `${background}10`, borderColor: `${background}33` }"
              :class="{ 'hover:opacity-90': true }"
            >
              <h3 class="text-3xl font-bold mb-2" :style="{ color: background }">{{ edu.degree }}, <span class="text-xl font-semibold" :style="{ color: background }">{{ edu.university_name }}</span></h3>
              <p class="mb-2" :style="{ color: `${background}` }">{{ edu.location }}, {{ formatDateRange(edu.from_date, edu.end_date) }}</p>
              <div 
                v-if="edu.cgpa"
                :style="{ backgroundColor: `${fourth}`, color: background }"
                class="inline-block px-4 py-2 rounded-full font-semibold"
              >
                CGPA: {{ edu.cgpa }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 6: Certifications -->
    <div class="section" data-index="5">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${secondary}80 0%, ${primary} 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Certifications</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div 
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
                    <p v-if="cert.description" class="mb-4 leading-relaxed" :style="{ color: `${background}` }">{{ cert.description }}</p>
                    <div v-if="cert.start_date || cert.end_date" class="text-sm mb-4" :style="{ color: `${background}` }">
                      {{ formatDateRange(cert.start_date, cert.end_date) }}
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
    <div class="section" data-index="6">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${background}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Achievements</h2>
          <div class="max-w-4xl mx-auto">
            <ul class="space-y-4">
              <li 
                v-for="(achievement, index) in achievements" 
                :key="index"
                class="flex items-start gap-4"
              >
                <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1" :style="{ backgroundColor: background }">
                </div>
                <p class="text-xl leading-relaxed font-bold" :style="{ color: background }">{{ achievement.description }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 8: Publications -->
    <div class="section" data-index="7">
      <div class="h-full flex items-center justify-center px-8" :style="{ background: `linear-gradient(135deg, ${fourth}80 0%, ${secondary}80 100%)` }">
        <div class="section-content max-w-6xl w-full py-12 overflow-y-auto">
          <h2 class="text-5xl font-bold mb-12 text-center" :style="{ color: background }">Publications</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div 
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
                    <p v-if="pub.description" class="mb-4 leading-relaxed" :style="{ color: `${background}` }">{{ pub.description }}</p>
                    <div v-if="pub.published_date" class="text-sm mb-4" :style="{ color: `${background}` }">
                      Published: {{ formatDate(pub.published_date) }}
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
    <div class="section" data-index="8">
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
          <h3 class="text-2xl font-bold" :style="{ color: background }">{{ activeProject.name }}</h3>
          <button 
            @click="closeProjectModal"
            class="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80"
            :style="{ backgroundColor: `${background}20` }"
          >
            <i class="fas fa-times" :style="{ color: background }"></i>
          </button>
        </div>

        <!-- Image Display -->
        <div v-if="getProjectImages(activeProject.assets).length > 0" class="relative">
          <img 
            :src="getProjectImages(activeProject.assets)[activeIndex].url" 
            :alt="activeProject.name"
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
          <p v-if="activeProject.description" class="mb-4" :style="{ color: background }">{{ activeProject.description }}</p>
          <div v-if="activeProject.links?.length" class="flex gap-4">
            <a 
              v-for="link in activeProject.links" 
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
</template>

<style scoped>
.fullscreen-portfolio {
  height: 100vh;
}

.section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  pointer-events: none;
}

.section.active {
  opacity: 1;
  pointer-events: auto;
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

.nav-item {
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-item:hover {
  transform: translateX(-4px);
  opacity: 0.9;
}

.nav-item.active {
  transform: translateX(-8px);
}

/* Text wrapping utilities */
.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}

.max-w-full {
  max-width: 100%;
}
</style>
