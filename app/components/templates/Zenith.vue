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

// Mobile menu state
const showMobileMenu = ref(false)
const isSticky = ref(false)

// Scroll tracking
const handleScroll = () => {
  isSticky.value = window.scrollY > 50
}

// Typing animation
const typedText = ref('')
const typingPhrases = computed(() => {
  const phrases: string[] = []
  if (props.data?.userProfile.designation) {
    phrases.push(props.data.userProfile.designation)
  }
  return phrases
})

let typingIndex = 0
let charIndex = 0
let isDeleting = false
let typingTimeout: any

const typeText = () => {
  const currentPhrase = typingPhrases.value[typingIndex]
  
  if (isDeleting) {
    typedText.value = currentPhrase.substring(0, charIndex - 1)
    charIndex--
    
    if (charIndex === 0) {
      isDeleting = false
      typingIndex = (typingIndex + 1) % typingPhrases.value.length
      typingTimeout = setTimeout(typeText, 500)
    } else {
      typingTimeout = setTimeout(typeText, 100)
    }
  } else {
    typedText.value = currentPhrase.substring(0, charIndex + 1)
    charIndex++
    
    if (charIndex === currentPhrase.length) {
      isDeleting = true
      typingTimeout = setTimeout(typeText, 2000)
    } else {
      typingTimeout = setTimeout(typeText, 150)
    }
  }
}

// Project modal
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

// Scroll to top
const showScrollBtn = ref(false)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScrollBtn = () => {
  showScrollBtn.value = window.scrollY > 500
}

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

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('scroll', handleScrollBtn)
  if (typingPhrases.value.length > 0) {
    setTimeout(() => typeText(), 500)
  }
  
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
  window.removeEventListener('scroll', handleScrollBtn)
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})

// Smooth scroll to section
const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  showMobileMenu.value = false
}

const colorVars = computed(() => ({
  '--primary-color': props.primary || 'crimson',
  '--background-color': props.background || '#fff',
  '--secondary-color': props.secondary || '#111',
  '--fourth-color': props.fourth || '#f1f1f1',
}))
</script>

