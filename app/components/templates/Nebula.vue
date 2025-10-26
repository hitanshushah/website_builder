<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRef } from 'vue'
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

// State management
const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const activeSection = ref('home')
const showBackToTop = ref(false)
const activeFilter = ref('all')
// Project modal
const showProjectModal = ref(false)
const activeProject = ref<any>(null)
const activeIndex = ref(0)

// Contact form
const contactForm = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

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

// Contact form handler
const handleContactSubmit = async () => {
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

// Computed properties
const navigationSections = computed(() => {
  const sections = ['home', 'about']
  if (props.data?.experiences?.length) sections.push('experience')
  if (props.data?.education?.length) sections.push('education')
  if (props.data?.projects?.length) sections.push('projects')
  if (props.data?.skillsByCategory?.length) sections.push('skills')
  if (props.data?.certifications?.length || props.data?.achievements?.length) sections.push('certifications')
  if (props.data?.publications?.length) sections.push('publications')
  sections.push('contact')
  return sections
})

const filteredProjects = computed(() => {
  if (!props.data?.projects) return []
  return activeFilter.value === 'all' 
    ? props.data.projects 
    : props.data.projects.filter(p => p.category === activeFilter.value)
})

const projectCategories = computed(() => {
  if (!props.data?.projects) return []
  return [...new Set(props.data.projects.map(p => p.category))]
})

// Helper functions
const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeSection.value = id
    mobileMenuOpen.value = false
  }
}

const getSocialIcon = (type: string) => {
  const typeLower = type.toLowerCase()
  if (typeLower.includes('linkedin')) return 'fab fa-linkedin-in'
  if (typeLower.includes('github')) return 'fab fa-github'
  if (typeLower.includes('twitter')) return 'fab fa-twitter'
  if (typeLower.includes('instagram')) return 'fab fa-instagram'
  if (typeLower.includes('facebook')) return 'fab fa-facebook'
  if (typeLower.includes('youtube')) return 'fab fa-youtube'
  return 'fas fa-link'
}

// Project modal functions
const getProjectImages = (assets: any[] = []) =>
  assets
    .filter(
      a =>
        a.asset_type?.key === 'images' ||
        a.type === 'images' ||
        a.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    )
    .map(a => ({ url: a.url || a.filename, display_name: a.display_name || 'Project Image' }))

const openProjectModal = (project: any) => {
  activeProject.value = project
  activeIndex.value = 0
  showProjectModal.value = true
}

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

