<script setup lang="ts">
import { ref, computed, onUnmounted, toRef } from 'vue'
import type { ProcessedTemplateData } from '../../composables/useTemplateData'
import { formatPublishDate } from '../../composables/useTemplateData'
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
  getInstitutionInitials,
  formatDateRange,
  formatDate,
  formatYear,
  getProficiencyPercentage,
  getInitials
} = useTemplateFunctions(dataRef)

const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const showProjectModal = ref(false)
const activeProject = ref<any>(null)
const activeIndex = ref(0)
const carousel = ref<any>()

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

function onProjectSelect(i: number) {
  activeIndex.value = i
}

function selectProjectImage(i: number) {
  activeIndex.value = i
  carousel.value?.emblaApi?.scrollTo(i)
}

const formatFullDateRange = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
  if (!startDate) return ''
  const start = new Date(startDate)
  const formattedStart = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const formattedEnd = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Present'
  return `${formattedStart} - ${formattedEnd}`
}

const getYear = (date: string | null | undefined): string => {
  return formatYear(date || null)
}

const greetings = [
  'HELLO',
  'BONJOUR', // French
  'नमस्ते', // Namaste (Hindi)
  'HOLA', // Spanish
  'HALLO', // German
  'CIAO', // Italian
  '你好', // Ni Hao (Chinese)
  'こんにちは', // Konnichiwa (Japanese)
  'مرحبا', // Marhaba (Arabic)
]

const typedText = ref('')
const showCursor = ref(true)
let currentIndex = 0
let charIndex = 0
let isDeleting = false
let typingTimeout: any

const typeGreeting = () => {
  const currentGreeting = greetings[currentIndex]
  
  if (!isDeleting && charIndex < currentGreeting.length) {
    typedText.value = currentGreeting.substring(0, charIndex + 1)
    charIndex++
    typingTimeout = setTimeout(typeGreeting, 150)
  } else if (!isDeleting && charIndex === currentGreeting.length) {
    isDeleting = true
    typingTimeout = setTimeout(typeGreeting, 2000)
  } else if (isDeleting && charIndex > 0) {
    typedText.value = currentGreeting.substring(0, charIndex - 1)
    charIndex--
    typingTimeout = setTimeout(typeGreeting, 100)
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false
    currentIndex = (currentIndex + 1) % greetings.length
    typingTimeout = setTimeout(typeGreeting, 500)
  }
}

const blinkCursor = () => {
  setInterval(() => {
    showCursor.value = !showCursor.value
  }, 500)
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    typeGreeting()
    blinkCursor()
  }, 500)
}

onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})
</script>

