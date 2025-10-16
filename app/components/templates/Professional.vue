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

// State management
const isScrolled = ref(false)
const showProjectModal = ref(false)
const activeProject = ref<any>(null)
const activeIndex = ref(0)
const carousel = ref<any>()
const isMobileMenuOpen = ref(false)

// Contact form state
const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// Scroll tracking
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
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

const onProjectSelect = (i: number) => {
  activeIndex.value = i
}

const selectProjectImage = (i: number) => {
  activeIndex.value = i
  carousel.value?.emblaApi?.scrollTo(i)
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

// Contact form handler
const handleSubmit = async () => {
  const formDataWithUserId = {
    ...formData.value,
    userId: props.data?.userProfile?.user_id
  }
  const success = await sendMessage(formDataWithUserId)
  
  if (success) {
    // Create mailto link with form data
    const email = !props.data?.userProfile.override_email && props.data?.userProfile.email 
      ? props.data.userProfile.email 
      : props.data?.userProfile.secondary_email
    
    if (email) {
      const subject = encodeURIComponent(formData.value.subject)
      const body = encodeURIComponent(
        `Name: ${formData.value.name}\nEmail: ${formData.value.email}\n\nMessage:\n${formData.value.message}`
      )
      
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`
      window.location.href = mailtoLink
      
      // Reset form
      formData.value = {
        name: '',
        email: '',
        subject: '',
        message: ''
      }
      resetForm()
      
      // Show success message
      showToastMessage('Thank you for your message! I will get back to you soon.')
    }
  } else {
    // Show validation errors
    if (errors.value.name) showToastMessage(`Name: ${errors.value.name}`, 'error')
    if (errors.value.email) showToastMessage(`Email: ${errors.value.email}`, 'error')
    if (errors.value.general) showToastMessage(errors.value.general, 'error')
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


// Color CSS variables
const colorVars = computed(() => ({
  '--primary-color': props.primary || '#2563eb',
  '--secondary-color': props.secondary || '#7c3aed',
  '--background-color': props.background || '#f8fafc',
  '--fourth-color': props.fourth || '#64748b',
}))

// Smooth scroll to section
const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    // Close mobile menu when navigating
    isMobileMenuOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div
    v-if="data"
    class="professional-template min-h-screen"
    :style="colorVars"
  >
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" />
    <!-- Navigation -->
    <nav class="shadow-md sticky w-full top-0 z-50 transition-all duration-300" :class="isScrolled ? 'shadow-lg' : ''" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div href="#about" @click.prevent="scrollToSection('about')" class="text-xl sm:text-2xl font-bold cursor-pointer" style="color: var(--primary-color)">{{ data.userProfile.name?.split(' ')[0] || 'Portfolio' }}</div>
                
                <!-- Desktop Navigation -->
                <div class="hidden lg:flex space-x-6 xl:space-x-8">
                    <a v-if="data.experiences.length" href="#experience" @click.prevent="scrollToSection('experience')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Experience</a>
                    <a v-if="data.projects.length" href="#projects" @click.prevent="scrollToSection('projects')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Projects</a>
                    <a v-if="data.skillsByCategory.length" href="#skills" @click.prevent="scrollToSection('skills')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Skills</a>
                    <a v-if="data.education.length" href="#education" @click.prevent="scrollToSection('education')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Education</a>
                    <a v-if="data.certifications.length" href="#certifications" @click.prevent="scrollToSection('certifications')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Certifications</a>
                    <a v-if="data.publications.length" href="#publications" @click.prevent="scrollToSection('publications')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Publications</a>
                    <a v-if="data.achievements.length" href="#achievements" @click.prevent="scrollToSection('achievements')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Achievements</a>
                    <a href="#contact" @click.prevent="scrollToSection('contact')" class="hover:transition-colors text-sm xl:text-base" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Contact</a>
                </div>

                <!-- Mobile Menu Button -->
                <button 
                    @click="isMobileMenuOpen = !isMobileMenuOpen"
                    class="lg:hidden block p-2 rounded-md transition-colors"
                    style="color: var(--fourth-color)"
                    :style="{ color: isMobileMenuOpen ? 'var(--primary-color)' : 'var(--fourth-color)' }"
                >
                    <i :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'" class="text-xl"></i>
                </button>
            </div>

            <!-- Mobile Navigation Menu -->
            <div 
                v-show="isMobileMenuOpen" 
                class="lg:hidden border-t transition-all duration-300 ease-in-out"
                style="border-color: var(--fourth-color); background-color: var(--background-color)"
            >
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <a v-if="data.experiences.length" href="#experience" @click.prevent="scrollToSection('experience')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Experience</a>
                    <a v-if="data.projects.length" href="#projects" @click.prevent="scrollToSection('projects')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Projects</a>
                    <a v-if="data.skillsByCategory.length" href="#skills" @click.prevent="scrollToSection('skills')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Skills</a>
                    <a v-if="data.education.length" href="#education" @click.prevent="scrollToSection('education')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Education</a>
                    <a v-if="data.certifications.length" href="#certifications" @click.prevent="scrollToSection('certifications')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Certifications</a>
                    <a v-if="data.publications.length" href="#publications" @click.prevent="scrollToSection('publications')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Publications</a>
                    <a v-if="data.achievements.length" href="#achievements" @click.prevent="scrollToSection('achievements')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Achievements</a>
                    <a href="#contact" @click.prevent="scrollToSection('contact')" class="block px-3 py-2 text-base font-medium hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4" id="about" style="background: linear-gradient(135deg, var(--background-color) 0%, var(--primary-color) 100%);">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div class="flex-1 text-center lg:text-left">
                    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style="color: var(--fourth-color)">Hi, I'm {{ data.userProfile.name }}</h1>
                    <p v-if="data.userProfile.designation" class="text-lg sm:text-xl md:text-2xl mb-4" style="color: var(--primary-color)">And I'm a {{ data.userProfile.designation }}</p>
                    <p v-if="data.userProfile.bio" class="text-base sm:text-lg mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0 break-words whitespace-pre-wrap" style="color: var(--fourth-color)">{{ data.userProfile.bio }}</p>
                    <p v-if="data.userProfile.introduction && !data.userProfile.hide_introduction_on_website" class="text-base sm:text-lg mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0 break-words whitespace-pre-wrap" style="color: var(--fourth-color)">{{ data.userProfile.introduction }}</p>
                    
                    <!-- Contact Info -->
                    <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm sm:text-base mb-6 justify-center lg:justify-start" style="color: var(--fourth-color)">
                        <span v-if="data.userProfile.city || data.userProfile.province || data.userProfile.country" class="flex items-center justify-center lg:justify-start gap-2">
                            <i class="fas fa-map-marker-alt"></i> 
                            <span class="break-words">{{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}</span>
                        </span>
                        <a 
                            v-if="!data.userProfile.override_email && data.userProfile.email"
                            :href="`mailto:${data.userProfile.email}`"
                            class="flex items-center justify-center lg:justify-start gap-2 hover:underline transition-colors"
                            style="color: var(--fourth-color)"
                            onmouseover="this.style.color='var(--primary-color)'"
                            onmouseout="this.style.color='var(--fourth-color)'"
                        >
                            <i class="fas fa-envelope"></i> 
                            <span class="break-all">{{ data.userProfile.email }}</span>
                        </a>
                        <a 
                            v-else-if="data.userProfile.override_email && !data.userProfile.hide_secondary_email_on_website && data.userProfile.secondary_email"
                            :href="`mailto:${data.userProfile.secondary_email}`"
                            class="flex items-center justify-center lg:justify-start gap-2 hover:underline transition-colors"
                            style="color: var(--fourth-color)"
                            onmouseover="this.style.color='var(--primary-color)'"
                            onmouseout="this.style.color='var(--fourth-color)'"
                        >
                            <i class="fas fa-envelope"></i> 
                            <span class="break-all">{{ data.userProfile.secondary_email }}</span>
                        </a>
                        <a 
                            v-if="data.userProfile.phone_number && !data.userProfile.hide_phone_on_website"
                            :href="`tel:${data.userProfile.phone_number}`"
                            class="flex items-center justify-center lg:justify-start gap-2 hover:underline transition-colors"
                            style="color: var(--fourth-color)"
                            onmouseover="this.style.color='var(--primary-color)'"
                            onmouseout="this.style.color='var(--fourth-color)'"
                        >
                            <i class="fas fa-phone"></i> 
                            <span class="break-words">{{ data.userProfile.phone_number }}</span>
                        </a>
                    </div>
                      <!-- Social Links -->
                      <div v-if="data.userProfile.links?.length" class="flex gap-3 sm:gap-4 mb-4 justify-center lg:justify-start">
                        <a 
                            v-for="link in data.userProfile.links.slice(0, 2)" 
                            :key="link.url"
                            :href="link.url" 
                            target="_blank"
                            class="px-3 py-2 rounded-full transition hover:scale-105"
                            style="background-color: var(--primary-color); color: var(--background-color)"
                            onmouseover="this.style.backgroundColor='var(--secondary-color)'"
                            onmouseout="this.style.backgroundColor='var(--primary-color)'"
                        >
                        <i :class="getSocialIcon(link.type)"></i>
                        </a>
                    </div>
                    <!-- Documents -->
                    <div v-if="data.userProfile.documents?.length" class="flex flex-wrap gap-3 mt-4 justify-center lg:justify-start">
                        <a 
                            v-for="doc in data.userProfile.documents" 
                            :key="doc.id"
                            :href="doc.url" 
                            target="_blank"
                            class="px-3 sm:px-4 py-2 rounded-lg transition hover:opacity-80 text-sm sm:text-base"
                            style="background-color: var(--primary-color); color: var(--background-color)"
                        >
                            {{ doc.display_name || doc.name || 'Download' }}
                        </a>
                    </div>
                </div>
                <div class="flex-shrink-0 order-first lg:order-last">
                    <img 
                        v-if="data.userProfile.profile_photo_url"
                        :src="data.userProfile.profile_photo_url" 
                        :alt="data.userProfile.name"
                        class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full object-cover shadow-2xl border-4 sm:border-6 md:border-8"
                        style="border-color: var(--background-color)"
                    />
                    <div 
                        v-else
                        class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full shadow-2xl border-4 sm:border-6 md:border-8 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-bold"
                        style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: var(--background-color); border-color: var(--background-color)"
                    >
                        {{ getUserInitials }}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Experience Section -->
    <section v-if="data.experiences.length" id="experience" class="py-16 sm:py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center" style="color: var(--primary-color)">Experience</h2>
            <div class="space-y-6 sm:space-y-8">
                <div 
                    v-for="exp in sortedExperiences" 
                    :key="exp.id"
                    class="p-4 sm:p-6 lg:p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--primary-color);"
                >
                    <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 flex-shrink-0" style="border-color: var(--background-color)">
                            <img 
                                v-if="exp.company_logo"
                                :src="exp.company_logo" 
                                :alt="exp.company_name"
                                class="w-full h-full object-contain"
                            />
                            <div 
                                v-else
                                class="w-full h-full flex items-center justify-center font-bold text-xs sm:text-sm"
                                style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: var(--background-color)"
                            >
                                {{ getCompanyInitials(exp.company_name) }}
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-xl sm:text-2xl font-bold mb-2 break-words" style="color: var(--background-color)">{{ exp.role }}</h3>
                            <p class="font-semibold mb-2 text-sm sm:text-base break-words" style="color: var(--background-color)">{{ exp.company_name }}</p>
                            <p class="mb-3 sm:mb-4 text-sm sm:text-base" style="color: var(--background-color)">{{ exp.location || '' }} | {{ formatDateRange(exp.start_date, exp.end_date) }}</p>
                            <p v-if="exp.description" class="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed break-words" style="color: var(--background-color)">{{ exp.description }}</p>
                            <div v-if="exp.skills?.length" class="flex flex-wrap gap-2">
                                <span 
                                    v-for="skill in exp.skills" 
                                    :key="skill"
                                    class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                                    style="background-color: var(--background-color); color: var(--primary-color)"
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

    <!-- Projects Section -->
    <section v-if="data.projects.length" id="projects" class="py-16 sm:py-20 px-4" style="background-color: var(--secondary-color); ">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center" style="color: var(--background-color)">Projects</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div 
                    v-for="project in data.projects" 
                    :key="project.id"
                    class="rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                    style="background-color: var(--background-color)"
                >
                    <!-- Project Image Thumbnail -->
                    <div 
                        v-if="getProjectImages(project.assets).length"
                        class="relative w-full h-48 overflow-hidden cursor-pointer"
                        @click="openProjectModal(project)"
                    >
                        <img 
                            :src="getProjectImages(project.assets)[0]?.url" 
                            :alt="project.name"
                            class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <span class="text-white text-lg font-semibold">View Gallery</span>
                        </div>
                    </div>
                    <div 
                        v-else
                        class="w-full h-48 flex items-center justify-center"
                        style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); opacity: 0.1"
                    >
                        <i class="fas fa-code text-4xl" style="color: var(--primary-color)"></i>
                    </div>

                    <div class="p-4 sm:p-6">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                            <div class="flex items-start gap-3">
                                <h3 class="text-lg sm:text-xl lg:text-2xl font-bold flex-1 break-words" style="color: var(--fourth-color)">{{ project.name }}</h3>
                                <!-- Image Gallery Button -->
                                <button 
                                    v-if="getProjectImages(project.assets).length"
                                    @click="openProjectModal(project)"
                                    class="p-2 rounded-full transition hover:scale-110 flex-shrink-0"
                                    style="background-color: var(--primary-color); color: var(--background-color)"
                                    title="View Project Images"
                                >
                                    <i class="fas fa-images text-sm"></i>
                                </button>
                            </div>
                            <span v-if="project.category" class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm self-start" style="background-color: var(--primary-color); color: var(--background-color)">{{ project.category }}</span>
                        </div>
                        <p class="mb-4 text-sm sm:text-base break-words" style="color: var(--fourth-color)">{{ project.description || 'No description available' }}</p>
                        <div v-if="project.technologies?.length" class="flex flex-wrap gap-2 mb-4">
                            <span 
                                v-for="tech in project.technologies" 
                                :key="tech"
                                class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                                style="background-color: var(--fourth-color); color: var(--background-color)"
                            >
                                {{ tech }}
                            </span>
                        </div>
                        <div v-if="project.links?.length" class="flex flex-wrap gap-2 sm:gap-4 mt-4">
                            <a 
                                v-for="link in project.links" 
                                :key="link.url"
                                :href="link.url" 
                                target="_blank"
                                class="hover:underline rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm"
                                style="color: var(--primary-color); border: 1px solid var(--primary-color)"
                            >
                                {{ link.title }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Skills Section -->
    <section v-if="data.skillsByCategory.length" id="skills" class="py-16 sm:py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center" style="color: var(--primary-color)">Skills</h2>
            <div class="space-y-6 sm:space-y-8">
                <div 
                    v-for="[categoryName, skills] in data.skillsByCategory" 
                    :key="categoryName"
                >
                    <h3 class="text-xl sm:text-2xl font-semibold mb-4 capitalize" style="color: var(--primary-color)">{{ categoryName }}</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div 
                            v-for="skill in skills" 
                            :key="skill.id"
                            class="p-3 sm:p-4 rounded-lg"
                            style="background-color: var(--primary-color); "
                        >
                            <div class="flex justify-between mb-2">
                                <span class="font-semibold text-sm sm:text-base" style="color: var(--background-color)">{{ skill.name }}</span>
                                <span class="text-xs sm:text-sm font-bold" style="color: var(--fourth-color)">{{ (skill.proficiency_level) }}</span>
                            </div>
                            <div class="w-full rounded-full h-2" style="background-color: var(--secondary-color);">
                                <div 
                                    class="h-2 rounded-full transition-all duration-1000"
                                    :style="{ 
                                        width: `${getProficiencyPercentage(skill.proficiency_level)}%`,
                                        backgroundColor: 'var(--fourth-color)',
                                        opacity: 0.3
                                    }"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Education Section -->
    <section v-if="data.education.length" id="education" class="py-16 sm:py-20 px-4" style="background-color: var(--secondary-color); ">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center" style="color: var(--background-color)">Education</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div 
                    v-for="edu in sortedEducation" 
                    :key="edu.id"
                    class="p-6 sm:p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--background-color)"
                >
                    <h3 class="text-xl sm:text-2xl font-bold mb-2 break-words" style="color: var(--fourth-color)">{{ edu.degree }}</h3>
                    <p class="font-semibold mb-2 text-sm sm:text-base" style="color: var(--primary-color)">{{ edu.university_name }}</p>
                    <p v-if="edu.location" class="mb-2 text-sm sm:text-base" style="color: var(--fourth-color)">{{ edu.location }}</p>
                    <p class="mb-2 text-sm sm:text-base" style="color: var(--fourth-color)">{{ formatDateRange(edu.from_date, edu.end_date) }}</p>
                    <p v-if="edu.cgpa" class="font-semibold text-sm sm:text-base" style="color: var(--fourth-color)">CGPA: {{ edu.cgpa }}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Achievements Section -->
    <section v-if="data.achievements.length" id="achievements" class="py-16 sm:py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center" style="color: var(--primary-color)">Achievements</h2>
            <div class="max-w-4xl mx-auto">
                <ul class="space-y-4 sm:space-y-6">
                    <li 
                        v-for="achievement in data.achievements" 
                        :key="achievement.id"
                        class="flex items-start gap-3 sm:gap-4"
                    >
                        <div class="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mt-1" style="background-color: var(--primary-color)">
                            <span class="text-xs sm:text-sm font-bold" style="color: var(--background-color)"></span>
                        </div>
                        <p class="text-base sm:text-lg leading-relaxed break-words" style="color: var(--fourth-color)">{{ achievement.description }}</p>
                    </li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Certifications Section -->
    <section v-if="data.certifications.length" id="certifications" class="py-16 sm:py-20 px-4" style="background-color: var(--secondary-color);">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center" style="color: var(--background-color)">Certifications</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div 
                    v-for="cert in data.certifications" 
                    :key="cert.id"
                    class="p-6 sm:p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--background-color)"
                >
                    <div class="flex items-start gap-4 mb-4">
                        <div class="flex-1">
                            <h3 class="text-xl sm:text-2xl font-bold mb-2 break-words" style="color: var(--fourth-color)">{{ cert.name }}</h3>
                            <p v-if="cert.institute_name" class="text-base sm:text-lg font-semibold mb-3" style="color: var(--primary-color)">{{ cert.institute_name }}</p>
                        </div>
                    </div>
                    <p v-if="cert.description" class="mb-4 text-sm sm:text-base break-words" style="color: var(--fourth-color)">{{ cert.description }}</p>
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <span class="text-xs sm:text-sm" style="color: var(--fourth-color)">{{ formatYear(cert.start_date) }}</span>
                        <a 
                            v-if="cert.certificate_pdf"
                            :href="cert.certificate_pdf" 
                            target="_blank"
                            class="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition self-start sm:self-auto"
                            style="background-color: var(--primary-color); color: var(--background-color)"
                        >
                            <i class="fas fa-download mr-1"></i>View Certificate
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Publications Section -->
    <section v-if="data.publications.length" id="publications" class="py-16 sm:py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center" style="color: var(--primary-color)">Publications</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div 
                    v-for="pub in data.publications" 
                    :key="pub.id"
                    class="p-6 sm:p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--secondary-color);"
                >
                    <div class="flex items-start gap-4 mb-4">
                        <div class="flex-shrink-0">
                            <i class="fas fa-file-alt text-2xl sm:text-3xl" style="color: var(--background-color)"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl sm:text-2xl font-bold mb-2 break-words" style="color: var(--background-color)">{{ pub.paper_name }}</h3>
                            <p v-if="pub.conference_name" class="text-base sm:text-lg font-semibold mb-2 uppercase" style="color: var(--background-color)">{{ pub.conference_name }}</p>
                        </div>
                    </div>
                    <p v-if="pub.description" class="mb-4 text-sm sm:text-base break-words" style="color: var(--background-color)">{{ pub.description }}</p>
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-calendar text-xs sm:text-sm" style="color: var(--background-color)"></i>
                            <span class="text-xs sm:text-sm" style="color: var(--background-color)">{{ formatYear(pub.published_date) }}</span>
                        </div>
                        <div class="flex gap-2">
                            <a 
                                v-if="pub.paper_pdf"
                                :href="pub.paper_pdf" 
                                target="_blank"
                                class="px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition"
                                style="background-color: var(--background-color); color: var(--primary-color)"
                            >
                                <i class="fas fa-file-pdf mr-1"></i>PDF
                            </a>
                            <a 
                                v-if="pub.paper_link"
                                :href="pub.paper_link.startsWith('http') ? pub.paper_link : `https://${pub.paper_link}`" 
                                target="_blank"
                                class="px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition"
                                style="background-color: var(--secondary-color); color: var(--background-color)"
                            >
                                <i class="fas fa-external-link-alt mr-1"></i>Link
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-16 sm:py-20 px-4" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-12 sm:mb-16">
                <h2 class="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Get In Touch</h2>
                <p class="text-lg sm:text-xl mb-6 sm:mb-8">Feel free to reach out for collaborations or just a friendly hello</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
                <!-- Contact Information -->
                <div class="space-y-6 sm:space-y-8">
                    <div>
                        <h3 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style="color: var(--background-color)">Contact Information</h3>
                        <div class="space-y-4">
                            <div v-if="!data.userProfile.override_email && data.userProfile.email" class="flex items-start gap-3 sm:gap-4">
                                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-envelope text-sm sm:text-base"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="font-semibold text-sm sm:text-base" style="color: var(--background-color)">Email</p>
                                    <a :href="`mailto:${data.userProfile.email}`" class="hover:underline text-sm sm:text-base break-all hyphens-auto" style="color: var(--background-color)">{{ data.userProfile.email }}</a>
                                </div>
                            </div>
                            <div v-else-if="data.userProfile.override_email && !data.userProfile.hide_secondary_email_on_website && data.userProfile.secondary_email" class="flex items-start gap-3 sm:gap-4">
                                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-envelope text-sm sm:text-base"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="font-semibold text-sm sm:text-base" style="color: var(--background-color)">Email</p>
                                    <a :href="`mailto:${data.userProfile.secondary_email}`" class="hover:underline text-sm sm:text-base break-all hyphens-auto" style="color: var(--background-color)">{{ data.userProfile.secondary_email }}</a>
                                </div>
                            </div>
                            <div v-if="data.userProfile.phone_number && !data.userProfile.hide_phone_on_website" class="flex items-start gap-3 sm:gap-4">
                                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-phone text-sm sm:text-base"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="font-semibold text-sm sm:text-base" style="color: var(--background-color)">Phone</p>
                                    <a :href="`tel:${data.userProfile.phone_number}`" class="hover:underline text-sm sm:text-base" style="color: var(--background-color)">{{ data.userProfile.phone_number }}</a>
                                </div>
                            </div>
                            <div v-if="data.userProfile.city || data.userProfile.province || data.userProfile.country" class="flex items-start gap-3 sm:gap-4">
                                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-map-marker-alt text-sm sm:text-base"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="font-semibold text-sm sm:text-base" style="color: var(--background-color)">Location</p>
                                    <p class="text-sm sm:text-base" style="color: var(--background-color)">{{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Social Links -->
                    <div v-if="data.userProfile.links?.length">
                        <h3 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style="color: var(--background-color)">Follow Me</h3>
                        <div class="flex gap-3 sm:gap-4">
                            <a 
                                v-for="link in data.userProfile.links" 
                                :key="link.url"
                                :href="link.url" 
                                target="_blank"
                                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition hover:scale-110"
                                style="background-color: var(--background-color); color: var(--primary-color)"
                            >
                                <i :class="getSocialIcon(link.type)" class="text-sm sm:text-base"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
                    <h3 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style="color: var(--fourth-color)">Send Message</h3>
                    <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="name" class="block text-sm font-medium mb-2" style="color: var(--fourth-color)">Name *</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    v-model="formData.name"
                                    required
                                    class="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base"
                                    style="border-color: var(--fourth-color); color: var(--fourth-color);"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label for="email" class="block text-sm font-medium mb-2" style="color: var(--fourth-color)">Email *</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    v-model="formData.email"
                                    required
                                    class="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base"
                                    style="border-color: var(--fourth-color); color: var(--fourth-color);"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label for="subject" class="block text-sm font-medium mb-2" style="color: var(--fourth-color)">Subject *</label>
                            <input 
                                type="text" 
                                id="subject" 
                                v-model="formData.subject"
                                required
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition text-sm sm:text-base"
                                style="border-color: var(--fourth-color); color: var(--fourth-color);"
                                placeholder="Subject"
                            />
                        </div>
                        <div>
                            <label for="message" class="block text-sm font-medium mb-2" style="color: var(--fourth-color)">Message *</label>
                            <textarea 
                                id="message" 
                                v-model="formData.message"
                                required
                                rows="4"
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none text-sm sm:text-base"
                                style="border-color: var(--fourth-color); color: var(--fourth-color);"
                                placeholder="Your message here..."
                            ></textarea>
                        </div>
                        <button 
                            type="submit"
                            class="w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition hover:opacity-90 text-sm sm:text-base"
                            style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: var(--background-color)"
                        >
                            <span v-if="!isSubmitting">Send Message</span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <i class="fas fa-spinner fa-spin"></i>
                                Sending...
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-6 sm:py-8 px-4" style="background-color: var(--fourth-color); color: var(--background-color)">
        <div class="max-w-7xl mx-auto text-center">
            <p class="text-sm sm:text-base">&copy; {{ new Date().getFullYear() }} {{ data.userProfile.name }}. All rights reserved.</p>
            <p v-if="!isPremiumUser">Powered by <a href="https://www.{{ brandName }}.com" target="_blank" class="hover:underline">{{ brandName }}</a></p>
        </div>
    </footer>

    <!-- Project Images Modal -->
    <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style="background-color: rgba(0,0,0,0.8)" @click.self="showProjectModal = false">
      <div v-if="activeProject" class="rounded-2xl shadow-2xl w-full max-w-5xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto" style="background-color: var(--background-color)">
        <!-- Close Button -->
        <button
          @click="showProjectModal = false"
          class="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition"
          style="background-color: var(--primary-color); color: var(--background-color)"
        >
          <i class="fas fa-times text-sm sm:text-base"></i>
        </button>

        <!-- Modal Header -->
        <div class="mb-4 sm:mb-6 pr-10 sm:pr-12">
          <h3 class="text-xl sm:text-2xl font-bold" style="color: var(--fourth-color)">{{ activeProject.name }}</h3>
          <p v-if="activeProject.description" class="mt-2 text-sm sm:text-base" style="color: var(--fourth-color)">{{ activeProject.description }}</p>
        </div>

        <!-- Carousel -->
        <UCarousel
          ref="carousel"
          v-slot="{ item }"
          :items="getProjectImages(activeProject.assets).map(i => i.url)"
          class="w-full mx-auto mb-4 sm:mb-6"
          @select="onProjectSelect"
        >
          <img :src="item" class="rounded-xl max-h-[50vh] sm:max-h-[70vh] object-contain mx-auto" />
        </UCarousel>

        <!-- Thumbnails -->
        <div class="flex gap-2 sm:gap-3 justify-center pt-2 sm:pt-4 flex-wrap">
          <div
            v-for="(img, i) in getProjectImages(activeProject.assets)"
            :key="i"
            class="w-16 h-16 sm:w-20 sm:h-20 opacity-60 hover:opacity-100 cursor-pointer transition-opacity rounded-lg overflow-hidden"
            :class="{ 'opacity-100 ring-2': activeIndex === i }"
            :style="{ 'ring-color': 'var(--primary-color)' }"
            @click="selectProjectImage(i)"
          >
            <img :src="img.url" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loader -->
  <div v-else class="min-h-screen flex items-center justify-center" :style="{ backgroundColor: background || '#f8fafc' }">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" :style="{ borderColor: primary || '#2563eb' }"></div>
      <p class="opacity-70" :style="{ color: primary || '#2563eb' }">Loading your portfolio...</p>
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
/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-color);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}

/* Fix button text spacing globally */
.professional-template button {
  line-height: 1;
  align-items: center;
  justify-content: center;
}

.professional-template button span,
.professional-template button i {
  line-height: 1;
  margin: 0;
}

.professional-template a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Fix icon and text spacing in buttons */
.professional-template button i,
.professional-template a i {
  margin-right: 0.25rem;
  margin-bottom: 0;
  margin-top: 0;
  line-height: 1;
}

.professional-template button i:last-child,
.professional-template a i:last-child {
  margin-right: 0;
}

/* Responsive improvements */
@media (max-width: 640px) {
  .professional-template {
    font-size: 14px;
  }
  
  /* Ensure proper spacing on mobile */
  .professional-template section {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Better text wrapping */
  .professional-template h1,
  .professional-template h2,
  .professional-template h3,
  .professional-template h4,
  .professional-template h5,
  .professional-template h6 {
    word-wrap: break-word;
    hyphens: auto;
  }
  
  /* Improve text wrapping for all text content */
  .professional-template p,
  .professional-template span,
  .professional-template div {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  /* Better URL and email wrapping */
  .professional-template a {
    word-break: break-all;
    hyphens: auto;
  }
  
  /* Prevent horizontal overflow */
  .professional-template * {
    max-width: 100%;
  }
  
  /* Improve button touch targets */
  .professional-template button,
  .professional-template a {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Tablet improvements */
@media (min-width: 641px) and (max-width: 1024px) {
  .professional-template {
    font-size: 15px;
  }
}

/* Desktop improvements */
@media (min-width: 1025px) {
  .professional-template {
    font-size: 16px;
  }
}
</style>