<template>
  <div
    v-if="data"
    class="template-13 font-['Poppins',sans-serif]"
    :style="colorVars"
  >
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" />
    
    <!-- Scroll to top button -->
    <div 
      class="scroll-up-btn" 
      :class="{ show: showScrollBtn }"
      @click="scrollToTop"
    >
      <i class="fas fa-angle-up"></i>
    </div>

    <!-- Navbar -->
    <nav class="navbar" :class="{ sticky: isSticky }">
      <div class="max-width">
        <div class="logo">
          <a href="#home">{{ data.userProfile.name?.split(' ')[0] }}<span>.</span></a>
        </div>
        <ul class="menu" :class="{ active: showMobileMenu }">
          <li><a href="#home" @click="scrollToSection('home')">Home</a></li>
          <li v-if="data.projects.length"><a href="#project" @click="scrollToSection('project')">Projects</a></li>
          <li v-if="data.experiences.length"><a href="#experience" @click="scrollToSection('experience')">Experience</a></li>
          <li v-if="data.education.length"><a href="#education" @click="scrollToSection('education')">Education</a></li>
          <li v-if="data.skills.length"><a href="#skills" @click="scrollToSection('skills')">Skills</a></li>
          <li v-if="data.certifications.length"><a href="#certifications" @click="scrollToSection('certifications')">Certifications</a></li>
          <li v-if="data.publications.length"><a href="#publication" @click="scrollToSection('publication')">Publications</a></li>
          <li><a href="#contact" @click="scrollToSection('contact')">Contact</a></li>
        </ul>
        <div class="menu-btn" @click="showMobileMenu = !showMobileMenu">
          <i class="fas" :class="showMobileMenu ? 'fa-times' : 'fa-bars'"></i>
        </div>
      </div>
    </nav>

    <!-- Home Section -->
    <section class="home" id="home">
      <div class="max-width">
        <div class="home-content">
          <div class="text-1">Hello, I'm</div>
          <div class="text-2">{{ data.userProfile.name }}</div>
          <div v-if="data.userProfile.designation" class="text-3">And I'm a <span class="typing">{{ typedText }}</span></div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section 
      v-if="data.userProfile.bio || (data.userProfile.introduction && !data.userProfile.hide_introduction_on_website) || data.userProfile.documents?.length" 
      class="about" 
      id="about"
    >
      <div class="max-width">
        <!-- <h2 class="title">About Me</h2> -->
        <div class="about-content">
          <div class="column left">
            <img 
              v-if="data.userProfile.profile_photo_url"
              :src="data.userProfile.profile_photo_url" 
              :alt="data.userProfile.name" 
            />
            <div 
              v-else
              class="placeholder-img"
            >
              {{ getUserInitials }}
            </div>
          </div>
          <div class="column right">
            <h2 class="text-2xl font-bold text-[var(--secondary-color)] mb-2">{{ data.userProfile.name }}</h2>
            <p v-if="data.userProfile.designation" class="text-xl text-[var(--secondary-color)] mb-8">{{ data.userProfile.designation }}</p>
            <br />
            <p v-if="data.userProfile.bio">{{ data.userProfile.bio }}</p>
            <br />
            <p v-if="data.userProfile.introduction && !data.userProfile.hide_introduction_on_website">{{ data.userProfile.introduction }}</p>
            <div v-if="data.userProfile.documents?.length" class="documents-container">
              <a 
                v-for="doc in data.userProfile.documents" 
                :key="doc.id"
                :href="doc.url" 
                target="_blank"
                class="document-link"
              >
                {{ doc.display_name || 'Download Document' }}
              </a>
            </div>
            <div class="flex flex-wrap gap-4 text-[var(--primary-color)] mt-4!">
            <div v-if="data.userProfile.email">
              <div class="info">
                <div><i class="fas fa-envelope mr-2!"></i><a :href="`mailto:${data.userProfile.email}`" target="_blank" class="hover:underline!">{{ data.userProfile.email }}</a></div>
              </div>
            </div>
            <div v-if="data.userProfile.phone_number">
              <div class="info">
                <div><i class="fas fa-phone mr-2!"></i><a :href="`tel:${data.userProfile.phone_number}`" target="_blank" class="hover:underline!">{{ data.userProfile.phone_number }}</a></div>
              </div>
            </div>
            <div v-if="data.userProfile.city || data.userProfile.province || data.userProfile.country">
              <div class="info">
                <div><i class="fas fa-map-marker-alt mr-2!"></i>{{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}</div>
              </div>
            </div>
            <div v-if="data.userProfile.website_url">
              <div class="info">
                <div><i class="fas fa-globe mr-2!"></i><a :href="data.userProfile.website_url.startsWith('http') ? data.userProfile.website_url : `https://${data.userProfile.website_url}`" target="_blank" class="hover:underline!">{{ data.userProfile.website_url.replace(/^https?:\/\//, '') }}</a></div>
              </div>
            </div>
            <div v-if="data.userProfile.projects_board_url">
              <div class="info">
                <div><i class="fas fa-globe mr-2!"></i><a :href="data.userProfile.projects_board_url.startsWith('http') ? data.userProfile.projects_board_url : `https://${data.userProfile.projects_board_url}`" target="_blank" class="hover:underline!">{{ data.userProfile.projects_board_url.replace(/^https?:\/\//, '') }}</a></div>
              </div>
            </div>
            <div v-if="data.userProfile.links?.length" class="flex flex-wrap gap-4 flex-row">
              <div v-for="link in data.userProfile.links" :key="link.url">
                <div><i class="fa fa-share-square mr-2!"></i><a :href="link.url" target="_blank" class="hover:underline!">{{ link.title }}</a></div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section v-if="data.projects.length" class="project" id="project">
      <div class="max-width">
        <h2 class="title" style="color: var(--background-color);">Projects</h2>
        <div class="carousel-container">
          <div class="project-grid">
            <div 
              v-for="project in data.projects" 
              :key="project.id" 
              class="card"
            >
              <div class="box">
                <div 
                  v-if="getProjectImages(project.assets).length"
                  class="project-img-wrapper"
                >
                  <div 
                    class="project-img-container"
                    @click="openProjectModal(project)"
                  >
                    <img 
                      :src="getProjectImages(project.assets)[0]?.url" 
                      :alt="project.name" 
                    />
                    <div class="project-img-overlay">
                      <i class="fas fa-search-plus"></i>
                      <span>See More</span>
                    </div>
                  </div>
                  <div class="project-img-caption" @click="openProjectModal(project)">
                    <i class="fas fa-images"></i> See More Images
                  </div>
                </div>
                <div v-else class="project-img-placeholder">
                  <i class="fas fa-image"></i>
                </div>
                
                <div class="project-meta">
                  <p v-if="project.category" class="project-category">{{ project.category }}</p>
                  <p v-if="project.start_date || project.end_date" class="project-date">
                    {{ formatDateRange(project.start_date, project.end_date) }}
                  </p>
                </div>
                
                <div class="text">{{ project.name }}</div>
                <p v-if="project.description" class="project-desc break-words overflow-wrap-anywhere whitespace-pre-line">{{ project.description }}</p>
                
                <div v-if="project.technologies?.length" class="project-technologies">
                  <span 
                    v-for="tech in project.technologies.slice(0, 6)" 
                    :key="tech"
                    class="tech-tag"
                  >
                    {{ tech }}
                  </span>
                </div>
                
                <div v-if="project.links?.length" class="project-links">
                  <a 
                    v-for="link in project.links" 
                    :key="link.url"
                    :href="link.url" 
                    target="_blank"
                    class="demo"
                  >
                    {{ link.title }}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div v-if="data?.userProfile.projects_board_url" class="flex justify-center items-center mt-16!">
            <a :href="`https://${data.userProfile.projects_board_url}`" target="_blank" class="text-lg shadow-lg hover:underline! break-all px-4! py-2! rounded-lg transition-all duration-300" :style="{ color: primary, backgroundColor: background }">
              View all projects
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    <section v-if="data.experiences.length" class="skills" id="experience">
      <div class="max-width">
        <h2 class="title">Experience</h2>
        <div class="skills-content">
          <div class="column left">
            <div 
              v-for="(exp, index) in sortedExperiences.filter((_, i) => i % 2 === 0)" 
              :key="exp.id"
              class="experience-entry"
            >
              <div class="exp-header">
                <div class="company-logo" v-if="exp.company_logo">
                  <img :src="exp.company_logo" :alt="exp.company_name" />
                </div>
                <div class="company-logo-placeholder" v-else>
                  {{ getCompanyInitials(exp.company_name) }}
                </div>
                <div class="exp-title">
                  <h3 class="red">{{ exp.company_name }}, {{ exp.role }}</h3>
                  <h4 class="red">{{ formatDateRange(exp.start_date, exp.end_date) }}</h4>
                </div>
              </div>
              <p v-if="exp.description" class="break-words overflow-wrap-anywhere whitespace-pre-line">{{ exp.description }}</p>
              <p v-if="exp.location" class="exp-location">
                <i class="fas fa-map-marker-alt"></i> {{ exp.location }}
              </p>
              <br v-if="index < sortedExperiences.filter((_, i) => i % 2 === 0).length - 1">
            </div>
          </div>
          <div class="column right">
            <div 
              v-for="(exp, index) in sortedExperiences.filter((_, i) => i % 2 === 1)" 
              :key="exp.id"
              class="experience-entry"
            >
              <div class="exp-header">
                <div class="company-logo" v-if="exp.company_logo">
                  <img :src="exp.company_logo" :alt="exp.company_name" />
                </div>
                <div class="company-logo-placeholder" v-else>
                  {{ getCompanyInitials(exp.company_name) }}
                </div>
                <div class="exp-title">
                  <h3 class="red">{{ exp.company_name }}, {{ exp.role }}</h3>
                  <h4 class="red">{{ formatDateRange(exp.start_date, exp.end_date) }}</h4>
                </div>
              </div>
              <p v-if="exp.description" class="break-words overflow-wrap-anywhere whitespace-pre-line">{{ exp.description }}</p>
              <p v-if="exp.location" class="exp-location">
                <i class="fas fa-map-marker-alt"></i> {{ exp.location }}
              </p>
              <br v-if="index < sortedExperiences.filter((_, i) => i % 2 === 1).length - 1">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Education Section -->
    <section v-if="data.education.length" class="education" id="education">
      <div class="max-width">
        <h2 class="title" style="color: var(--background-color);">Education</h2>
        <div class="serv-content">
          <div 
            v-for="edu in sortedEducation" 
            :key="edu.id" 
            class="card"
          >
            <div class="box">
              <div class="text"><h3>{{ edu.degree }}</h3></div>
              <p v-if="edu.university_name">{{ edu.university_name }}</p>
              <p v-if="edu.cgpa">CGPA: {{ edu.cgpa }} -- {{ formatYear(edu.end_date || edu.from_date) }}</p>
              <p v-else-if="edu.from_date">{{ formatDateRange(edu.from_date, edu.end_date) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section v-if="data.skills.length" class="skills" id="skills">
      <div class="max-width">
        <h2 class="title">Skills</h2>
        <div class="skills-content">
          <div 
            v-for="[categoryName, skills] in data.skillsByCategory" 
            :key="categoryName" 
            class="column"
          >
            <h2 class="category-title">{{ categoryName }}</h2>
            <ul class="skills-list">
              <li v-for="skill in skills" :key="skill.id">{{ skill.name }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Certifications Section -->
    <section v-if="data.certifications.length" class="education certification" id="certifications">
      <div class="max-width">
        <h2 class="title" style="color: var(--background-color);">Certifications</h2>
        <div class="serv-content">
          <div 
            v-for="cert in data.certifications" 
            :key="cert.id" 
            class="card"
          >
            <div class="box">
              <div class="text"><h5>{{ cert.name }}</h5></div>
              <p v-if="cert.institute_name">{{ cert.institute_name }}</p>
              <p v-if="cert.description">{{ cert.description }}</p>
              <p v-if="cert.start_date">{{ formatDateRange(cert.start_date, cert.end_date) }}</p>
              <div v-if="cert.certificate_pdf" class="cert-links">
                <a :href="cert.certificate_pdf" target="_blank" class="demo">View Certificate</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievements Section -->
    <section v-if="data.achievements.length" class="skills achievements-section" style="background: var(--secondary-color); padding-top: 0px;" id="achievements">
      <div class="max-width">
        <h2 class="title" style="color: var(--background-color);">Achievements</h2>
        <div class="achievements-content">
          <ul>
            <li v-for="achievement in data.achievements" :key="achievement.id" style="color: var(--background-color);">
              {{ achievement.description }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Publications Section -->
    <section v-if="data.publications.length" class="education publication" id="publication" style="background: var(--background-color);">
      <div class="max-width">
        <h2 class="title" style="color: var(--secondary-color);">Publications</h2>
        <div class="serv-content">
          <div 
            v-for="pub in data.publications" 
            :key="pub.id" 
            class="card"
            style="background: var(--secondary-color);"
          >
            <div class="box" style="background: var(--secondary-color);">
              <div class="text" style="color: var(--background-color);"><h5>{{ pub.paper_name }}</h5></div>
              <p v-if="pub.conference_name" style="color: var(--background-color);">{{ pub.conference_name }}</p>
              <p v-if="pub.description" style="color: var(--background-color);">{{ pub.description }}</p>
              <p v-if="pub.published_date" style="color: var(--background-color);">{{ formatDate(pub.published_date) }}</p>
              <div v-if="pub.paper_pdf || pub.paper_link" class="pub-links">
                <a v-if="pub.paper_pdf" :href="pub.paper_pdf" target="_blank" class="demo" style="color: var(--secondary-color); background: var(--background-color);">View PDF</a>
                <a v-if="pub.paper_link" :href="pub.paper_link" target="_blank" class="demo" style="color: var(--secondary-color); background: var(--background-color);">View Paper</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>



    <!-- Contact Section -->
    <section class="contact" id="contact">
      <div class="max-width">
        <h2 class="title">Contact me</h2>
        <div class="contact-content">
          <div class="column left">
            <div class="icons">
              <div v-if="!data.userProfile.override_email && data.userProfile.email" class="row">
                <i class="fas fa-envelope"></i>
                <div class="info">
                  <div class="head">Email</div>
                  <div class="sub-title cursor-pointer hover:underline!"><a :href="`mailto:${data.userProfile.email}`" target="_blank">{{ data.userProfile.email }}</a></div>
                </div>
              </div>
              <div v-else-if="data.userProfile.override_email && !data.userProfile.hide_secondary_email_on_website && data.userProfile.secondary_email" class="row">
                <i class="fas fa-envelope"></i>
                <div class="info">
                  <div class="head">Email</div>
                  <div class="sub-title cursor-pointer hover:underline!"><a :href="`mailto:${data.userProfile.secondary_email}`" target="_blank">{{ data.userProfile.secondary_email }}</a></div>
                </div>
              </div>
              <div v-if="data.userProfile.phone_number && !data.userProfile.hide_phone_on_website" class="row">
                <i class="fas fa-phone"></i>
                <div class="info">
                  <div class="head">Phone</div>
                  <div class="sub-title cursor-pointer hover:underline!"><a :href="`tel:${data.userProfile.phone_number}`" target="_blank">{{ data.userProfile.phone_number }}</a></div>
                </div>
              </div>
              <div v-if="data.userProfile.website_url" class="row">
                <i class="fas fa-globe"></i>
                <div class="info">
                  <div class="head">Website</div>
                  <div class="sub-title cursor-pointer hover:underline!"><a :href="data.userProfile.website_url.startsWith('http') ? data.userProfile.website_url : `https://${data.userProfile.website_url}`" target="_blank">{{ data.userProfile.website_url.replace(/^https?:\/\//, '') }}</a></div>
                </div>
              </div>
              <div v-if="data.userProfile.projects_board_url" class="row">
                <i class="fas fa-globe"></i>
                <div class="info">
                  <div class="head">Projects Board</div>
                  <div class="sub-title cursor-pointer hover:underline!"><a :href="data.userProfile.projects_board_url.startsWith('http') ? data.userProfile.projects_board_url : `https://${data.userProfile.projects_board_url}`" target="_blank">{{ data.userProfile.projects_board_url.replace(/^https?:\/\//, '') }}</a></div>
                </div>
              </div>
              <div v-if="data.userProfile.links?.length" class="row">
                <i class="fa fa-share-square"></i>
                <div class="info">
                  <div class="head">Social Links</div>
                  <div class="social-links">
                    <a 
                      v-for="link in data.userProfile.links.slice(0, 3)" 
                      :key="link.url"
                      :href="link.url" 
                      target="_blank"
                      class="social-link"
                    >
                      {{ link.title }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column right">
            <div class="text">Message me</div>
            <form @submit.prevent="handleContactSubmit" class="contact-form">
              <div class="fields">
                <div class="field name">
                  <input type="text" v-model="contactForm.name" placeholder="Name" required>
                </div>
                <div class="field email">
                  <input type="email" v-model="contactForm.email" placeholder="Email" required>
                </div>
              </div>
              <div class="field">
                <input type="text" v-model="contactForm.subject" placeholder="Subject" required>
              </div>
              <div class="field textarea">
                <textarea cols="30" rows="10" v-model="contactForm.message" placeholder="Message.." required></textarea>
              </div>
              <div class="button-area">
                <button 
                  type="submit" 
                  :disabled="isSubmitting"
                  class="disabled:opacity-50"
                  style="width: auto; padding: 10px;"
                >
                  <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
                  <i v-else class="fas fa-paper-plane mr-2"></i>
                  {{ isSubmitting ? 'Sending...' : 'Send message' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <span>© {{ new Date().getFullYear() }} {{ data.userProfile.name || 'Portfolio' }}. All rights reserved.</span>
      <p v-if="!isPremiumUser">Powered by <a :href="brandUrl" target="_blank" class="hover:underline">{{ brandName }}</a></p>
    </footer>
  </div>

  <!-- Loader -->
  <div v-else class="min-h-screen flex items-center justify-center" :style="{ backgroundColor: background || '#111' }">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" :style="{ borderColor: primary || 'crimson' }"></div>
      <p class="opacity-70" :style="{ color: primary || 'crimson' }">Loading your data...</p>
    </div>
  </div>

  <!-- Project Images Modal -->
  <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" @click.self="showProjectModal = false">
    <div v-if="activeProject" class="rounded-lg shadow-lg w-full max-w-5xl p-6 relative" :style="{ backgroundColor: background || '#111' }">
      <!-- Close Button -->
      <button
        @click="showProjectModal = false"
        class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        <span class="text-xl text-black">✕</span>
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
    class="fixed bottom-8 right-8 bg-gray-800 text-white px-5 py-4 rounded-lg shadow-lg opacity-0 pointer-events-none transform translate-y-5 transition-all duration-300 ease-in-out flex items-center gap-3 z-50"
    :class="{ 'opacity-100 translate-y-0 pointer-events-auto': showToast }"
    :style="{ 
      boxShadow: toastType === 'success' ? '0 0 15px rgba(34, 197, 94, 0.3)' : '0 0 15px rgba(239, 68, 68, 0.3)',
      borderLeft: toastType === 'success' ? '4px solid #22c55e' : '4px solid #ef4444'
    }"
  >
    <div class="flex items-center gap-3">
      <div v-if="toastType === 'success'" class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center p-4">
        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <div v-else class="w-5 h-5 p-4 rounded-full bg-red-500 flex items-center justify-center">
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Ubuntu:wght@400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
}

html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Common styles */
section {
  padding: 100px 0;
}

.max-width {
  padding: 0 80px;
  margin: auto;
}

.template-13 {
  font-family: 'Poppins', sans-serif;
}

.about,
.education,
.skills,
.project,
.contact,
footer {
  font-family: 'Poppins', sans-serif;
}

.about .about-content,
.education .serv-content,
.skills .skills-content,
.contact .contact-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-evenly;
  gap: 20px;
}

.about .about-content {
  max-width: 100%;
  overflow: hidden;
}

section .title {
  position: relative;
  text-align: center;
  font-size: 40px;
  font-weight: 500;
  margin-bottom: 30px;
  padding-bottom: 20px;
  font-family: 'Ubuntu', sans-serif;
  color: var(--secondary-color);
}


/* Navbar */
.navbar {
  position: fixed;
  width: 100%;
  z-index: 999;
  padding: 30px 0;
  font-family: 'Ubuntu', sans-serif;
  transition: all 0.3s ease;
}

.navbar.sticky {
  padding: 15px 0;
  background: var(--primary-color);
}

.navbar .max-width {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar .logo a {
  color: #fff;
  font-size: 35px;
  font-weight: 600;
}

.navbar .logo a span {
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.navbar.sticky .logo a span {
  color: #fff;
}

.navbar .menu {
  list-style: none;
  display: flex;
  margin: 0;
}

.navbar .menu li {
  display: inline-block;
}

.navbar .menu li a {
  display: block;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  margin-left: 25px;
  transition: color 0.3s ease;
  cursor: pointer;
}

.navbar .menu li a:hover {
  color: var(--primary-color);
}

.navbar.sticky .menu li a:hover {
  color: #fff;
}

/* Menu button */
.menu-btn {
  color: #fff;
  font-size: 23px;
  cursor: pointer;
  display: none;
}

/* Scroll up button */
.scroll-up-btn {
  position: fixed;
  height: 45px;
  width: 42px;
  background: var(--primary-color);
  right: 30px;
  bottom: 10px;
  text-align: center;
  line-height: 45px;
  color: #fff;
  z-index: 9999;
  font-size: 30px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}

.scroll-up-btn.show {
  bottom: 30px;
  opacity: 1;
  pointer-events: auto;
}

.scroll-up-btn:hover {
  filter: brightness(90%);
}

/* Home section */
.home {
  display: flex;
  background: url("https://media.istockphoto.com/photos/dark-gray-and-black-grunge-cement-wall-studio-room-space-product-picture-id1337977426?b=1&k=20&m=1337977426&s=170667a&w=0&h=pXD50PRHzp_VW0Jqc3XVve3lQvKg3d5UnPb8C2urYL4=") no-repeat center;
  height: 100vh;
  color: #fff;
  min-height: 500px;
  background-size: cover;
  background-attachment: fixed;
  font-family: 'Ubuntu', sans-serif;
}

.home .max-width {
  width: 100%;
  display: flex;
}

.home .home-content .text-1 {
  font-size: 27px;
}

.home .home-content .text-2 {
  font-size: 75px;
  font-weight: 600;
  margin-left: -3px;
}

.home .home-content .text-3 {
  font-size: 40px;
  margin: 5px 0;
}

.home .home-content .text-3 span {
  color: var(--primary-color);
  font-weight: 500;
}

/* About section */
.about {
  background: var(--background-color);
}


.about .about-content .left {
  width: fit-content;
  min-width: 0;
  flex-shrink: 0;
}

.about .about-content .left img,
.about .about-content .left .placeholder-img {
  height: 300px;
  width: 300px;
  max-width: 100%;
  object-fit: cover;
  border-radius: 500px;
}

.about .about-content .left .placeholder-img {
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 100px;
  font-weight: bold;
}

.about .about-content .right {
  width: calc(55% - 15px);
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.about .about-content .right .text {
  font-size: 25px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--secondary-color);
}

.about .about-content .right .text span {
  color: var(--primary-color);
}

.about .about-content .right p {
  text-align: justify;
  color: var(--secondary-color);
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

.about .about-content .right .documents-container a,
.about .about-content .right .document-link {
  display: inline-block;
  background: var(--primary-color);
  color: #fff;
  font-size: 20px;
  font-weight: 500;
  padding: 10px 30px;
  margin-top: 20px;
  border-radius: 70px;
  border: 2px solid var(--primary-color);
  transition: all 0.3s ease;
}

.about .about-content .right .documents-container a:hover,
.about .about-content .right .document-link:hover {
  color: var(--primary-color);
  background: none;
  font-size: 22px;
}

.about .about-content .right .documents-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

/* Experience Section - Uses skills styles */
.experience-entry {
  margin-bottom: 30px;
}

.exp-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 10px;
}

.company-logo,
.company-logo-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--primary-color);
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-placeholder {
  background: var(--primary-color);
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
}

.exp-title {
  flex: 1;
}

.experience-entry h3.red,
.experience-entry h4.red {
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 5px;
}

.experience-entry h3.red {
  font-size: 18px;
  margin-bottom: 5px;
  line-height: 1.3;
}

.experience-entry h4.red {
  font-size: 16px;
  margin-bottom: 10px;
}

.experience-entry p {
  text-align: justify;
  color: var(--secondary-color);
  line-height: 1.6;
  margin-bottom: 15px;
}

.exp-location {
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.8;
}

.exp-location i {
  color: var(--primary-color);
  font-size: 12px;
}

/* Projects section */
.project {
  background: var(--secondary-color);
}


.project-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}

.project .card {
  background: var(--background-color);
  border-radius: 6px;
  padding: 15px;
  width: 40%;
  text-align: center;
  transition: all 0.3s ease;
}

/* Mobile: Single column layout */
@media (max-width: 768px) {
  .project .card {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .project-grid {
    gap: 20px;
    justify-content: center;
  }
}


.project .card .box {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 15px;
  transition: all 0.3s ease;
}

.project-img-wrapper {
  width: 100%;
}

.project-img-container {
  position: relative;
  height: auto;
  width: 100%;
  border-radius: 5px;
  border: 2px solid var(--primary-color);
  overflow: hidden;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
}

.project-img-placeholder {
  height: 200px;
  width: 100%;
  border-radius: 5px;
  border: 2px solid var(--primary-color);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
}

.project-img-container img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
  display: block;
}

.project-img-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
}

.project-img-overlay i {
  font-size: 28px;
}

.project-img-overlay span {
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.project-img-container:hover .project-img-overlay {
  opacity: 1;
}

.project-img-container:hover img {
  transform: scale(1.1);
}

.project-img-caption {
  text-align: center;
  padding: 8px;
  margin-top: 5px;
  font-size: 13px;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.project-img-caption:hover {
  background: var(--primary-color);
  color: #fff;
}

.project-img-caption i {
  margin-right: 5px;
}

.project-img-placeholder i {
  font-size: 50px;
  color: var(--secondary-color);
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.project-category {
  background: var(--primary-color);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-date {
  color: var(--secondary-color);
  font-size: 12px;
  opacity: 0.8;
}

.project .card .text {
  font-size: 25px;
  font-weight: 500;
  color: var(--primary-color);
  text-align: left;
}

.project-desc {
  color: var(--secondary-color);
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.tech-tag {
  background: var(--background-color);
  color: var(--secondary-color);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 15px;
  border: 1px solid var(--primary-color);
  font-weight: 500;
}

.project-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.demo {
  display: inline-block;
  background: var(--primary-color);
  color: var(--background-color);
  font-size: 15px;
  padding: 5px 20px;
  font-weight: 400;
  border-radius: 50px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.demo:hover {
  background: var(--background-color);
  color: var(--primary-color);
  border-color: var(--primary-color);
  border-width: 2px;
}

/* Education section */
.education {
  color: var(--background-color);
  background: var(--secondary-color);
}

.education .serv-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 20px;
}

.education .card {
  background: var(--background-color);
  text-align: center;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  flex: 1 1 calc(33.333% - 20px);
  min-width: 280px;
  max-width: calc(33.333% - 14px);
}

.education .card .box {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.education .card .text h3 {
  font-size: 25px;
  color: var(--primary-color);
  font-weight: 500;
  margin: 10px 0 7px 0;
}

.education .card p {
  color: var(--primary-color);
  margin: 10px 0;
}

.education .card .box > *:last-child {
  margin-bottom: 0;
}

.pub-links {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
  flex-wrap: wrap;
}

/* Certifications section */


.cert-links {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
  flex-wrap: wrap;
}

/* Publication section */

/* Skills section */
.skills {
  background: var(--background-color);
}

/* Experience section - keeps 2 columns */
.skills#experience .skills-content {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 30px;
}

.skills#experience .skills-content .column {
  width: calc(50% - 15px);
}

/* Skills section - 3 columns */
.skills:not(#experience) .skills-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  align-items: flex-start;
}

.skills:not(#experience) .skills-content .column {
  width: 100%;
}

.skills .skills-content .left .text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
}

.skills .skills-content .left p {
  text-align: unset;
}

.skills .skills-content .left a {
  display: inline-block;
  background: var(--primary-color);
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 16px;
  margin-top: 20px;
  border-radius: 60px;
  border: 2px solid var(--primary-color);
  transition: all 0.3s ease;
}

.skills .skills-content .left a:hover {
  color: var(--primary-color);
  background: none;
  font-size: 20px;
}

.skills .skills-content .right .bars {
  margin-bottom: 15px;
}

.skills .skills-content .right .info {
  display: flex;
  margin-bottom: 5px;
  align-items: center;
  justify-content: space-between;
}

.skills .skills-content .right span {
  font-weight: 500;
  font-size: 18px;
}

.skills .skills-content .right .line::before {
  content: "";
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  background: var(--primary-color);
}

.skills .category-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.skills-list {
  list-style: disc;
  padding: 0;
  padding-left: 20px;
}

.skills-list li {
  padding: 10px 0;
  color: var(--secondary-color);
  font-size: 16px;
}

/* Achievements section */
.achievements-section {
  background: var(--background-color);
}

.achievements-content {
  margin-top: 20px;
}

.achievements-content ul {
  list-style: disc;
  padding-left: 30px;
}

.achievements-content li {
  margin-bottom: 15px;
  color: var(--secondary-color);
  line-height: 1.6;
}

/* Contact section */
.contact {
  background: var(--background-color);
}

.contact .contact-content .column {
  width: calc(50% - 30px);
}

.contact-form {
  width: 100%;
}

.contact-form .fields {
  display: flex;
}

.contact-form .field,
.contact-form .fields .field {
  height: 45px;
  width: 100%;
  margin-bottom: 15px;
}

.contact-form .fields .field {
  margin-right: 10px;
}

.contact-form .field.name,
.contact-form .fields .field:last-child {
  margin-right: 0;
}

.contact-form .field input,
.contact-form .field textarea {
  height: 100%;
  width: 100%;
  border: 1px solid lightgrey;
  border-radius: 6px;
  outline: none;
  padding: 0 15px;
  font-size: 17px;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
}

.contact-form .field input:focus,
.contact-form .field textarea:focus {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.contact-form .field input,
.contact-form .field textarea {
  color: var(--primary-color);
}

.contact-form .field.textarea {
  height: 80px;
}

.contact-form .field textarea {
  padding-top: 10px;
  resize: none;
}

.contact-form .button-area {
  height: 47px;
}

.contact-form .button-area button {
  height: 100%;
  width: 170px;
  border: 2px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  font-size: 20px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-form .button-area button:hover {
  color: var(--primary-color);
  background: none;
}

.contact .contact-content .text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--secondary-color);
}

.contact .contact-content .icons {
  margin: 10px 0;
}

.contact .contact-content .row {
  display: flex;
  height: auto;
  align-items: flex-start;
  margin-bottom: 20px;
}

.contact .contact-content .row .info {
  margin-left: 30px;
}

.contact .contact-content .row i {
  font-size: 25px;
  color: var(--primary-color);
  margin-top: 5px;
}

.contact .contact-content .info .head {
  font-weight: 500;
  color: var(--secondary-color);
}

.contact .contact-content .info .sub-title {
  color: var(--secondary-color);
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.social-link {
  color: var(--primary-color);
  text-decoration: underline;
}

.social-link:hover {
  color: var(--secondary-color);
}

/* Footer */
footer {
  background: var(--secondary-color);
  padding: 15px 23px;
  color: #fff;
  text-align: center;
}

footer span a {
  color: var(--primary-color);
  text-decoration: none;
}

footer span a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 1104px) {
  .about .about-content .left img,
  .about .about-content .left .placeholder-img {
    height: 350px;
    width: 350px;
  }
}

@media (max-width: 991px) {
  .max-width {
    padding: 0 50px;
  }
}

/* Tablet responsive navbar */
@media (max-width: 1024px) and (min-width: 768px) {
  .navbar .menu li a {
    font-size: 16px;
    margin-left: 15px;
  }
  
  .navbar .logo a {
    font-size: 30px;
  }
  
  .navbar {
    padding: 20px 0;
  }
}

@media (max-width: 947px) {
  .menu-btn {
    display: block;
    z-index: 999;
  }

  .navbar .menu {
    position: fixed;
    height: 100vh;
    width: 100%;
    left: -100%;
    top: 0;
    background: var(--secondary-color);
    text-align: center;
    padding-top: 80px;
    transition: all 0.3s ease;
    flex-direction: column;
  }

  .navbar .menu.active {
    left: 0;
  }

  .navbar .menu li {
    display: block;
  }

  .navbar .menu li a {
    display: inline-block;
    margin: 20px 0;
    font-size: 25px;
  }

  .home .home-content .text-2 {
    font-size: 70px;
  }

  .home .home-content .text-3 {
    font-size: 35px;
  }

  .about .about-content .column {
    width: 100%;
  }

  .about .about-content .left {
    display: flex;
    justify-content: center;
    margin: 0 auto 60px;
  }

  .about .about-content .right {
    flex: 100%;
  }

  .education .serv-content {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  /* Experience section responsive */
  .skills#experience .skills-content .column {
    width: 100%;
  }
  
  /* Skills section responsive */
  .skills:not(#experience) .skills-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  .contact .contact-content .column {
    width: 100%;
    margin-bottom: 35px;
  }

  .contact-form .fields {
    flex-direction: column;
  }

  .contact-form .fields .field {
    margin-right: 0;
  }
}

@media (max-width: 690px) {
  .max-width {
    padding: 0 23px;
  }

  .home .home-content .text-2 {
    font-size: 60px;
  }

  .home .home-content .text-3 {
    font-size: 32px;
  }

  .education .serv-content {
    grid-template-columns: 1fr;
  }

  /* Skills section mobile */
  .skills:not(#experience) .skills-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .home .home-content .text-2 {
    font-size: 50px;
  }

  .home .home-content .text-3 {
    font-size: 27px;
  }

  .about .about-content .right .text,
  .skills .category-title {
    font-size: 19px;
  }

  .scroll-up-btn {
    right: 15px;
    bottom: 15px;
    height: 38px;
    width: 35px;
    font-size: 23px;
    line-height: 38px;
  }
}
</style>