<template>
  <div
    v-if="data"
    class="bg-[var(--color-background)] template-old"
    :style="{
      '--color-primary': primary || '#8B4513',
      '--color-secondary': secondary || '#F4ECE6',
      '--color-accent': fourth || '#BE4344',
      '--color-background': background || '#E6D9CD'
    }"
  >

    <!-- Navigation -->
    <nav class="sticky top-0 bg-[var(--color-background)] shadow-md z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-[var(--color-primary)] mr-2"></div>
            <a href="#" class="text-xl font-bold text-[var(--color-accent)]">
              {{ data.userProfile.name }} 
              <span v-if="data.userProfile.designation" class="font-light text-base ml-2">/ {{ data.userProfile.designation }}</span>
            </a>
          </div>
          <div class="hidden md:flex space-x-8">
            <a href="#about" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">About</a>
            <a v-if="data.experiences.length" href="#experience" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">Experience</a>
            <a v-if="data.education.length" href="#education" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">Education</a>
            <a v-if="data.projects.length" href="#projects" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">Projects</a>
            <a v-if="data.skills.length" href="#skills" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">Skills</a>
            <a v-if="data.certifications.length" href="#certifications" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">Certifications</a>
            <a href="#contact" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">Contact</a>
          </div>
          <button @click="toggleMobileMenu" class="md:hidden text-[var(--color-accent)]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        <!-- Mobile Menu -->
        <div v-show="showMobileMenu" class="md:hidden mt-4 pb-4">
          <a href="#about" @click="closeMobileMenu" class="block py-2 text-[var(--color-accent)] hover:text-[var(--color-primary)]">About</a>
          <a v-if="data.experiences.length" href="#experience" @click="closeMobileMenu" class="block py-2 text-[var(--color-accent)] hover:text-[var(--color-primary)]">Experience</a>
          <a v-if="data.education.length" href="#education" @click="closeMobileMenu" class="block py-2 text-[var(--color-accent)] hover:text-[var(--color-primary)]">Education</a>
          <a v-if="data.projects.length" href="#projects" @click="closeMobileMenu" class="block py-2 text-[var(--color-accent)] hover:text-[var(--color-primary)]">Projects</a>
          <a v-if="data.skills.length" href="#skills" @click="closeMobileMenu" class="block py-2 text-[var(--color-accent)] hover:text-[var(--color-primary)]">Skills</a>
          <a v-if="data.certifications.length" href="#certifications" @click="closeMobileMenu" class="block py-2 text-[var(--color-accent)] hover:text-[var(--color-primary)]">Certifications</a>
          <a href="#contact" @click="closeMobileMenu" class="block py-2 text-[var(--color-accent)] hover:text-[var(--color-primary)]">Contact</a>
        </div>
      </div>
    </nav>
    
    <!-- Hero Section / Profile Card -->
      <section id="about" class="py-12 px-4 gradient-section">
      <div class="container mx-auto max-w-6xl">
        <div class="flex flex-col md:flex-row ml-0 md:ml-12 rounded-lg overflow-hidden bg-transparent">
          <!-- Left Side - Profile Image -->
          <div class="md:w-2/5 bg-[var(--color-secondary)] p-8 flex flex-col items-center text-center min-h-[600px] md:min-h-[700px]">
            <img 
              v-if="data.userProfile.profile_photo_url"
              :src="data.userProfile.profile_photo_url" 
              :alt="data.userProfile.name" 
              class="w-80 h-80 rounded-full border-10 border-[var(--color-background)] object-cover mb-8 shadow-lg"
            >
            <h2 class="text-4xl font-bold text-[var(--color-accent)] mb-2">{{ data.userProfile.name }}</h2>
            <div class="w-24 h-1 bg-[var(--color-primary)] my-6"></div>
            <p v-if="data.userProfile.designation" class="text-xl text-[var(--color-accent)] mb-8">{{ data.userProfile.designation }}</p>
            
            <!-- Social Links -->
            <div v-if="data.userProfile.links?.length" class="flex flex-wrap gap-3 bg-[var(--color-background)] p-4 rounded-lg mt-auto justify-center">
              <UButton
                v-for="link in data.userProfile.links"
                :key="link.url"
                variant="subtle"
                size="sm"
                :label="link.title"
                @click="openLink(link.url)"
                color="neutral"
                icon="i-heroicons-arrow-top-right-on-square-16-solid"
                class="flex items-center gap-2 cursor-pointer"
              />
            </div>
          </div>
          
          <!-- Right Side - Bio -->
          <div class="md:w-3/5 p-8 bg-[var(--color-background)] min-h-[600px] md:min-h-[700px] flex flex-col justify-center">
            <h1 class="text-4xl font-bold text-[var(--color-accent)] mb-6 min-h-[5rem] flex items-center">
              {{ typedText }}<span v-show="showCursor" class="animate-pulse">|</span>
            </h1>
            <p v-if="data.userProfile.bio" class="text-2xl text-[var(--color-accent)] mb-8 break-words overflow-wrap-anywhere">{{ data.userProfile.bio }}</p>
            
            <div class="space-y-6 text-[var(--color-accent)]">
              <p v-if="data.userProfile.introduction && !data.userProfile.hide_introduction_on_website" class="text-lg leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">{{ data.userProfile.introduction }}</p>
              
              <div class="flex flex-col space-y-3 pt-6">
                <p v-if="data.userProfile.city || data.userProfile.province || data.userProfile.country" class="text-lg">
                  <strong>Location:</strong> 
                  {{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}
                </p>
                <div v-if="data.userProfile.email || data.userProfile.phone_number" class="flex flex-wrap gap-x-6 gap-y-2 text-lg">
                  <p v-if="data.userProfile.email">
                    <strong>Email:</strong> 
                    <a :href="`mailto:${data.userProfile.email}`" class="ml-1 text-[var(--color-accent)] hover:underline">{{ data.userProfile.email }}</a>
                  </p>
                  <p v-if="data.userProfile.phone_number">
                    <strong>Phone:</strong> 
                    <a :href="`tel:${data.userProfile.phone_number}`" class="ml-1 text-[var(--color-accent)] hover:underline">{{ data.userProfile.phone_number }}</a>
                  </p>
                  <p v-if="data.userProfile.website_url" class="text-lg">
                    <strong>Website:</strong> 
                    <a :href="data.userProfile.website_url" target="_blank" class="ml-1 text-[var(--color-accent)] hover:underline">{{ data.userProfile.website_url.replace('http://', '').replace('https://', '') }}</a>
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Documents -->
            <div v-if="data.userProfile.documents?.length" class="flex flex-wrap gap-12 mt-12 md:mt-24 justify-center">
              <a 
                v-for="doc in data.userProfile.documents" 
                :key="doc.id"
                :href="doc.url" 
                target="_blank"
                class="px-4 py-2 bg-[var(--color-background)] border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-medium hover:bg-[var(--color-secondary)] hover:[var(--color-accent)] transition text-lg"
              >
                {{ doc.display_name || doc.filename }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Experience Section -->
    <section v-if="data.experiences.length" id="experience" class="py-16 px-4 bg-[var(--color-background)]">
      <div class="container mx-auto max-w-6xl">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-[var(--color-primary)] mr-3"></div>
          <h2 class="text-4xl font-light text-[var(--color-accent)]">Experience</h2>
        </div>
        <div class="pt-8">
          <!-- Timeline Container -->
          <div class="relative md:ml-16">
            
            <!-- Experience Items -->
            <div class="space-y-16">
              <div v-for="exp in sortedExperiences" :key="exp.id" class="relative">
                <!-- Timeline Circle - Mobile: above card, Desktop: left of card -->
                <div class="relative md:absolute md:left-[-4.5rem] md:top-0 w-24 h-24 bg-[var(--color-secondary)] rounded-full flex items-center justify-center z-10 border-4 border-[var(--color-primary)] shadow-lg mx-auto md:mx-0 mb-4 md:mb-0">
                  <img 
                    v-if="exp.company_logo"
                    :src="exp.company_logo" 
                    :alt="exp.company_name" 
                    class="w-20 h-20 object-contain rounded-full"
                  >
                  <span v-else class="text-2xl font-bold text-[var(--color-accent)]">{{ getInitials(exp.company_name) }}</span>
                </div>
                
                <!-- Content Card -->
                <div class="bg-[var(--color-secondary)] rounded-lg p-8 shadow-lg relative">
                  
                  <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-1">
                    <div class="flex-1">
                      <!-- Mobile: Role and Company on separate lines, Desktop: Same line -->
                      <div class="block md:hidden">
                        <h3 class="text-2xl font-bold text-[var(--color-accent)] mb-1">
                          {{ exp.role }}
                        </h3>
                        <h4 v-if="exp.company_name" class="text-xl font-semibold text-[var(--color-accent)] mb-2">
                          {{ exp.company_name }}
                        </h4>
                      </div>
                      <!-- Desktop: Role and Company on same line -->
                      <h3 class="hidden md:block text-2xl font-bold text-[var(--color-accent)] mb-2">
                        {{ exp.role }}<span class="text-[var(--color-accent)]">,</span> <span v-if="exp.company_name" class="text-[var(--color-accent)] text-xl">{{ exp.company_name }}</span>
                      </h3>
                      <p v-if="exp.location" class="text-[var(--color-accent)]">{{ exp.location }}</p>
                    </div>
                    <div class="mt-4 md:mt-0 md:text-right">
                      <span class="text-sm font-semibold text-[var(--color-accent)]">{{ formatDateRange(exp.start_date, exp.end_date) }}</span>
                    </div>
                  </div>
                  
                  <!-- Separator Line -->
                  <div class="w-full h-0.5 bg-[var(--color-primary)] mb-2"></div>
                  
                  <div v-if="exp.description" class="text-[var(--color-accent)] mb-4 leading-relaxed">
                    <p class="whitespace-pre-line break-words overflow-wrap-anywhere">{{ exp.description }}</p>
                  </div>
                  
                  <!-- Skills Tags -->
                  <div v-if="exp.skills?.length" class="flex flex-wrap gap-2">
                    <span v-for="skill in exp.skills" :key="skill" class="px-3 py-1 bg-[var(--color-primary)] text-[var(--color-accent)] rounded-full text-sm font-medium">
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Education Section -->
    <section v-if="data.education.length" id="education" class="py-16 px-4 bg-[var(--color-primary)]">
      <div class="container mx-auto max-w-6xl">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-[var(--color-background)] mr-3"></div>
          <h2 class="text-4xl font-light text-[var(--color-accent)]">Education</h2>
        </div>
        
        <!-- Mobile: Vertical Timeline -->
        <div class="block md:hidden relative mt-8">
          <div class="relative ml-8">
            <!-- Vertical Line -->
            <div class="absolute left-4 top-0 bottom-0 w-1 bg-[var(--color-background)]"></div>
            
            <!-- Timeline Items -->
            <div class="space-y-8">
              <div v-for="(edu, index) in sortedEducation" :key="edu.id" class="relative">
                <!-- Circle/Year -->
                <div class="absolute left-[-0.5rem] top-0 w-12 h-12 rounded-full bg-[var(--color-secondary)] border-4 border-[var(--color-primary)] shadow-lg flex items-center justify-center">
                  <span class="text-xs font-bold text-[var(--color-accent)]">{{ edu.end_date ? getYear(edu.end_date) : getYear(edu.from_date) }}</span>
                </div>
                
                <!-- Content without Card -->
                <div class="ml-16">
                  <h3 class="text-lg font-bold text-[var(--color-accent)] mb-2">{{ edu.degree }}</h3>
                  <p class="text-sm text-[var(--color-accent)] mb-1">{{ edu.university_name }}</p>
                  <p v-if="edu.cgpa" class="text-xs text-[var(--color-accent)] mb-1">CGPA: {{ edu.cgpa }}/10</p>
                  <p v-if="edu.location" class="text-xs text-[var(--color-accent)] mb-2">{{ edu.location }}</p>
                  <p class="text-xs font-semibold text-[var(--color-accent)]">{{ formatDateRange(edu.from_date, edu.end_date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Desktop: Horizontal Timeline -->
        <div class="hidden md:block relative mt-4">
          <!-- Horizontal Line -->
          <div class="absolute top-8 left-0 right-0 h-1 bg-[var(--color-background)]"></div>
          
          <!-- Timeline Items -->
          <div class="flex justify-between relative">
            <div 
              v-for="(edu, index) in sortedEducation" 
              :key="edu.id" 
              class="flex flex-col items-center flex-1"
            >
              <!-- Circle/Year -->
              <div class="relative z-10 w-16 h-16 rounded-full bg-[var(--color-secondary)] border-4 border-[var(--color-primary)] shadow-lg flex items-center justify-center mb-2">
                <span class="text-sm font-bold text-[var(--color-accent)]">{{ edu.end_date ? getYear(edu.end_date) : getYear(edu.from_date) }}</span>
              </div>
              
              <!-- Content Card -->
              <div class="text-center px-2 max-w-[200px]">
                <h3 class="text-lg font-bold text-[var(--color-accent)] mb-2">{{ edu.degree }}</h3>
                <p class="text-sm text-[var(--color-accent)] mb-1">{{ edu.university_name }}</p>
                <p v-if="edu.cgpa" class="text-xs text-[var(--color-accent)] mb-1">CGPA: {{ edu.cgpa }}/10</p>
                <p v-if="edu.location" class="text-xs text-[var(--color-accent)] mb-2">{{ edu.location }}</p>
                <p class="text-xs font-semibold text-[var(--color-accent)]">{{ formatDateRange(edu.from_date, edu.end_date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Projects Section -->
    <section v-if="data.projects.length" id="projects" class="py-16 px-4 bg-[var(--color-background)]">
      <div class="container mx-auto max-w-6xl">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-[var(--color-primary)] mr-3"></div>
          <h2 class="text-4xl font-light text-[var(--color-accent)]">Projects</h2>
        </div>
        <div class="pt-8">
          <div class="flex flex-wrap gap-8 justify-evenly">
            <div v-for="project in data.projects" :key="project.id" class="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition w-md bg-[var(--color-background)]">
              <div v-if="getProjectImages(project.assets).length" class="relative h-64 bg-[var(--color-background)] cursor-pointer" @click="openProjectModal(project)">
                <img 
                  :src="getProjectImages(project.assets)[0]?.url" 
                  :alt="project.name" 
                  class="w-full h-full object-cover border-10 border-[var(--color-background)]"
                >
                <div v-if="getProjectImages(project.assets).length > 1" class="absolute bottom-2 right-2 bg-[var(--color-secondary)] bg-opacity-75 text-[var(--color-accent)] px-2 py-1 rounded text-xs">
                  +{{ getProjectImages(project.assets).length - 1 }} more
                </div>
              </div>
              <div class="p-6 pt-0">
                <div v-if="getProjectImages(project.assets).length" class="mb-4">
                  <button 
                    @click="openProjectModal(project)"
                    class="text-[var(--color-accent)] hover:underline underline font-medium cursor-pointer"
                  >
                    See more
                  </button>
                </div>
                <div v-if="project.category" class="mb-2">
                  <span class="inline-block px-3 py- border-4 border-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-accent)] text-sm font-semibold rounded-full">{{ project.category }}</span>
                </div>
                <h3 class="text-2xl font-bold text-[var(--color-accent)] mb-2">{{ project.name }}</h3>
                <p v-if="project.description" class="text-[var(--color-accent)] mb-4">{{ project.description }}</p>
                <div v-if="project.technologies?.length" class="mb-4">
                  <p class="text-sm text-[var(--color-accent)] mb-2"><strong>Technologies:</strong></p>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="tech in project.technologies" :key="tech" class="px-2 py-1 bg-[var(--color-primary)] text-[var(--color-accent)] text-xs rounded">
                      {{ tech }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-[var(--color-accent)] mb-4">{{ formatDateRange(project.start_date, project.end_date) }}</p>
                <div v-if="project.links?.length" class="flex flex-wrap gap-4 justify-center mt-8">
                  <a 
                    v-for="link in project.links" 
                    :key="link.url"
                    :href="link.url" 
                    target="_blank" 
                    class="px-4 py-2 rounded hover:bg-opacity-90 transition text-sm bg-[var(--color-background)] hover:bg-[var(--color-primary)] text-[var(--color-accent)] border-4 border-[var(--color-primary)]"
                  >
                    {{ link.title }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Skills Section -->
    <section v-if="data.skills.length" id="skills" class="py-16 px-4 bg-[var(--color-primary)]">
      <div class="container mx-auto max-w-6xl">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-[var(--color-background)] mr-3"></div>
          <h2 class="text-4xl font-light text-[var(--color-accent)]">Technical Skills</h2>
        </div>
        <div class="pt-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div v-for="[categoryName, skills] in data.skillsByCategory" :key="categoryName" class="mb-8 border-2 border-[var(--color-secondary)] rounded-lg p-6 bg-[var(--color-secondary)]">
              <h3 class="text-2xl text-[var(--color-accent)] mb-4">{{ categoryName }}</h3>
              <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
                <div v-for="skill in skills" :key="skill.id" class="text-center">
                  <div class="relative w-20 h-20 mx-auto mb-2">
                    <!-- Circular Progress -->
                    <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <!-- Background circle -->
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--color-primary)"
                        stroke-width="2"
                      />
                      <!-- Progress circle -->
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--color-accent)"
                        stroke-width="2"
                        :stroke-dasharray="`${getProficiencyPercentage(skill.proficiency_level)}, 100`"
                      />
                    </svg>
                    <!-- Percentage text -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-[var(--color-accent)] font-bold text-sm">{{ getProficiencyPercentage(skill.proficiency_level) }}%</span>
                    </div>
                  </div>
                  <p class="font-medium text-[var(--color-accent)] text-xs">{{ skill.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Certifications & Achievements Section -->
    <section v-if="data.certifications.length || data.achievements.length || data.publications.length" id="certifications" class="py-16 px-4 bg-[var(--color-background)]">
      <div class="container mx-auto max-w-6xl">
        <!-- Certifications -->
        <div v-if="data.certifications.length" class="mb-16">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-[var(--color-primary)] mr-3"></div>
            <h2 class="text-4xl font-light text-[var(--color-accent)]">Certifications</h2>
          </div>
          <div class="pt-8">
            <div class="flex flex-wrap justify-center gap-8">
              <div v-for="cert in data.certifications" :key="cert.id" class="bg-[var(--color-primary)] border-2 border-[var(--color-secondary)] rounded-lg p-4 shadow-md hover:shadow-xl transition min-w-0 flex-1" style="min-width: 300px; max-width: 500px;">
                <div class="flex flex-col">
                  <h3 class="text-lg font-bold text-[var(--color-accent)] mb-2">
                    {{ cert.name }}<span v-if="cert.institute_name" class="font-normal text-[var(--color-accent)]">,</span> <span v-if="cert.institute_name" class="font-normal text-[var(--color-accent)]">{{ cert.institute_name }}</span>
                  </h3>
                  <p v-if="cert.description" class="text-[var(--color-accent)] mb-3 text-sm">{{ cert.description }}</p>
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p class="text-xs text-[var(--color-accent)]">{{ formatDateRange(cert.start_date, cert.end_date) }}</p>
                    <a 
                      v-if="cert.certificate_pdf"
                      :href="cert.certificate_pdf" 
                      target="_blank"
                      class="px-3 py-1 bg-[var(--color-secondary)] text-[var(--color-accent)] rounded hover:bg-opacity-90 transition text-xs whitespace-nowrap"
                    >
                      View Certificate
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Achievements -->
        <div v-if="data.achievements.length" class="mb-16">
          <div class="flex items-center mb-2">
            <div class="w-3 h-3 bg-[var(--color-primary)] mr-3"></div>
            <h2 class="text-4xl font-light text-[var(--color-accent)]">Achievements</h2>
          </div>
          <div class="pt-1 ml-8">
            <ul class="list-disc list-inside space-y-2">
              <li v-for="achievement in data.achievements" :key="achievement.id" class="text-[var(--color-accent)]">
                {{ achievement.description }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Publications -->
        <div v-if="data.publications.length">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-[var(--color-primary)] mr-3"></div>
            <h2 class="text-4xl font-light text-[var(--color-accent)]">Publications</h2>
          </div>
          <div class="pt-8">
            <div class="flex flex-wrap justify-center gap-8">
              <div v-for="pub in data.publications" :key="pub.id" class="bg-[var(--color-primary)] border-2 border-[var(--color-secondary)] rounded-lg p-4 shadow-md hover:shadow-xl transition min-w-0 flex-1" style="min-width: 300px; max-width: 500px;">
                <div class="flex flex-col">
                  <h3 class="text-lg font-bold text-[var(--color-accent)] mb-2">
                    {{ pub.paper_name }}<span v-if="pub.conference_name" class="font-normal text-[var(--color-accent)]">,</span> <span v-if="pub.conference_name" class="font-normal text-[var(--color-accent)]">{{ pub.conference_name }}</span>
                  </h3>
                  <p v-if="pub.description" class="text-[var(--color-accent)] mb-3 text-sm">{{ pub.description }}</p>
                  <div class="flex flex-col gap-2">
                    <p v-if="pub.published_date" class="text-xs text-[var(--color-accent)]">Published: {{ formatDate(pub.published_date) }}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <a 
                        v-if="pub.paper_pdf"
                        :href="pub.paper_pdf" 
                        target="_blank"
                        class="px-3 py-1 bg-[var(--color-secondary)] text-[var(--color-accent)] rounded hover:bg-opacity-90 transition text-xs whitespace-nowrap"
                      >
                        View PDF
                      </a>
                      <a 
                        v-if="pub.paper_link"
                        :href="pub.paper_link.startsWith('http') ? pub.paper_link : `https://${pub.paper_link}`" 
                        target="_blank"
                        rel="noopener noreferrer"
                        class="px-3 py-1 bg-[var(--color-secondary)] text-[var(--color-accent)] rounded hover:bg-opacity-90 transition text-xs whitespace-nowrap"
                      >
                        View Paper
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Contact Form Section -->
    <section id="contact" class="py-16 px-4 bg-[var(--color-primary)]">
      <div class="container mx-auto max-w-4xl">
        <div class="flex items-center justify-center mb-12">
          <div class="w-3 h-3 bg-[var(--color-primary)] mr-3"></div>
          <h2 class="text-4xl font-light text-[var(--color-accent)]">Let's Connect</h2>
        </div>
        
        <form class="bg-[var(--color-secondary)] rounded-lg p-8 shadow-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label for="name" class="block text-sm font-medium text-[var(--color-accent)] mb-2">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                required
                class="w-full px-4 py-3 rounded bg-[var(--color-background)] border-2 border-[var(--color-primary)] text-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] transition"
                placeholder="Your name"
              >
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-[var(--color-accent)] mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                required
                class="w-full px-4 py-3 rounded bg-[var(--color-background)] border-2 border-[var(--color-primary)] text-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] transition"
                placeholder="your.email@example.com"
              >
            </div>
          </div>
          
          <div class="mb-6">
            <label for="subject" class="block text-sm font-medium text-[var(--color-accent)] mb-2">Subject</label>
            <input 
              type="text" 
              id="subject" 
              name="subject"
              required
              class="w-full px-4 py-3 rounded bg-[var(--color-background)] border-2 border-[var(--color-primary)] text-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] transition"
              placeholder="What's this about?"
            >
          </div>
          
          <div class="mb-6">
            <label for="message" class="block text-sm font-medium text-[var(--color-accent)] mb-2">Message</label>
            <textarea 
              id="message" 
              name="message"
              rows="6"
              required
              class="w-full px-4 py-3 rounded bg-[var(--color-background)] border-2 border-[var(--color-primary)] text-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] transition resize-none"
              placeholder="Your message..."
            ></textarea>
          </div>
          
          <div class="flex justify-center">
            <button 
              type="submit"
              class="cursor-pointer px-8 py-3 bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold rounded-lg hover:bg-[var(--color-background)] border-2 border-[var(--color-primary)] transition-all"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="bg-[var(--color-primary)] relative overflow-hidden footer-background">
      <div class="relative pt-12 pb-64">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div v-if="data.userProfile.phone_number" class="text-center md:text-left">
              <h3 class="font-bold text-lg mb-2 text-[var(--color-accent)]">Call</h3>
              <a :href="`tel:${data.userProfile.phone_number}`" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">{{ data.userProfile.phone_number }}</a>
            </div>
            <div v-if="data.userProfile.email" class="text-center md:text-left">
              <h3 class="font-bold text-lg mb-2 text-[var(--color-accent)]">Email</h3>
              <a :href="`mailto:${data.userProfile.email}`" class="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition">{{ data.userProfile.email }}</a>
            </div>
            <div v-if="data.userProfile.links?.length" class="text-center md:text-left">
              <h3 class="font-bold text-lg mb-2 text-[var(--color-accent)]">Connect</h3>
              <div class="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <UButton
                  v-for="link in data.userProfile.links.filter(l => ['linkedin', 'github'].includes(l.type.toLowerCase()))"
                  :key="link.url"
                  variant="subtle"
                  size="xs"
                  :label="link.title"
                  @click="openLink(link.url)"
                  color="neutral"
                  icon="i-heroicons-arrow-top-right-on-square-16-solid"
                  class="flex items-center gap-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Animated Elements -->
        <div class="absolute bottom-0 left-0 w-full h-40">
          <img src="../templates/assets/robot.gif" alt="" class="footer-bg-one object-contain" />
          <img src="../templates/assets/car.gif" alt="" class="footer-bg-two object-contain" />
        </div>
      </div>
      
      <div class="bg-[var(--color-background)] bg-opacity-90 py-4">
        <div class="container mx-auto px-4">
          <p class="text-center text-[var(--color-accent)] text-sm">&copy; {{ new Date().getFullYear() }} - Developed by {{ data.userProfile.name }}</p>
        </div>
      </div>
    </footer>
  </div>

  <!-- Loader -->
  <div v-else class="min-h-screen flex items-center justify-center" :style="{ backgroundColor: primary || '#8B4513' }">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" :style="{ borderColor: primary || '#8B4513' }"></div>
      <p class="opacity-70 text-[var(--color-accent)]">Loading your data...</p>
    </div>
  </div>

  <!-- Project Images Modal -->
  <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-secondary)]/80 p-4" @click.self="showProjectModal = false">
    <div v-if="activeProject" class="rounded-lg shadow-lg w-full max-w-5xl p-6 relative" :style="{ backgroundColor: primary || '#8B4513' }">
      <!-- Close Button -->
      <button
        @click="showProjectModal = false"
        class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-background)] hover:bg-[var(--color-secondary)] transition-colors"
      >
        <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-[var(--color-accent)]" />
      </button>

      <!-- Carousel -->
      <UCarousel
        ref="carousel"
        v-slot="{ item }"
        :items="getProjectImages(activeProject.assets).map(i => i.url)"
        class="w-full mx-auto mb-4"
        @select="onProjectSelect"
      >
        <img :src="item" class="rounded-lg max-h-[70vh] object-contain mx-auto" />
      </UCarousel>

      <!-- Thumbnails -->
      <div class="flex gap-2 justify-center pt-4 flex-wrap">
        <div
          v-for="(img, i) in getProjectImages(activeProject.assets)"
          :key="i"
          class="w-16 h-16 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"
          :class="{ 'opacity-100': activeIndex === i }"
          @click="selectProjectImage(i)"
        >
          <img :src="img.url" class="rounded-md object-cover w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Gradient Section */
.gradient-section {
  background: linear-gradient(to top, var(--color-primary) 40%, var(--color-background) 40%);
}

@media (min-width: 768px) {
  .gradient-section {
    background: linear-gradient(to right, var(--color-primary) 40%, var(--color-background) 40%);
  }
}

/* Internal CSS for Footer Animations */
@keyframes myfirst {
  0% {
    left: -25%;
  }
  100% {
    left: 100%;
  }
}

.template-old .footer-bg-one {
  width: 200px;
  height: 150px;
  position: absolute;
  bottom: 0;
  left: 30%;
  animation: myfirst 22s linear infinite;
}

.template-old .footer-bg-two {
  width: 200px;
  height: 150px;
  position: absolute;
  bottom: 0;
  left: 38%;
  animation: myfirst 30s linear infinite;
}

.template-old .footer-background {
  background-image: url('../templates/assets/background.png');
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
}

@media (max-width: 768px) {
  .template-old .footer-bg-one {
    width: 120px;
    height: 80px;
    animation: myfirst 20s linear infinite;
  }
  .template-old .footer-bg-two {
    width: 120px;
    height: 110px;
    animation: myfirst 10s linear infinite;
  }
}

/* Smooth scroll */
:global(html) {
  scroll-behavior: smooth;
}
</style>
