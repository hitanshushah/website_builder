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

// State management
const isScrolled = ref(false)
const showProjectModal = ref(false)
const activeProject = ref<any>(null)
const activeIndex = ref(0)
const carousel = ref<any>()

// Contact form state
const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})
const isSubmitting = ref(false)

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

// Contact form handler
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Create mailto link with form data
    const email = !data.value?.userProfile.override_email && data.value?.userProfile.email 
      ? data.value.userProfile.email 
      : data.value?.userProfile.secondary_email
    
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
      
      // Show success message (you can customize this)
      alert('Your email client should open with the message pre-filled. If it doesn\'t, please copy the message and send it manually.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('There was an error submitting the form. Please try again.')
  } finally {
    isSubmitting.value = false
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
                <div href="#about" @click.prevent="scrollToSection('about')" class="text-2xl font-bold cursor-pointer" style="color: var(--primary-color)">{{ data.userProfile.name?.split(' ')[0] || 'Portfolio' }}</div>
                <div class="hidden md:flex space-x-8">
                    <a v-if="data.experiences.length" href="#experience" @click.prevent="scrollToSection('experience')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Experience</a>
                    <a v-if="data.projects.length" href="#projects" @click.prevent="scrollToSection('projects')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Projects</a>
                    <a v-if="data.skillsByCategory.length" href="#skills" @click.prevent="scrollToSection('skills')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Skills</a>
                    <a v-if="data.education.length" href="#education" @click.prevent="scrollToSection('education')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Education</a>
                    <a v-if="data.certifications.length" href="#certifications" @click.prevent="scrollToSection('certifications')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Certifications</a>
                    <a v-if="data.publications.length" href="#publications" @click.prevent="scrollToSection('publications')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Publications</a>
                    <a v-if="data.achievements.length" href="#achievements" @click.prevent="scrollToSection('achievements')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Achievements</a>
                    <a href="#contact" @click.prevent="scrollToSection('contact')" class="hover:transition-colors" style="color: var(--fourth-color)" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--fourth-color)'">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4" id="about" style="background: linear-gradient(135deg, var(--background-color) 0%, var(--primary-color) 100%);">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row items-center gap-12">
                <div class="flex-1">
                    <h1 class="text-5xl font-bold mb-4" style="color: var(--fourth-color)">Hi, I'm {{ data.userProfile.name }}</h1>
                    <p v-if="data.userProfile.designation" class="text-2xl mb-4" style="color: var(--primary-color)">And I'm a {{ data.userProfile.designation }}</p>
                    <p v-if="data.userProfile.bio" class="text-lg mb-8 max-w-2xl break-words whitespace-pre-wrap" style="color: var(--fourth-color)">{{ data.userProfile.bio }}</p>
                    <p v-if="data.userProfile.introduction && !data.userProfile.hide_introduction_on_website" class="text-lg mb-8 max-w-2xl break-words whitespace-pre-wrap" style="color: var(--fourth-color)">{{ data.userProfile.introduction }}</p>
                    
                    <!-- Contact Info -->
                    <div class="flex flex-wrap gap-4 text-md mb-6" style="color: var(--fourth-color)">
                        <span v-if="data.userProfile.city || data.userProfile.province || data.userProfile.country">
                            <i class="fas fa-map-marker-alt"></i> {{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}
                        </span>
                        <a 
                            v-if="!data.userProfile.override_email && data.userProfile.email"
                            :href="`mailto:${data.userProfile.email}`"
                            class="hover:underline transition-colors"
                            style="color: var(--fourth-color)"
                            onmouseover="this.style.color='var(--primary-color)'"
                            onmouseout="this.style.color='var(--fourth-color)'"
                        >
                            <i class="fas fa-envelope"></i> {{ data.userProfile.email }}
                        </a>
                        <a 
                            v-else-if="data.userProfile.override_email && !data.userProfile.hide_secondary_email_on_website && data.userProfile.secondary_email"
                            :href="`mailto:${data.userProfile.secondary_email}`"
                            class="hover:underline transition-colors"
                            style="color: var(--fourth-color)"
                            onmouseover="this.style.color='var(--primary-color)'"
                            onmouseout="this.style.color='var(--fourth-color)'"
                        >
                            <i class="fas fa-envelope"></i> {{ data.userProfile.secondary_email }}
                        </a>
                        <a 
                            v-if="data.userProfile.phone_number && !data.userProfile.hide_phone_on_website"
                            :href="`tel:${data.userProfile.phone_number}`"
                            class="hover:underline transition-colors"
                            style="color: var(--fourth-color)"
                            onmouseover="this.style.color='var(--primary-color)'"
                            onmouseout="this.style.color='var(--fourth-color)'"
                        >
                            <i class="fas fa-phone"></i> {{ data.userProfile.phone_number }}
                        </a>
                    </div>
                      <!-- Social Links -->
                      <div v-if="data.userProfile.links?.length" class="flex gap-4 mb-2">
                        <a 
                            v-for="link in data.userProfile.links.slice(0, 2)" 
                            :key="link.url"
                            :href="link.url" 
                            target="_blank"
                            class="px-3 py-1 rounded-full transition"
                            style="background-color: var(--primary-color); color: var(--background-color)"
                            onmouseover="this.style.backgroundColor='var(--secondary-color)'"
                            onmouseout="this.style.backgroundColor='var(--primary-color)'"
                        >
                        <i :class="getSocialIcon(link.type)"></i>
                        </a>
                    </div>
                    <!-- Documents -->
                    <div v-if="data.userProfile.documents?.length" class="flex flex-wrap gap-3 mt-6">
                        <a 
                            v-for="doc in data.userProfile.documents" 
                            :key="doc.id"
                            :href="doc.url" 
                            target="_blank"
                            class="px-4 py-2 rounded-lg transition hover:opacity-80"
                            style="background-color: var(--primary-color); color: var(--background-color)"
                        >
                            {{ doc.display_name || doc.name || 'Download' }}
                        </a>
                    </div>
                </div>
                <div class="flex-shrink-0">
                    <img 
                        v-if="data.userProfile.profile_photo_url"
                        :src="data.userProfile.profile_photo_url" 
                        :alt="data.userProfile.name"
                        class="w-64 h-64 rounded-full object-cover shadow-2xl border-8"
                        style="border-color: var(--background-color)"
                    />
                    <div 
                        v-else
                        class="w-64 h-64 rounded-full shadow-2xl border-8 flex items-center justify-center text-6xl font-bold"
                        style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: var(--background-color); border-color: var(--background-color)"
                    >
                        {{ getUserInitials }}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Experience Section -->
    <section v-if="data.experiences.length" id="experience" class="py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-12 text-center" style="color: var(--primary-color)">Experience</h2>
            <div class="space-y-8">
                <div 
                    v-for="exp in sortedExperiences" 
                    :key="exp.id"
                    class="p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--primary-color);"
                >
                    <div class="flex items-start gap-6">
                        <div class="w-16 h-16 rounded overflow-hidden border-2" style="border-color: var(--background-color)">
                            <img 
                                v-if="exp.company_logo"
                                :src="exp.company_logo" 
                                :alt="exp.company_name"
                                class="w-full h-full object-contain"
                            />
                            <div 
                                v-else
                                class="w-full h-full flex items-center justify-center font-bold text-sm"
                                style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: var(--background-color)"
                            >
                                {{ getCompanyInitials(exp.company_name) }}
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-bold mb-2" style="color: var(--fourth-color)">{{ exp.role }}</h3>
                            <p class="font-semibold mb-2" style="color: var(--background-color)">{{ exp.company_name }}</p>
                            <p class="mb-4" style="color: var(--fourth-color)">{{ exp.location || '' }} | {{ formatDateRange(exp.start_date, exp.end_date) }}</p>
                            <p v-if="exp.description" class="mb-4" style="color: var(--fourth-color)">{{ exp.description }}</p>
                            <div v-if="exp.skills?.length" class="flex flex-wrap gap-2">
                                <span 
                                    v-for="skill in exp.skills" 
                                    :key="skill"
                                    class="px-3 py-1 rounded-full text-sm font-medium"
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
    <section v-if="data.projects.length" id="projects" class="py-20 px-4" style="background-color: var(--secondary-color); ">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-12 text-center" style="color: var(--background-color)">Projects</h2>
            <div class="grid md:grid-cols-3 gap-8">
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

                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-3">
                                <h3 class="text-2xl font-bold" style="color: var(--fourth-color)">{{ project.name }}</h3>
                                <!-- Image Gallery Button -->
                                <button 
                                    v-if="getProjectImages(project.assets).length"
                                    @click="openProjectModal(project)"
                                    class="p-2 rounded-full transition hover:scale-110"
                                    style="background-color: var(--primary-color); color: var(--background-color)"
                                    title="View Project Images"
                                >
                                    <i class="fas fa-images text-sm"></i>
                                </button>
                            </div>
                            <span v-if="project.category" class="px-3 py-1 rounded-full text-sm" style="background-color: var(--primary-color); color: var(--background-color)">{{ project.category }}</span>
                        </div>
                        <p class="mb-4" style="color: var(--fourth-color)">{{ project.description || 'No description available' }}</p>
                        <div v-if="project.technologies?.length" class="flex flex-wrap gap-2 mb-4">
                            <span 
                                v-for="tech in project.technologies" 
                                :key="tech"
                                class="px-3 py-1 rounded-full text-sm"
                                style="background-color: var(--fourth-color); color: var(--background-color)"
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
                                class="hover:underline rounded-full px-3 py-1"
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
    <section v-if="data.skillsByCategory.length" id="skills" class="py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-12 text-center" style="color: var(--primary-color)">Skills</h2>
            <div class="space-y-8">
                <div 
                    v-for="[categoryName, skills] in data.skillsByCategory" 
                    :key="categoryName"
                >
                    <h3 class="text-2xl font-semibold mb-4 capitalize" style="color: var(--primary-color)">{{ categoryName }}</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div 
                            v-for="skill in skills" 
                            :key="skill.id"
                            class="p-4 rounded-lg"
                            style="background-color: var(--primary-color); "
                        >
                            <div class="flex justify-between mb-2">
                                <span class="font-semibold" style="color: var(--background-color)">{{ skill.name }}</span>
                                <span class="text-sm font-bold" style="color: var(--fourth-color)">{{ (skill.proficiency_level) }}</span>
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
    <section v-if="data.education.length" id="education" class="py-20 px-4" style="background-color: var(--secondary-color); ">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-12 text-center" style="color: var(--background-color)">Education</h2>
            <div class="flex flex-wrap space-evenly gap-8">
                <div 
                    v-for="edu in sortedEducation" 
                    :key="edu.id"
                    class="p-8 w-[30%] rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--background-color)"
                >
                    <h3 class="text-2xl font-bold mb-2" style="color: var(--fourth-color)">{{ edu.degree }}</h3>
                    <p class="font-semibold mb-2" style="color: var(--primary-color)">{{ edu.university_name }}</p>
                    <p v-if="edu.location" class="mb-2" style="color: var(--fourth-color)">{{ edu.location }}</p>
                    <p class="mb-2" style="color: var(--fourth-color)">{{ formatDateRange(edu.from_date, edu.end_date) }}</p>
                    <p v-if="edu.cgpa" class="font-semibold" style="color: var(--fourth-color)">CGPA: {{ edu.cgpa }}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Achievements Section -->
    <section v-if="data.achievements.length" id="achievements" class="py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-12 text-center" style="color: var(--primary-color)">Achievements</h2>
            <div class="max-w-4xl mx-auto">
                <ul class="space-y-4">
                    <li 
                        v-for="achievement in data.achievements" 
                        :key="achievement.id"
                        class="flex items-start gap-4"
                    >
                        <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1" style="background-color: var(--primary-color)">
                            <span class="text-sm font-bold" style="color: var(--background-color)"></span>
                        </div>
                        <p class="text-lg leading-relaxed" style="color: var(--fourth-color)">{{ achievement.description }}</p>
                    </li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Certifications Section -->
    <section v-if="data.certifications.length" id="certifications" class="py-20 px-4" style="background-color: var(--secondary-color);">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-12 text-center" style="color: var(--background-color)">Certifications</h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div 
                    v-for="cert in data.certifications" 
                    :key="cert.id"
                    class="p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--background-color)"
                >
                    <div class="flex items-start gap-4 mb-4">
                        <div class="flex-1">
                            <h3 class="text-2xl font-bold mb-2" style="color: var(--fourth-color)">{{ cert.name }}</h3>
                            <p v-if="cert.institute_name" class="text-lg font-semibold mb-3" style="color: var(--primary-color)">{{ cert.institute_name }}</p>
                        </div>
                    </div>
                    <p v-if="cert.description" class="mb-4" style="color: var(--fourth-color)">{{ cert.description }}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm" style="color: var(--fourth-color)">{{ formatYear(cert.start_date) }}</span>
                        <a 
                            v-if="cert.certificate_pdf"
                            :href="cert.certificate_pdf" 
                            target="_blank"
                            class="px-4 py-2 rounded-full text-sm font-medium transition"
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
    <section v-if="data.publications.length" id="publications" class="py-20 px-4" style="background-color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-12 text-center" style="color: var(--primary-color)">Publications</h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div 
                    v-for="pub in data.publications" 
                    :key="pub.id"
                    class="p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    style="background-color: var(--secondary-color);"
                >
                    <div class="flex items-start gap-4 mb-4">
                        <div class="flex-shrink-0">
                            <i class="fas fa-file-alt text-3xl" style="color: var(--background-color)"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-bold mb-2" style="color: var(--background-color)">{{ pub.paper_name }}</h3>
                            <p v-if="pub.conference_name" class="text-lg font-semibold mb-2 uppercase" style="color: var(--background-color)">{{ pub.conference_name }}</p>
                        </div>
                    </div>
                    <p v-if="pub.description" class="mb-4" style="color: var(--background-color)">{{ pub.description }}</p>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-calendar text-sm" style="color: var(--background-color)"></i>
                            <span class="text-sm" style="color: var(--background-color)">{{ formatYear(pub.published_date) }}</span>
                        </div>
                        <div class="flex gap-2">
                            <a 
                                v-if="pub.paper_pdf"
                                :href="pub.paper_pdf" 
                                target="_blank"
                                class="px-3 py-1 rounded-full text-xs font-medium transition"
                                style="background-color: var(--background-color); color: var(--primary-color)"
                            >
                                <i class="fas fa-file-pdf mr-1"></i>PDF
                            </a>
                            <a 
                                v-if="pub.paper_link"
                                :href="pub.paper_link.startsWith('http') ? pub.paper_link : `https://${pub.paper_link}`" 
                                target="_blank"
                                class="px-3 py-1 rounded-full text-xs font-medium transition"
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
    <section id="contact" class="py-20 px-4" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: var(--background-color)">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-8">Get In Touch</h2>
                <p class="text-xl mb-8">Feel free to reach out for collaborations or just a friendly hello</p>
            </div>
            
            <div class="grid lg:grid-cols-2 gap-12 items-start">
                <!-- Contact Information -->
                <div class="space-y-8">
                    <div>
                        <h3 class="text-2xl font-bold mb-6" style="color: var(--background-color)">Contact Information</h3>
                        <div class="space-y-4">
                            <div v-if="!data.userProfile.override_email && data.userProfile.email" class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div>
                                    <p class="font-semibold" style="color: var(--background-color)">Email</p>
                                    <a :href="`mailto:${data.userProfile.email}`" class="hover:underline" style="color: var(--background-color)">{{ data.userProfile.email }}</a>
                                </div>
                            </div>
                            <div v-else-if="data.userProfile.override_email && !data.userProfile.hide_secondary_email_on_website && data.userProfile.secondary_email" class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div>
                                    <p class="font-semibold" style="color: var(--background-color)">Email</p>
                                    <a :href="`mailto:${data.userProfile.secondary_email}`" class="hover:underline" style="color: var(--background-color)">{{ data.userProfile.secondary_email }}</a>
                                </div>
                            </div>
                            <div v-if="data.userProfile.phone_number && !data.userProfile.hide_phone_on_website" class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-phone"></i>
                                </div>
                                <div>
                                    <p class="font-semibold" style="color: var(--background-color)">Phone</p>
                                    <a :href="`tel:${data.userProfile.phone_number}`" class="hover:underline" style="color: var(--background-color)">{{ data.userProfile.phone_number }}</a>
                                </div>
                            </div>
                            <div v-if="data.userProfile.city || data.userProfile.province || data.userProfile.country" class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: var(--background-color); color: var(--primary-color)">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <div>
                                    <p class="font-semibold" style="color: var(--background-color)">Location</p>
                                    <p style="color: var(--background-color)">{{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Social Links -->
                    <div v-if="data.userProfile.links?.length">
                        <h3 class="text-2xl font-bold mb-6" style="color: var(--background-color)">Follow Me</h3>
                        <div class="flex gap-4">
                            <a 
                                v-for="link in data.userProfile.links" 
                                :key="link.url"
                                :href="link.url" 
                                target="_blank"
                                class="w-12 h-12 rounded-full flex items-center justify-center transition hover:scale-110"
                                style="background-color: var(--background-color); color: var(--primary-color)"
                            >
                                <i :class="getSocialIcon(link.type)"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 class="text-2xl font-bold mb-6" style="color: var(--fourth-color)">Send Message</h3>
                    <form @submit.prevent="handleSubmit" class="space-y-6">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label for="name" class="block text-sm font-medium mb-2" style="color: var(--fourth-color)">Name *</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    v-model="formData.name"
                                    required
                                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition"
                                    style="border-color: var(--fourth-color); color: var(--fourth-color); focus:ring-color: var(--primary-color)"
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
                                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition"
                                    style="border-color: var(--fourth-color); color: var(--fourth-color); focus:ring-color: var(--primary-color)"
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
                                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition"
                                style="border-color: var(--fourth-color); color: var(--fourth-color); focus:ring-color: var(--primary-color)"
                                placeholder="Subject"
                            />
                        </div>
                        <div>
                            <label for="message" class="block text-sm font-medium mb-2" style="color: var(--fourth-color)">Message *</label>
                            <textarea 
                                id="message" 
                                v-model="formData.message"
                                required
                                rows="5"
                                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none"
                                style="border-color: var(--fourth-color); color: var(--fourth-color); focus:ring-color: var(--primary-color)"
                                placeholder="Your message here..."
                            ></textarea>
                        </div>
                        <button 
                            type="submit"
                            class="w-full py-3 px-6 rounded-lg font-semibold transition hover:opacity-90"
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
    <footer class="py-8 px-4" style="background-color: var(--fourth-color); color: var(--background-color)">
        <div class="max-w-7xl mx-auto text-center">
            <p>&copy; {{ new Date().getFullYear() }} {{ data.userProfile.name }}. All rights reserved.</p>
        </div>
    </footer>

    <!-- Project Images Modal -->
    <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0,0,0,0.8)" @click.self="showProjectModal = false">
      <div v-if="activeProject" class="rounded-2xl shadow-2xl w-full max-w-5xl p-6 relative" style="background-color: var(--background-color)">
        <!-- Close Button -->
        <button
          @click="showProjectModal = false"
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full transition"
          style="background-color: var(--primary-color); color: var(--background-color)"
        >
          <i class="fas fa-times"></i>
        </button>

        <!-- Modal Header -->
        <div class="mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--fourth-color)">{{ activeProject.name }}</h3>
          <p v-if="activeProject.description" class="mt-2" style="color: var(--fourth-color)">{{ activeProject.description }}</p>
        </div>

        <!-- Carousel -->
        <UCarousel
          ref="carousel"
          v-slot="{ item }"
          :items="getProjectImages(activeProject.assets).map(i => i.url)"
          class="w-full mx-auto mb-6"
          @select="onProjectSelect"
        >
          <img :src="item" class="rounded-xl max-h-[70vh] object-contain mx-auto" />
        </UCarousel>

        <!-- Thumbnails -->
        <div class="flex gap-3 justify-center pt-4 flex-wrap">
          <div
            v-for="(img, i) in getProjectImages(activeProject.assets)"
            :key="i"
            class="w-20 h-20 opacity-60 hover:opacity-100 cursor-pointer transition-opacity rounded-lg overflow-hidden"
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
</style>