// Scroll event handler
const handleScroll = () => {
  scrolled.value = window.scrollY > 50
  showBackToTop.value = window.scrollY > 300
  
  // Update active section based on scroll position
  const sections = navigationSections.value
  const scrollOffset = 100 // Account for navbar height and padding
  
  // Find the section that's most visible in the viewport
  let activeSectionId = 'home' // Default fallback
  
  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const rect = element.getBoundingClientRect()
      // Check if the section is in the viewport with some offset
      if (rect.top <= scrollOffset && rect.bottom > scrollOffset) {
        activeSectionId = section
        break
      }
    }
  }
  
  activeSection.value = activeSectionId
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  
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
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen" style="font-family: 'Poppins', sans-serif;">
    <!-- Navigation -->
    <nav
      class="sticky top-0 z-40 py-4 transition-all duration-300"
      :class="[
        scrolled 
          ? 'shadow-lg bg-opacity-70 backdrop-blur-none lg:backdrop-blur-md' 
          : 'bg-gradient-to-r',
      ]"
      :style="{
        background: scrolled 
          ? background 
          : `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
      }"
    >
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div class="text-lg md:text-2xl font-bold"
          :style="scrolled ? { color: fourth } : { color: background }"
          >{{data?.userProfile.name}}</div>
        
        <button 
          class="lg:hidden p-2"
          :style="scrolled ? { color: fourth } : { color: background }"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <i class="fas fa-bars text-xl md:text-2xl"></i>
        </button>
        
        <div class="hidden lg:flex items-center gap-8">
          <button 
            v-for="section in navigationSections"
            :key="section"
            @click="scrollToSection(section)"
            class="font-medium capitalize transition-opacity hover:opacity-80 cursor-pointer"
            :class="[
              activeSection === section ? 'px-4 py-2 rounded-lg' : ''
            ]"
            :style="{
              color: scrolled ? fourth : background,
              ...(activeSection === section ? { background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background } : {})
            }"
          >
            {{ section }}
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" :style="{ background: fourth }" class="lg:hidden fixed inset-0 bg-opacity-95 z-40 flex flex-col items-center justify-center gap-6">
        <button 
          class="absolute top-6 right-6 text-3xl"
          :style="{ color: background }"
          @click="mobileMenuOpen = false"
        >
          <i class="fas fa-times"></i>
        </button>
        <button 
          v-for="section in navigationSections"
          :key="section"
          @click="scrollToSection(section)"
          class="text-2xl font-medium capitalize hover:opacity-80 cursor-pointer"
          :class="activeSection === section ? 'px-6 py-3 rounded-lg' : ''"
          :style="activeSection === section ? { background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background } : { color: background }"
        >
          {{ section }}
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section 
      id="home"
      class="min-h-[60vh] md:min-h-screen flex items-center relative overflow-hidden"
      :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
    >
      <div class="max-w-7xl mx-auto px-4 w-full md:-mt-24">
        <!-- Mobile Layout: Image first, then text -->
        <div class="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <!-- Profile Image - shown first on mobile -->
          <div class="flex justify-center order-1 md:order-2">
            <div class="relative">
              <div v-if="data?.userProfile.profile_photo_url" class="w-48 h-48 md:w-80 md:h-80 rounded-full border-4 md:border-8 shadow-2xl overflow-hidden" :style="{borderColor: background}">
                <img 
                  :src="data.userProfile.profile_photo_url" 
                  :alt="data.userProfile.name"
                  class="w-full h-full object-cover"
                >
              </div>
              <div v-else class="w-48 h-48 md:w-80 md:h-80 rounded-full border-4 md:border-8 shadow-2xl flex items-center justify-center text-4xl md:text-6xl font-bold bg-opacity-20" :style="{ color: fourth, backgroundColor: background, borderColor: background }">
                {{ getUserInitials }}
              </div>
            </div>
          </div>
          
          <!-- Text Content - shown second on mobile -->
          <div class="order-2 md:order-1 text-center md:text-left">
            <h1 class="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6">
              Hey!, I'm {{ data?.userProfile.name?.split(' ')[0]}}
            </h1>
            <p class="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90">
             I'm a {{ data?.userProfile.designation }}
            </p>
            <button 
              @click="scrollToSection('contact')"
              class="rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold hover:scale-105 transition-transform shadow-lg text-sm md:text-base cursor-pointer"
              :style="{ color: primary, backgroundColor: background }"
            >
              Get in Touch <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute bottom-0 w-full">
        <path :fill="background" fill-opacity="1" d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,202.7C960,192,1056,96,1152,74.7C1248,53,1344,107,1392,133.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </section>

    <!-- About Section -->
    <section 
      id="about"
      class="py-20 relative"
      :style="{ backgroundColor: background }"
    >
      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">About Me</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-12 items-start">
          <!-- Left Column - Profile Photo and Documents -->
          <div class="space-y-8 hidden md:block">
            <!-- Profile Photo -->
            <div class="flex justify-center">
              <div v-if="data?.userProfile.profile_photo_url" class="w-64 h-64 md:w-96 md:h-96 rounded-2xl shadow-2xl overflow-hidden">
                <img 
                  :src="data.userProfile.profile_photo_url" 
                  :alt="data.userProfile.name"
                  class="w-full h-full object-cover"
                >
              </div>
              <div v-else 
                class="w-64 h-64 md:w-96 md:h-96 rounded-2xl shadow-2xl flex items-center justify-center text-5xl md:text-7xl font-bold"
                :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
              >
                {{ getUserInitials }}
              </div>
            </div>

            <!-- Social Links -->
            <div v-if="data?.userProfile.links?.length" class="text-center">
              <div class="flex justify-center gap-4">
                <a 
                  v-for="link in data.userProfile.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  class="text-3xl hover:scale-110 transition-transform"
                  :style="{ color: primary }"
                >
                  <i :class="getSocialIcon(link.type)"></i>
                </a>
              </div>
            </div>

            <!-- Documents Section -->
            <div v-if="data?.userProfile.documents?.length" class="text-center">
              <div class="flex flex-wrap justify-center gap-3">
                <a 
                  v-for="doc in data.userProfile.documents" 
                  :key="doc.id"
                  :href="doc.url" 
                  target="_blank"
                  class="py-2.5 px-5 rounded-[30px] shadow-lg hover:opacity-90 transition-opacity duration-200"
                  :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
                >
                  {{ doc.display_name || doc.name || 'Download' }}
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column - Personal Info -->
          <div>
            <h2 class="text-4xl font-bold mb-3" :style="{ color: fourth }">{{ data?.userProfile.name }}</h2>
            <h3 
              class="text-2xl mb-6 font-semibold"
              :style="{ color: primary }"
            >
              I'm a {{ data?.userProfile.designation }}
            </h3>
            
            <!-- Bio and Introduction -->
            <div class="space-y-4 mb-6">
              <p v-if="data?.userProfile.bio" class="text-lg leading-relaxed break-all overflow-hidden" :style="{ color: fourth, wordBreak: 'break-all', overflowWrap: 'anywhere', hyphens: 'auto' }">
                {{ data.userProfile.bio }}
              </p>
              <p v-if="data?.userProfile.introduction" class="text-lg leading-relaxed break-all overflow-hidden" :style="{ color: fourth, wordBreak: 'break-all', overflowWrap: 'anywhere', hyphens: 'auto' }">
                {{ data.userProfile.introduction }}
              </p>
            </div>

            <div v-if="data?.userProfile.links?.length" class="text-center block md:hidden mb-4">
              <div class="flex justify-start gap-4">
                <a 
                  v-for="link in data.userProfile.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  class="text-3xl hover:scale-110 transition-transform"
                  :style="{ color: primary }"
                >
                  <i :class="getSocialIcon(link.type)"></i>
                </a>
              </div>
            </div>
            
            <!-- Contact Information -->
            <div class="space-y-3">
              <div v-if="data?.userProfile.city || data?.userProfile.province || data?.userProfile.country" class="flex items-center gap-3">
                <i class="fas fa-map-marker-alt text-xl" :style="{ color: primary }"></i>
                <span class="text-lg" :style="{ color: fourth }">
                  {{ [data?.userProfile.city, data?.userProfile.province, data?.userProfile.country].filter(Boolean).join(', ') }}
                </span>
              </div>
              <div v-if="data?.userProfile.email" class="flex items-center gap-3">
                <i class="fas fa-envelope text-xl" :style="{ color: primary }"></i>
                <a :href="`mailto:${data.userProfile.email}`" class="text-lg hover:underline break-all" :style="{ color: fourth }">
                  {{ data.userProfile.email }}
                </a>
              </div>
              <div v-if="data?.userProfile.phone_number" class="flex items-center gap-3">
                <i class="fas fa-phone text-xl" :style="{ color: primary }"></i>
                <a :href="`tel:${data.userProfile.phone_number}`" class="text-lg hover:underline" :style="{ color: fourth }">
                  {{ data.userProfile.phone_number }}
                </a>
              </div>
              <div v-if="data?.userProfile.website_url" class="flex items-center gap-3">
                <i class="fas fa-globe text-xl" :style="{ color: primary }"></i>
                <a :href="`https://${data.userProfile.website_url}`" target="_blank" class="text-lg hover:underline break-all" :style="{ color: fourth }">
                  {{ data.userProfile.website_url.replace(/^https?:\/\//, '') }}
                </a>
              </div>
              <div v-if="data?.userProfile.projects_board_url" class="flex items-center gap-3">
                <i class="fas fa-globe text-xl" :style="{ color: primary }"></i>
                <a :href="`https://${data.userProfile.projects_board_url}`" target="_blank" class="text-lg hover:underline break-all" :style="{ color: fourth }">
                  {{ data.userProfile.projects_board_url.replace(/^https?:\/\//, '') }}
                </a>
              </div>
            </div>

            <!-- Documents Section -->
            <div v-if="data?.userProfile.documents?.length" class="text-center mt-4 mb-4 block md:hidden">
              <div class="flex flex-wrap justify-start gap-3">
                <a 
                  v-for="doc in data.userProfile.documents" 
                  :key="doc.id"
                  :href="doc.url" 
                  target="_blank"
                  class="py-2.5 px-5 rounded-[30px] shadow-lg hover:opacity-90 transition-opacity duration-200 border-2"
                  :style="{ background: background, color: primary, borderColor: primary }"
                >
                  {{ doc.display_name || doc.name || 'Download' }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    <section 
      id="experience"
      v-if="data?.experiences?.length"
      class="py-20 relative"
      :style="{ backgroundColor: background }"
    >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute top-0 w-full" style="margin-top: -60px;">
        <path 
            :fill="primary" 
            fill-opacity="0.2" 
            d="M0,64
            C48,48,96,32,192,32
            C288,32,384,48,480,64
            C576,80,672,96,768,80
            C864,64,960,32,1056,48
            C1152,64,1248,112,1344,112
            C1392,112,1416,96,1440,80
            L1440,192
            L1392,176
            C1344,160,1248,128,1152,122.7
            C1056,117,960,139,864,138.7
            C768,139,672,117,576,122.7
            C480,128,384,160,288,160
            C192,160,96,128,48,112
            L0,96
            Z" />
        </svg>
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">Experience</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <div class="relative">
          <div class="absolute hidden md:block left-8 md:left-12 top-0 bottom-0 w-0.5" :style="{ backgroundColor: primary }"></div>
          
          <div class="space-y-12">
            <div v-for="exp in sortedExperiences" :key="exp.id" class="relative pl-2 md:pl-24">
              <div 
                class="absolute hidden md:block left-4 md:left-8 top-0 w-8 h-8 rounded-full border-4 shadow-lg"
                :style="{ backgroundColor: primary, borderColor: background }"
              ></div>
              <div class="rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow" :style="{ backgroundColor: background }">
                <div class="flex items-start gap-4 mb-4">
                  <div class="flex-1">
                    <h3 class="text-2xl font-bold mb-1" :style="{ color: primary }">{{ exp.role }}, <span class="text-xl font-normal italic" :style="{ color: fourth }">{{ exp.company_name }}</span></h3>
                    <p class="text-sm mb-1 opacity-70" :style="{ color: fourth }">
                      {{ formatDateRange(exp.start_date, exp.end_date) }}
                    </p>
                    <p v-if="exp.location" class="text-sm flex items-center gap-1 opacity-70" :style="{ color: fourth }">
                      <i class="fas fa-map-marker-alt"></i> {{ exp.location }}
                    </p>
                  </div>
                </div>
                <p v-if="exp.description" class="mb-4 break-all overflow-hidden" :style="{ color: fourth, wordBreak: 'break-all', overflowWrap: 'anywhere', hyphens: 'auto' }">{{ exp.description }}</p>
                <div v-if="exp.skills?.length" class="flex flex-wrap gap-2">
                  <span 
                    v-for="skill in exp.skills"
                    :key="skill"
                    class="px-4 py-1.5 rounded-full text-sm font-medium"
                    :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Education Section -->
    <section 
      id="education"
      v-if="data?.education?.length"
      class="py-20 relative overflow-hidden"
      :style="{ backgroundColor: background }"
    >
      
      <!-- Wave Background -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute top-0 w-full" style="margin-top: 160px;">
        <path 
            :fill="primary" 
            fill-opacity="0.7" 
            d="M0,64
            C48,48,96,32,192,32
            C288,32,384,48,480,64
            C576,80,672,96,768,80
            C864,64,960,32,1056,48
            C1152,64,1248,112,1344,112
            C1392,112,1416,96,1440,80
            L1440,192
            L1392,176
            C1344,160,1248,128,1152,122.7
            C1056,117,960,139,864,138.7
            C768,139,672,117,576,122.7
            C480,128,384,160,288,160
            C192,160,96,128,48,112
            L0,96
            Z" />
        </svg>



      
      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">Education</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <div class="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          <div v-for="edu in sortedEducation" :key="edu.id" class="rounded-xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all" :style="{ backgroundColor: background }">
            <div class="text-center mb-6">
              <i class="fas fa-graduation-cap text-5xl mb-4" :style="{ color: primary }"></i>
              <h3 class="text-2xl font-bold mb-2" :style="{ color: fourth }">{{ edu.degree }}</h3>
              <h4 class="text-lg mb-4 opacity-70" :style="{ color: fourth }">{{ edu.university_name }}</h4>
            </div>
            <div class="space-y-2 text-center">
              <div v-if="edu.cgpa" class="text-sm" :style="{ color: fourth }">
                <span class="font-semibold">Grade:</span> {{ edu.cgpa }}
              </div>
              <div v-if="edu.location" class="text-sm flex items-center justify-center gap-1" :style="{ color: fourth }">
                <i class="fas fa-map-marker-alt" :style="{ color: primary }"></i> {{ edu.location }}
              </div>
              <div class="text-sm pt-2 opacity-60" :style="{ color: fourth }">
                {{ formatDateRange(edu.from_date, edu.end_date) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Wave -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute bottom-0 w-full">
        <path 
            :fill="secondary" 
            fill-opacity="0.7" 
            d="M0,224 
            L48,213.3 
            C96,203,192,181,288,181.3 
            C384,181,480,203,576,213.3 
            C672,224,768,224,864,208 
            C960,192,1056,160,1152,138.7 
            C1248,117,1344,107,1392,101.3 
            L1440,96 
            V280 
            C1392,300,1248,320,1152,300 
            C1056,280,960,240,864,250 
            C768,260,672,300,576,310 
            C480,320,384,300,288,290 
            C192,280,96,300,48,310 
            C24,315,12,318,0,320 
            Z" />
        </svg>

    </section>

        <!-- Projects Section -->
        <section 
      id="projects"
      v-if="data?.projects?.length"
      class="py-20 relative overflow-hidden"
      :style="{ backgroundColor: background }"
    >
      
      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">Projects</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <div class="flex justify-center gap-3 mb-12 flex-wrap">
          <button 
            @click="activeFilter = 'all'"
            class="px-6 py-2 rounded-full font-medium transition-all border-2 cursor-pointer"
            :style="activeFilter === 'all' ? { 
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, 
              color: background, 
              borderColor: 'transparent' 
            } : { 
              color: primary, 
              borderColor: primary, 
              backgroundColor: 'transparent' 
            }"
          >
            All
          </button>
          <button 
            v-for="category in projectCategories"
            :key="category"
            @click="activeFilter = category"
            class="px-6 py-2 rounded-full font-medium transition-all border-2 cursor-pointer"
            :style="activeFilter === category ? { 
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, 
              color: background, 
              borderColor: 'transparent' 
            } : { 
              color: primary, 
              borderColor: primary, 
              backgroundColor: 'transparent' 
            }"
          >
            {{ category }}
          </button>
        </div>
        
        <div class="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          <div v-for="project in filteredProjects" :key="project.id" class="rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all" :style="{ backgroundColor: background }">
            <div class="p-6">
              <h4 class="text-2xl font-bold mb-2" :style="{ color: fourth }">{{ project.name }}</h4>
              <p class="text-sm mb-3 opacity-60" :style="{ color: fourth }">{{ project.category }}</p>
              <p v-if="project.description" class="mb-4 break-all overflow-hidden" :style="{ color: fourth, wordBreak: 'break-all', overflowWrap: 'anywhere', hyphens: 'auto' }">{{ project.description }}</p>
              <div v-if="project.technologies?.length" class="flex flex-wrap gap-2 mb-4">
                <span 
                  v-for="tech in project.technologies.slice(0, 3)"
                  :key="tech"
                  class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100"
                  :style="{ color: fourth }"
                >
                  {{ tech }}
                </span>
                <span 
                  v-if="project.technologies.length > 3"
                  class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100"
                  :style="{ color: fourth }"
                >
                  +{{ project.technologies.length - 3 }}
                </span>
              </div>
              <div class="flex gap-2 flex-wrap">
                <a 
                  v-for="link in project.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  class="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
                >
                  {{ link.title }}
                </a>
                <button 
                  v-if="getProjectImages(project.assets).length > 0"
                  @click="openProjectModal(project)"
                  class="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                  :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
                >
                  <i class="fas fa-images mr-1"></i>Explore
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="data?.userProfile.projects_board_url" class="flex justify-center items-center mt-16">
                <a :href="`https://${data.userProfile.projects_board_url}`" target="_blank" class="text-lg shadow-lg hover:underline break-all px-4 py-2 rounded-lg transition-all duration-300 border-2" :style="{ color: primary, backgroundColor: background, borderColor: primary }">
                  View all projects
                </a>
              </div>
      </div>      
      <!-- Background Wave Pattern -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute bottom-0 w-full">
  <defs>
    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" :style="{ stopColor: primary, stopOpacity: 1 }" />
      <stop offset="50%" :style="{ stopColor: primary, stopOpacity: 0.3 }" />
      <stop offset="100%" :style="{ stopColor: primary, stopOpacity: 0.1 }" />
    </linearGradient>
  </defs>

  <!-- Layer 1 (gradient main) -->
  <path 
    fill="url(#waveGradient)" 
    d="M0,80
       C48,64,96,48,192,48
       C288,48,384,64,480,80
       C576,96,672,112,768,96
       C864,80,960,48,1056,64
       C1152,80,1248,128,1344,128
       C1392,128,1416,112,1440,96
       L1440,240
       C1392,260,1248,280,1152,260
       C1056,240,960,200,864,210
       C768,220,672,260,576,270
       C480,280,384,260,288,250
       C192,240,96,260,48,270
       C24,275,12,278,0,280Z" />

  <!-- Layer 2 -->
  <path 
    :fill="primary" 
    fill-opacity="0.05" 
    d="M0,96
       C48,80,96,64,192,64
       C288,64,384,80,480,96
       C576,112,672,128,768,112
       C864,96,960,64,1056,80
       C1152,96,1248,144,1344,144
       C1392,144,1416,128,1440,112
       L1440,256
       C1392,276,1248,296,1152,276
       C1056,256,960,216,864,226
       C768,236,672,276,576,286
       C480,296,384,276,288,266
       C192,256,96,276,48,286
       C24,291,12,294,0,296Z" />

  <!-- Layer 3 -->
  <path 
    :fill="primary" 
    fill-opacity="0.08" 
    d="M0,112
       C48,96,96,80,192,80
       C288,80,384,96,480,112
       C576,128,672,144,768,128
       C864,112,960,80,1056,96
       C1152,112,1248,160,1344,160
       C1392,160,1416,144,1440,128
       L1440,272
       C1392,292,1248,312,1152,292
       C1056,272,960,232,864,242
       C768,252,672,292,576,302
       C480,312,384,292,288,282
       C192,272,96,292,48,302
       C24,307,12,310,0,312Z" />

  <!-- Layer 4 -->
  <path 
    :fill="primary" 
    fill-opacity="0.03" 
    d="M0,128
       C48,112,96,96,192,96
       C288,96,384,112,480,128
       C576,144,672,160,768,144
       C864,128,960,96,1056,112
       C1152,128,1248,176,1344,176
       C1392,176,1416,160,1440,144
       L1440,288
       C1392,308,1248,328,1152,308
       C1056,288,960,248,864,258
       C768,268,672,308,576,318
       C480,328,384,308,288,298
       C192,288,96,308,48,318
       C24,323,12,326,0,328Z" />
</svg>

    </section>

    <!-- Skills Section -->
    <section 
      id="skills"
      v-if="data?.skillsByCategory?.length"
      class="py-20 relative"
      :style="{ backgroundColor: background }"
    >
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">Skills</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-8">
          <div v-for="[category, skills] in data.skillsByCategory" :key="category" class="rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow" :style="{ backgroundColor: background }">
            <h3 class="text-3xl font-bold mb-6 text-center" :style="{ color: primary }">
              {{ category }}
            </h3>
            <div class="space-y-6">
              <div v-for="skill in skills" :key="skill.id">
                <div class="flex justify-between mb-2">
                  <span class="font-semibold" :style="{ color: fourth }">{{ skill.name }}</span>
                  <span class="text-sm capitalize opacity-70" :style="{ color: fourth }">{{ skill.proficiency_level }}</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all"
                    :style="{ 
                      width: `${getProficiencyPercentage(skill.proficiency_level)}%`,
                      background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>



    <!-- Achievements Section -->
    <section 
      id="certifications"
      v-if="data?.certifications?.length || data?.achievements?.length"
      class="py-20 relative"
      :style="{ backgroundColor: background }"
    >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute top-0 w-full" style="margin-top: -60px;">
        <path 
            :fill="primary" 
            fill-opacity="0.2" 
            d="M0,64
            C48,48,96,32,192,32
            C288,32,384,48,480,64
            C576,80,672,96,768,80
            C864,64,960,32,1056,48
            C1152,64,1248,112,1344,112
            C1392,112,1416,96,1440,80
            L1440,192
            L1392,176
            C1344,160,1248,128,1152,122.7
            C1056,117,960,139,864,138.7
            C768,139,672,117,576,122.7
            C480,128,384,160,288,160
            C192,160,96,128,48,112
            L0,96
            Z" />
        </svg>
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">Certifications</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <!-- Certifications -->
        <div v-if="data?.certifications?.length" class="mb-16">
          <h2 class="text-4xl font-bold text-center mb-12" :style="{ color: fourth }">Certifications</h2>
          <div class="grid lg:grid-cols-2 gap-8">
            <div v-for="cert in data.certifications" :key="cert.id" class="rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow" :style="{ backgroundColor: background }">
              <div class="flex items-start gap-4 mb-4">
                <div class="flex-1">
                  <h3 class="text-2xl font-bold mb-1" :style="{ color: fourth }">{{ cert.name }}</h3>
                  <h4 class="text-lg opacity-70 mb-3" :style="{ color: fourth }">{{ cert.institute_name }}</h4>
                </div>
              </div>
              <p v-if="cert.description" class="mb-4" :style="{ color: fourth }">{{ cert.description }}</p>
              <div class="flex justify-between items-center">
                <span class="text-sm opacity-60" :style="{ color: fourth }">{{ formatDate(cert.start_date) }}</span>
                <a 
                  v-if="cert.certificate_pdf"
                  :href="cert.certificate_pdf"
                  target="_blank"
                  class="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
                >
                  <i class="fas fa-download mr-1"></i>View Certificate
                </a>
              </div>
            </div>
          </div>
        </div>
        
         <!-- Achievements -->
         <div v-if="data?.achievements?.length">
           <h2 class="text-4xl font-bold text-center mb-12" :style="{ color: fourth }">Achievements</h2>
           <div class="max-w-4xl mx-auto">
             <ul class="space-y-4">
               <li v-for="achievement in data.achievements" :key="achievement.id" class="flex items-start gap-4">
                 <div class="flex-shrink-0 mt-1">
                   <i class="fas fa-trophy text-lg" :style="{ color: primary }"></i>
                 </div>
                 <p class="text-lg leading-relaxed" :style="{ color: fourth }">{{ achievement.description }}</p>
               </li>
             </ul>
           </div>
         </div>
      </div>
    </section>

        <!-- Publications Section -->
        <section 
      id="publications"
      v-if="data?.publications?.length"
      class="py-20 relative"
      :style="{ backgroundColor: background }"
    >
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">Publications</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-8">
          <div v-for="pub in data.publications" :key="pub.id" style="z-index: 10" class="opacity-85 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow" :style="{ backgroundColor: background }">
            <div class="flex items-start gap-4 mb-4">
              <div class="flex-shrink-0">
                <i class="fas fa-file-alt text-4xl" :style="{ color: primary }"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-2xl font-bold mb-2" :style="{ color: fourth }">{{ pub.paper_name }}</h3>
                <p v-if="pub.conference_name" class="text-lg mb-2 font-semibold uppercase opacity-70" :style="{ color: primary }">{{ pub.conference_name }}</p>
                <p v-if="pub.description" class="text-sm leading-relaxed mb-3" :style="{ color: fourth }">{{ pub.description }}</p>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fas fa-calendar text-sm" :style="{ color: primary }"></i>
                <span class="text-sm" :style="{ color: fourth }">{{ formatYear(pub.published_date) }}</span>
              </div>
              
              <div class="flex gap-2">
                <a 
                  v-if="pub.paper_pdf"
                  :href="pub.paper_pdf"
                  target="_blank"
                  class="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
                >
                  <i class="fas fa-file-pdf mr-1"></i>View PDF
                </a>
                <a 
                  v-if="pub.paper_link"
                  :href="pub.paper_link.startsWith('http') ? pub.paper_link : `https://${pub.paper_link}`"
                  target="_blank"
                  class="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
                >
                  <i class="fas fa-external-link-alt mr-1"></i>View Paper
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute bottom-0 w-full">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :style="{ stopColor: primary, stopOpacity: 1 }" />
            <stop offset="50%" :style="{ stopColor: primary, stopOpacity: 0.3 }" />
            <stop offset="100%" :style="{ stopColor: primary, stopOpacity: 0.1 }" />
          </linearGradient>
        </defs>
        <path fill="url(#waveGradient)" d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,202.7C960,192,1056,96,1152,74.7C1248,53,1344,107,1392,133.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        <path :fill="primary" fill-opacity="0.15" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        <path :fill="primary" fill-opacity="0.08" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        <path :fill="primary" fill-opacity="0.03" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,112C672,128,768,192,864,208C960,224,1056,192,1152,176C1248,160,1344,144,1392,136L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </section>
    <!-- Contact Section -->
    <section 
      id="contact"
      class="py-20 relative"
      :style="{ backgroundColor: background }"
    >

      <div class="max-w-7xl mx-auto px-4 mt-10">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold mb-4" :style="{ color: fourth }">Get In Touch</h1>
          <div 
            class="h-1 w-20 mx-auto rounded-full"
            :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }"
          ></div>
        </div>
        
        <div class="max-w-2xl mx-auto rounded-2xl shadow-2xl p-8 relative z-10" :style="{ backgroundColor: background }">
          <form @submit.prevent="handleContactSubmit" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <input 
                type="text" 
                v-model="contactForm.name"
                placeholder="Name" 
                required
                class="w-full px-4 py-3 rounded-lg border-0 shadow-md focus:outline-none focus:ring-2"
                :style="{ '--tw-ring-color': primary, color: fourth }"
              >
              <input 
                type="email" 
                v-model="contactForm.email"
                placeholder="Email Address" 
                required
                class="w-full px-4 py-3 rounded-lg border-0 shadow-md focus:outline-none focus:ring-2"
                :style="{ '--tw-ring-color': primary, color: fourth }"
              >
            </div>
            <input 
              type="text" 
              v-model="contactForm.subject"
              placeholder="Subject" 
              class="w-full px-4 py-3 rounded-lg border-0 shadow-md focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': primary, color: fourth }"
            >
            <textarea 
              v-model="contactForm.message"
              placeholder="Message" 
              rows="6" 
              required
              class="w-full px-4 py-3 rounded-lg border-0 shadow-md focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': primary, color: fourth }"
            ></textarea>
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="w-full rounded-full py-4 font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-paper-plane mr-2"></i>
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute top-0 w-full z-0">
        <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :style="{ stopColor: fourth, stopOpacity: 1 }" />
            <stop offset="50%" :style="{ stopColor: primary, stopOpacity: 0.3 }" />
            <stop offset="100%" :style="{ stopColor: primary, stopOpacity: 0.1 }" />
            </linearGradient>
        </defs>
        <g transform="scale(1,-1) translate(0,-320)">
            <path fill="url(#waveGradient)" d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,202.7C960,192,1056,96,1152,74.7C1248,53,1344,107,1392,133.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path :fill="primary" fill-opacity="0.15" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path :fill="primary" fill-opacity="0.08" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path :fill="primary" fill-opacity="0.03" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,112C672,128,768,192,864,208C960,224,1056,192,1152,176C1248,160,1344,144,1392,136L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </g>
        </svg>
    </section>

    <!-- Footer -->
    <footer class="py-12 relative" :style="{ background: `linear-gradient(135deg, ${primary} 30%, ${secondary} 70%)`, color: background }">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-3xl font-bold mb-4">{{ data?.userProfile.name }}</h3>
        <div class="space-y-2 mb-6">
          <div v-if="data?.userProfile.email">
            <i class="fas fa-envelope mr-2" :style="{ color: background }"></i>
            <a :href="`mailto:${data.userProfile.email}`" class="hover:underline">{{ data.userProfile.email }}</a>
          </div>
          <div v-if="data?.userProfile.phone_number">
            <i class="fas fa-phone mr-2" :style="{ color: background }"></i>
            <a :href="`tel:${data.userProfile.phone_number}`" class="hover:underline">{{ data.userProfile.phone_number }}</a>
          </div>
          <div v-if="data?.userProfile.website_url">
            <i class="fas fa-globe mr-2" :style="{ color: background }"></i>
            <a :href="data.userProfile.website_url.startsWith('http') ? data.userProfile.website_url : `https://${data.userProfile.website_url}`" target="_blank" class="hover:underline">{{ data.userProfile.website_url.replace(/^https?:\/\//, '') }}</a>
          </div>
          <div v-if="data?.userProfile.projects_board_url">
            <i class="fas fa-globe mr-2" :style="{ color: background }"></i>
            <a :href="data.userProfile.projects_board_url.startsWith('http') ? data.userProfile.projects_board_url : `https://${data.userProfile.projects_board_url}`" target="_blank" class="hover:underline">{{ data.userProfile.projects_board_url.replace(/^https?:\/\//, '') }}</a>
          </div>
        </div>
        <div v-if="data?.userProfile.links?.length" class="flex justify-center gap-6 mb-6">
          <a 
            v-for="link in data.userProfile.links"
            :key="link.url"
            :href="link.url"
            target="_blank"
            class="text-2xl hover:opacity-80 transition-opacity"
            :style="{ color: background }"
          >
            <i :class="getSocialIcon(link.type)"></i>
          </a>
        </div>
        <p class="opacity-60">© {{ new Date().getFullYear() }} {{ data?.userProfile.name }}. All rights reserved.</p>
        <p v-if="!isPremiumUser">Powered by <a :href="brandUrl" target="_blank" class="hover:underline">{{ brandName }}</a></p>
      </div>
    </footer>

    <!-- Back to Top -->
    <button 
      v-if="showBackToTop"
      @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
      class="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center z-50"
      :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, color: background }"
    >
      <i class="fas fa-chevron-up"></i>
    </button>

    <!-- Project Modal -->
    <div 
      v-if="showProjectModal && activeProject"
      @click="showProjectModal = false"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div class="rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" :style="{ backgroundColor: background }" @click.stop>
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-3xl font-bold" :style="{ color: fourth }">{{ activeProject.name }}</h3>
          <button 
            @click="showProjectModal = false"
            class="text-2xl hover:opacity-70 transition-opacity"
            :style="{ color: fourth }"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="getProjectImages(activeProject.assets).length > 0" class="mb-6">
            <div class="relative">
              <img 
                :src="getProjectImages(activeProject.assets)[activeIndex].url" 
                :alt="activeProject.name"
                class="w-full h-96 object-cover rounded-lg"
              >
              
              <!-- Navigation Arrows -->
              <button 
                v-if="getProjectImages(activeProject.assets).length > 1"
                @click="prevImage"
                class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-opacity-90 hover:bg-opacity-100 transition-all flex items-center justify-center shadow-lg"
                :style="{ backgroundColor: background }"
              >
                <i class="fas fa-chevron-left text-xl" :style="{ color: primary }"></i>
              </button>
              <button 
                v-if="getProjectImages(activeProject.assets).length > 1"
                @click="nextImage"
                class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-opacity-90 hover:bg-opacity-100 transition-all flex items-center justify-center shadow-lg"
                :style="{ backgroundColor: background }"
              >
                <i class="fas fa-chevron-right text-xl" :style="{ color: primary }"></i>
              </button>
              
              <!-- Image Counter -->
              <div v-if="getProjectImages(activeProject.assets).length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm" :style="{ color: background }">
                {{ activeIndex + 1 }} / {{ getProjectImages(activeProject.assets).length }}
              </div>
            </div>
            
            <!-- Thumbnail Navigation -->
            <div v-if="getProjectImages(activeProject.assets).length > 1" class="flex gap-2 mt-4 overflow-x-auto">
              <button 
                v-for="(image, index) in getProjectImages(activeProject.assets)"
                :key="index"
                @click="activeIndex = index"
                class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                :class="activeIndex === index ? 'border-blue-500' : 'border-gray-200'"
              >
                <img :src="image.url" :alt="image.display_name" class="w-full h-full object-cover">
              </button>
            </div>
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css');

.animate-ping-slow {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
