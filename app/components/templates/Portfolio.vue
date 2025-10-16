<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
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

// Open link in new tab
const openLink = (url: string) => {
  window.open(url, '_blank')
}

// Project images modal state
const showProjectModal = ref(false)
const activeProject = ref<any>(null)
const activeIndex = ref(0)
const carousel = ref<any>()

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

// Carousel functions
function onProjectSelect(i: number) {
  activeIndex.value = i
}

function selectProjectImage(i: number) {
  activeIndex.value = i
  carousel.value?.emblaApi?.scrollTo(i)
}

// Color CSS variables
const colorVars = computed(() => ({
  '--fourth-color': props.primary || '#a8858f',
  '--background-color': props.background || '#302729',
  '--background-color-2': props.secondary || '#362b2e',
  '--light-grey': props.fourth || 'rgb(194, 194, 194)',
}))

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

</script>

<template>
  <div
    v-if="data"
    class="portfolio-template min-h-screen font-['Montserrat',sans-serif]"
    :style="colorVars"
  >
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" />

    <div class="flex flex-col items-center justify-center min-h-screen md:py-5">
      <div class="flex flex-row items-center justify-center w-full">

      <!-- Main Portfolio Window -->
      <div class="flex flex-col lg:flex-row bg-[var(--background-color-2)] h-auto lg:h-[80vh] w-full md:w-[85vw] max-w-[1200px] rounded-none md:rounded-[30px] shadow-lg my-0 md:my-8 lg:my-0">
        <!-- Header Section -->
        <section class="justify-center flex flex-col items-center w-full lg:w-[500px] h-full rounded-none md:rounded-[30px] text-white overflow-auto">
          <img 
            v-if="data.userProfile.profile_photo_url"
            class="w-[150px] h-[150px] mt-10 rounded-full mb-2.5 mx-2.5 shadow-[0_0_10px_2px_rgba(0,0,0,0.5)] object-cover" 
            :src="data.userProfile.profile_photo_url" 
            :alt="data.userProfile.name" 
          />
          <div 
            v-else
            class="w-[150px] h-[150px] rounded-full mb-2.5 mx-2.5 shadow-[0_0_10px_2px_rgba(0,0,0,0.5)] bg-[var(--fourth-color)] flex items-center justify-center text-white text-5xl font-bold" 
          >
            {{ getUserInitials }}
          </div>
          <h1 class="text-4xl leading-[4rem] text-[var(--background-color)]">{{ data.userProfile.name }}</h1>
          <h2 v-if="data.userProfile.designation" class="text-base leading-8 font-normal text-[var(--background-color)]">{{ data.userProfile.designation }}</h2>
          
          <div v-if="data.userProfile.links?.length" class="mt-5">
            <a 
              v-for="link in data.userProfile.links.slice(0, 3)" 
              :key="link.url"
              :href="link.url" 
              target="_blank" 
              class="text-white text-xl mx-2.5 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-brands"
              :class="{
                'fa-linkedin-in': link.type.toLowerCase().includes('linkedin'),
                'fa-github': link.type.toLowerCase().includes('github'),
                'fa-link': !link.type.toLowerCase().includes('linkedin') && !link.type.toLowerCase().includes('github')
              }"
            ></a>
          </div>
          
          <!-- Contact Information -->
          <div class="flex flex-wrap justify-center gap-2 mt-2 text-white text-center text-sm">
            <!-- Email -->
            <div v-if="!data.userProfile.override_email && data.userProfile.email" class="flex items-center justify-center gap-2">
              <i class="fas fa-envelope text-[var(--fourth-color)]"></i>
              <a :href="`mailto:${data.userProfile.email}`" class="text-white hover:text-[var(--fourth-color)] transition-colors duration-200 break-all">
                {{ data.userProfile.email }}
              </a>
            </div>
            <div v-else-if="data.userProfile.override_email && !data.userProfile.hide_secondary_email_on_website && data.userProfile.secondary_email" class="flex items-center justify-center gap-2">
              <i class="fas fa-envelope text-[var(--fourth-color)]"></i>
              <a :href="`mailto:${data.userProfile.secondary_email}`" class="text-white hover:text-[var(--fourth-color)] transition-colors duration-200 break-all">
                {{ data.userProfile.secondary_email }}
              </a>
            </div>
            
            <!-- Phone -->
            <div v-if="data.userProfile.phone_number && !data.userProfile.hide_phone_on_website" class="flex items-center justify-center gap-2">
              <i class="fas fa-phone text-[var(--fourth-color)]"></i>
              <a :href="`tel:${data.userProfile.phone_number}`" class="text-white hover:text-[var(--fourth-color)] transition-colors duration-200">
                {{ data.userProfile.phone_number }}
              </a>
            </div>
            
            <!-- Location -->
            <div v-if="data.userProfile.city || data.userProfile.province || data.userProfile.country" class="flex items-center justify-center gap-2">
              <i class="fas fa-location-dot text-[var(--fourth-color)]"></i>
              <span class="text-white">
                {{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}
              </span>
            </div>
            
            <!-- Website -->
            <div v-if="data.userProfile.website_url" class="flex items-center justify-center gap-2">
              <i class="fas fa-globe text-[var(--fourth-color)]"></i>
              <a 
                :href="data.userProfile.website_url.startsWith('http') ? data.userProfile.website_url : `https://${data.userProfile.website_url}`" 
                target="_blank"
                class="text-white hover:text-[var(--fourth-color)] transition-colors duration-200 break-all"
              >
                {{ data.userProfile.website_url }}
              </a>
            </div>
          </div>
          
          <!-- Documents -->
          <div v-if="data.userProfile.documents?.length" class="flex flex-wrap gap-3 my-8">
            <a 
              v-for="doc in data.userProfile.documents" 
              :key="doc.id"
              :href="doc.url" 
              target="_blank"
              class="text-white bg-white/[0.274] py-2.5 px-5 rounded-[30px] shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] hover:text-[var(--fourth-color)] hover:bg-white transition-colors duration-200"
            >
              {{ doc.display_name || doc.name || 'Download' }}
            </a>
          </div>
        </section>

        <!-- Content Section -->
        <div class="rounded-none md:rounded-[30px] bg-white w-full h-full overflow-auto scroll-smooth pb-0 lg:pb-0">
          <!-- Home -->
          <section class="flex flex-col items-center justify-center min-h-full mx-8 lg:mx-12 max-w-full break-words" id="welcome-section">
            <h1 class="text-3xl lg:text-[3.5rem] font-extrabold text-center my-5 leading-[2.5rem] lg:leading-[4rem] text-[var(--fourth-color)]">Hello, I am {{ data.userProfile.name }}</h1>
          </section>

          <!-- About Me -->
          <section class="flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="about">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">About me</h1>
            <div class="w-full max-w-full my-2">
              <p v-if="data.userProfile.bio" class="text-[var(--fourth-color)] whitespace-pre-wrap break-words max-w-full leading-6 mb-3">{{ data.userProfile.bio }}</p>
              <p v-if="data.userProfile.introduction && !data.userProfile.hide_introduction_on_website" class="text-[var(--fourth-color)] whitespace-pre-wrap break-words max-w-full leading-6 mb-3">
                {{ data.userProfile.introduction }}
              </p>
            </div>
          </section>

          <!-- Experience -->
          <section v-if="data.experiences.length" class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="experience">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Experience</h1>
            <div class="relative w-full before:content-[''] before:absolute before:w-0.5 before:left-6 before:top-[55px] before:h-[calc(100%-100px)] before:bg-[var(--fourth-color)] before:z-[1]">
              <div class="ml-14">
                <div v-for="exp in sortedExperiences.slice(0, 3)" :key="exp.id" class="my-12 relative">
                  <!-- Company Logo or Initials -->
                  <div class="absolute -left-[3.5rem] top-0 w-12 h-12 rounded-full shadow-lg z-10 overflow-hidden border-2 border-[var(--fourth-color)] bg-white">
                    <img 
                      v-if="exp.company_logo"
                      :src="exp.company_logo" 
                      :alt="exp.company_name"
                      class="w-full h-full object-cover"
                    />
                    <div 
                      v-else
                      class="w-full h-full flex items-center justify-center bg-[var(--fourth-color)] text-white font-bold text-sm"
                    >
                      {{ getCompanyInitials(exp.company_name) }}
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 justify-between">
                    <div class="font-bold text-[var(--fourth-color)]">
                      {{ exp.role }} - {{ exp.company_name }}
                    </div>
                    <div class="text-[var(--fourth-color)] text-sm whitespace-nowrap">{{ formatDateRange(exp.start_date, exp.end_date) }}</div>
                  </div>
                  <div class="text-[var(--fourth-color)] break-words">
                    <h3 v-if="exp.location" class="text-[var(--fourth-color)] leading-6 text-sm">{{ exp.location }}</h3>
                    <p v-if="exp.description" class="mt-3 whitespace-pre-line leading-6 mb-3">{{ exp.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Education -->
          <section v-if="data.education.length" class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="education">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Education</h1>
            
            <!-- Mobile: All items on right side -->
            <div class="block md:hidden relative w-full mt-10">
              <div class="relative ml-8">
                <!-- Vertical Line -->
                <div class="absolute -left-6 top-0 bottom-0 w-0.5 bg-[var(--fourth-color)] z-[1]"></div>
                
                <div class="space-y-8">
                  <div v-for="(edu, index) in sortedEducation" :key="edu.id" class="relative">
                    <!-- Timeline Circle -->
                    <div class="absolute left-[-2rem] top-0 w-4 h-4 rounded-full bg-[var(--fourth-color)] z-10"></div>
                    
                    <!-- Education Card -->
                    <div class="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-md ml-4">
                      <h2 class="text-sm text-[var(--fourth-color)]">{{ formatDateRange(edu.from_date, edu.end_date) }}</h2>
                      <div class="flex flex-wrap gap-1">
                        <h3 class="text-xl font-bold text-[var(--fourth-color)]">{{ edu.degree }},</h3>
                        <p class="text-lg text-[var(--fourth-color)] mb-2">{{ edu.university_name }}</p>
                      </div>
                      <div v-if="edu.location" class="flex items-center gap-1 text-gray-600 text-sm mb-2">
                        <span class="text-[var(--fourth-color)]">{{ edu.location }}</span>
                      </div>
                      <p v-if="edu.cgpa" class="text-[var(--fourth-color)] text-sm">CGPA: {{ edu.cgpa }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Tablet/Desktop: Alternating layout -->
            <div class="hidden md:block relative w-full max-w-4xl mx-auto mt-10">
              <!-- Center Timeline Line -->
              <div class="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[var(--fourth-color)] z-[1]"></div>
              
              <div class="space-y-8">
                <div 
                  v-for="(edu, index) in sortedEducation" 
                  :key="edu.id" 
                  class="relative flex items-center"
                  :class="index % 2 === 0 ? 'justify-start' : 'justify-end'"
                >
                  <!-- Timeline Circle -->
                  <div class="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--fourth-color)] z-10"></div>
                  
                  <!-- Education Card -->
                  <div 
                    class="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-md w-5/12"
                  >
                    <h2 class="text-sm text-[var(--fourth-color)]">{{ formatDateRange(edu.from_date, edu.end_date) }}</h2>
                    <div class="flex flex-wrap gap-1">
                    <h3 class="text-xl font-bold text-[var(--fourth-color)]">{{ edu.degree }},</h3>
                    <p class="text-lg text-[var(--fourth-color)] mb-2">{{ edu.university_name }}</p>
                    </div>
                    <div v-if="edu.location" class="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <span class="text-[var(--fourth-color)]">{{ edu.location }}</span>
                    </div>
                    <p v-if="edu.cgpa" class="text-[var(--fourth-color)] text-sm">CGPA: {{ edu.cgpa }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Projects -->
          <section v-if="data.projects.length" class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="projects">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Projects</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-full overflow-hidden my-5">
              <div 
                v-for="project in data.projects" 
                :key="project.id" 
                class="flex flex-col bg-white shadow-lg border border-[var(--fourth-color)] rounded-lg overflow-hidden"
              >
                <!-- Project Image with Hover Overlay -->
                <div 
                  class="relative w-full h-[250px] overflow-hidden cursor-pointer group"
                  @click="getProjectImages(project.assets).length ? openProjectModal(project) : null"
                >
                  <img 
                    v-if="getProjectImages(project.assets).length"
                    :src="getProjectImages(project.assets)[0]?.url" 
                    :alt="project.name"
                    class="w-full h-full object-cover contrast-[0.7] brightness-110 grayscale-[0.2] transition-transform duration-300 group-hover:scale-110"
                  />
                  <div 
                    v-else
                    class="w-full h-full bg-[var(--light-grey)] flex items-center justify-center"
                  >
                    <i class="fas fa-image text-4xl text-[var(--fourth-color)] opacity-50"></i>
                  </div>
                  <!-- See More Overlay -->
                  <div 
                    v-if="getProjectImages(project.assets).length"
                    class="absolute inset-0 bg-[var(--fourth-color)]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span class="text-white text-xl font-semibold">See More</span>
                  </div>
                </div>

                <!-- Project Details -->
                <div class="p-4">
                  <h3 class="text-[var(--fourth-color)] text-lg font-semibold mb-1">{{ project.name }}</h3>
                  <p v-if="project.category" class="text-xs font-semibold mb-2 uppercase text-[var(--fourth-color)] opacity-70">{{ project.category }}</p>
                  <p class="text-[var(--fourth-color)] text-sm leading-relaxed mb-3">{{ project.description || 'No description available' }}</p>
                  
                  <!-- Technologies -->
                  <div v-if="project.technologies?.length" class="flex flex-wrap gap-1.5 mb-3">
                    <span 
                      v-for="tech in project.technologies.slice(0, 5)" 
                      :key="tech" 
                      class="text-xs py-1 px-2 bg-[var(--fourth-color)]/10 text-[var(--fourth-color)] rounded-[10px]"
                    >
                      {{ tech }}
                    </span>
                  </div>
                  
                  <!-- Project Links -->
                  <div v-if="project.links?.length" class="flex flex-wrap gap-2">
                    <a 
                      v-for="link in project.links" 
                      :key="link.url"
                      :href="link.url" 
                      target="_blank"
                      class="text-xs py-1.5 px-3 bg-[var(--fourth-color)] text-white rounded-[15px] no-underline hover:opacity-80 transition-opacity duration-200"
                    >
                      {{ link.title }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Skills -->
          <section v-if="data.skillsByCategory.length" class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="skills">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Skills</h1>
            <div class="w-full max-w-full my-5">
              <div 
                v-for="[categoryName, skills] in data.skillsByCategory" 
                :key="categoryName" 
                class="mb-8"
              >
                <h2 class="text-xl font-semibold text-[var(--fourth-color)] mb-4 capitalize">{{ categoryName }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div 
                    v-for="skill in skills" 
                    :key="skill.id" 
                    class="mb-2"
                  >
                    <p class="text-[var(--fourth-color)] font-medium mb-1.5">{{ skill.name }}</p>
                    <span class="bg-black/10 block h-2 rounded-[10px] overflow-hidden">
                      <span class="h-2 float-left bg-[var(--fourth-color)]" :style="{ width: `${getProficiencyPercentage(skill.proficiency_level)}%` }"></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Certifications -->
            <section v-if="data.certifications.length" class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="certifications">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Certifications</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-full overflow-hidden my-5">
              <div 
                v-for="cert in data.certifications" 
                :key="cert.id" 
                class="flex flex-col bg-white shadow-lg border border-[var(--fourth-color)] rounded-lg overflow-hidden"
              >
                <div class="p-4">
                  <h3 class="text-[var(--fourth-color)] text-lg font-semibold mb-1">{{ cert.name }}</h3>
                  <p v-if="cert.institute_name" class="text-sm font-semibold mb-2 uppercase text-[var(--fourth-color)] opacity-70">{{ cert.institute_name }}</p>
                  <p class="text-[var(--fourth-color)] text-sm leading-relaxed mb-3">{{ cert.description || 'No description available' }}</p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-[var(--fourth-color)]">{{ formatYear(cert.start_date) }}</span>
                    <a 
                      v-if="cert.certificate_pdf"
                      :href="cert.certificate_pdf" 
                      target="_blank"
                      class="text-xs py-1.5 px-3 bg-[var(--fourth-color)] text-white rounded-[15px] no-underline hover:opacity-80 transition-opacity duration-200"
                    >
                      View Certificate
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Achievements -->
          <section v-if="data.achievements.length" class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="achievements">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Achievements</h1>
            <ul class="list-disc list-inside text-[var(--fourth-color)] mt-4 pl-4 w-full">
              <li v-for="achievement in data.achievements" :key="achievement.id" class="mb-3 leading-6">
                {{ achievement.description }}
              </li>
            </ul>
          </section>

          <!-- Publications -->
          <section v-if="data.publications.length" class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="publications">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Publications</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-full overflow-hidden my-5">
              <div 
                v-for="pub in data.publications" 
                :key="pub.id" 
                class="flex flex-col bg-white shadow-lg border border-[var(--fourth-color)] rounded-lg overflow-hidden"
              >
                <div class="p-4">
                  <h3 class="text-[var(--fourth-color)] text-lg font-semibold mb-1">{{ pub.paper_name }}</h3>
                  <p v-if="pub.conference_name" class="text-sm font-semibold mb-2 uppercase text-[var(--fourth-color)] opacity-70">{{ pub.conference_name }}</p>
                  <p class="text-[var(--fourth-color)] text-sm leading-relaxed mb-3">{{ pub.description || 'No description available' }}</p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-[var(--fourth-color)]">{{ formatYear(pub.published_date) }}</span>
                    <div class="flex gap-2">
                      <a 
                        v-if="pub.paper_pdf"
                        :href="pub.paper_pdf" 
                        target="_blank"
                        class="text-xs py-1.5 px-3 bg-[var(--fourth-color)] text-white rounded-[15px] no-underline hover:opacity-80 transition-opacity duration-200"
                      >
                        View PDF
                      </a>
                      <a 
                        v-if="pub.paper_link"
                        :href="pub.paper_link.startsWith('http') ? pub.paper_link : `https://${pub.paper_link}`" 
                        target="_blank"
                        class="text-xs py-1.5 px-3 bg-[var(--fourth-color)] text-white rounded-[15px] no-underline hover:opacity-80 transition-opacity duration-200"
                      >
                        View Paper
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Contact -->
          <section class="my-8 flex flex-col items-center justify-center min-h-fit mx-8 lg:mx-12 max-w-full break-words pt-0 lg:pt-0" id="contact">
            <h1 class="text-4xl leading-[4rem] text-[var(--fourth-color)] self-start">Contact</h1>
            <form class="w-full max-w-[600px]" @submit.prevent="handleContactSubmit">
              <div class="flex items-center">
                <input 
                  type="text" 
                  v-model="contactForm.name"
                  required
                  class="w-full m-4 text-[var(--fourth-color)] text-base pl-1.5 h-8 bg-transparent border-none border-b-2 border-solid border-[var(--fourth-color)] focus:shadow-[0_0_10px_1px_rgba(0,0,0,0.1)] focus:outline-none placeholder:text-[var(--fourth-color)] placeholder:text-base placeholder:pl-1.5" 
                  placeholder="Name" 
                />
              </div>
              <div class="flex items-center">
                <input 
                  type="email" 
                  v-model="contactForm.email"
                  required
                  class="w-full m-4 text-[var(--fourth-color)] text-base pl-1.5 h-8 bg-transparent border-none border-b-2 border-solid border-[var(--fourth-color)] focus:shadow-[0_0_10px_1px_rgba(0,0,0,0.1)] focus:outline-none placeholder:text-[var(--fourth-color)] placeholder:text-base placeholder:pl-1.5" 
                  placeholder="Email" 
                />
              </div>
              <div class="flex items-center">
                <input 
                  type="text" 
                  v-model="contactForm.subject"
                  class="w-full m-4 text-[var(--fourth-color)] text-base pl-1.5 h-8 bg-transparent border-none border-b-2 border-solid border-[var(--fourth-color)] focus:shadow-[0_0_10px_1px_rgba(0,0,0,0.1)] focus:outline-none placeholder:text-[var(--fourth-color)] placeholder:text-base placeholder:pl-1.5" 
                  placeholder="Subject" 
                />
              </div>
              <div class="flex items-center">
                <textarea 
                  v-model="contactForm.message"
                  required
                  class="w-full m-4 text-[var(--fourth-color)] text-base pl-1.5 h-16 border-none border-b-2 border-solid border-[var(--fourth-color)] focus:shadow-[0_0_10px_1px_rgba(0,0,0,0.1)] focus:outline-none placeholder:text-[var(--fourth-color)] placeholder:text-base placeholder:pl-1.5 placeholder:pt-1.5" 
                  placeholder="Message..."
                ></textarea>
              </div>
              <div class="flex items-center">
                <input type="submit" class="text-[var(--fourth-color)] bg-white py-2.5 px-5 my-12 mx-4 rounded-[30px] border-none shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] cursor-pointer hover:text-white hover:bg-[var(--fourth-color)] transition-colors duration-200" id="submit" value="submit" />
              </div>
            </form>
          </section>
        </div>
      </div>
            <!-- Navigation Menu -->
            <div class="flex flex-row lg:flex-col items-center justify-center bg-white w-auto lg:w-[70px] h-[50px] md:h-[70px] lg:h-auto ml-0 lg:ml-5 rounded-[25px] md:rounded-[50px] lg:rounded-[35px] py-0 lg:py-4 px-2 md:px-4 lg:px-0 shadow-lg fixed lg:static bottom-4 z-[1000]">
        <a href="#welcome-section" @click.prevent="scrollToSection('welcome-section')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-house"></a>
        <a href="#about" @click.prevent="scrollToSection('about')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-user"></a>
        <a v-if="data.experiences.length" href="#experience" @click.prevent="scrollToSection('experience')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-briefcase"></a>
        <a v-if="data.education.length" href="#education" @click.prevent="scrollToSection('education')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-graduation-cap"></a>
        <a v-if="data.projects.length" href="#projects" @click.prevent="scrollToSection('projects')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-code"></a>
        <a v-if="data.skillsByCategory.length" href="#skills" @click.prevent="scrollToSection('skills')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-lightbulb"></a>
        <a v-if="data.certifications.length || data.achievements.length || data.publications.length" href="#certifications" @click.prevent="scrollToSection('certifications')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-award"></a>
        <a href="#contact" @click.prevent="scrollToSection('contact')" class="text-lg md:text-2xl lg:text-3xl text-[var(--light-grey)] my-0 lg:my-4 mx-2 md:mx-4 lg:mx-0 hover:text-[var(--fourth-color)] transition-colors duration-200 fa-solid fa-envelope"></a>
      </div>
      </div>
      
      <!-- Footer -->
      <footer class="py-6 text-[var(--background-color)] mt-4">
        <p class="text-sm opacity-70">
          © {{ new Date().getFullYear() }} {{ data.userProfile.name }}. All rights reserved.
        </p>
        <p v-if="!isPremiumUser">Powered by <a href="https://www.{{ brandName }}.com" target="_blank" class="hover:underline">{{ brandName }}</a></p>
      </footer>
    </div>
  </div>

  <!-- Loader -->
  <div v-else class="min-h-screen flex items-center justify-center" :style="{ backgroundColor: background || '#302729' }">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" :style="{ borderColor: primary || '#a8858f' }"></div>
      <p class="opacity-70" :style="{ color: primary || '#a8858f' }">Loading your data...</p>
    </div>
  </div>

  <!-- Project Images Modal -->
  <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302729]/90" @click.self="showProjectModal = false">
    <div v-if="activeProject" class="rounded-lg shadow-lg w-full max-w-5xl p-6 relative bg-[#362b2e]">
      <!-- Close Button -->
      <button
        @click="showProjectModal = false"
        class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#302729] text-[var(--fourth-color)] hover:opacity-80 transition-opacity"
      >
        <span class="text-xl">✕</span>
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

  <!-- Toast Notification -->
  <div 
    v-if="showToast"
    class="fixed bottom-30 right-8 bg-gray-800 text-white px-5 py-4 rounded-lg shadow-lg opacity-0 pointer-events-none transform translate-y-5 transition-all duration-300 ease-in-out flex items-center gap-3 z-50"
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
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap");

/* Custom scrollbar */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 10px;
}

.content:hover::-webkit-scrollbar-thumb {
  background: var(--light-grey);
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Mobile scrollbar */
@media screen and (max-width: 1024px) {
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background-color);
  }

  ::-webkit-scrollbar-thumb {
    background: #fff;
    border-radius: 10px;
  }
}

@media screen and (max-width: 750px) {
  ::-webkit-scrollbar {
    display: none;
  }
}
</style>