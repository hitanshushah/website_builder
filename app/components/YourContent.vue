<template>
  <div class=" rounded-lg px-6">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Your Content</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">Manage your professional information and portfolio data</p>
    </div>

    <!-- Content Accordions -->
    <div class="space-y-4">
      <AccordionCard
        v-for="section in sections"
        :key="section.id"
        :title="section.title"
        :item-count="section.itemCount"
        :icon="section.icon"
        :icon-color="section.iconColor"
        :is-open="openSections[section.id]"
        :show-info="section.id === 'projects' || section.id === 'user-info'"
        @toggle="toggleAccordion(section.id)"
        @add="addItem(section.id)"
        @info="showInfoModal(section.id)"
      >
        <!-- Slot content for each section -->
        <template v-if="section.id === 'user-info'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.userProfile">
            <SectionsUserInfo :user-profile="projectsBoardData.userProfile" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No user profile data available</p>
          </div>
        </template>

        <template v-else-if="section.id === 'contact-details'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else>
            <SectionsContactDetails 
              :user-profile="projectsBoardData?.userProfile || null" 
              @updated="handleContactDetailsUpdated"
              @fieldDeleted="handleContactDetailsFieldDeleted"
              @visibilityToggled="handleContactDetailsVisibilityToggled"
            />
          </div>
        </template>

        <template v-else-if="section.id === 'experience'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.experiences?.length">
            <SectionsExperience :experiences="projectsBoardData.experiences" @deleted="handleExperienceDeleted" @updated="handleExperienceUpdated" @visibilityToggled="handleExperienceVisibilityToggled" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No experience data available</p>
          </div>
        </template>
        <template v-else-if="section.id === 'projects'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.projects?.length">
            <SectionsProjects :projects="projectsBoardData.projects" @visibilityToggled="handleProjectVisibilityToggled" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No projects data available</p>
          </div>
        </template>
        <template v-else-if="section.id === 'education'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.education?.length">
            <SectionsEducation :education="projectsBoardData.education" @deleted="handleEducationDeleted" @updated="handleEducationUpdated" @visibilityToggled="handleEducationVisibilityToggled" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No education data available</p>
          </div>
        </template>
        <template v-else-if="section.id === 'skills'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.skills?.length">
            <SectionsSkills :skills="projectsBoardData.skills" :categories="projectsBoardData.categories" @deleted="handleSkillDeleted" @categoryDeleted="handleCategoryDeleted" @updated="handleSkillUpdated" @visibilityToggled="handleSkillVisibilityToggled" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No skills data available</p>
          </div>
        </template>
        <template v-else-if="section.id === 'certifications'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.certifications?.length">
            <SectionsCertifications :certifications="projectsBoardData.certifications" @deleted="handleCertificationDeleted" @updated="handleCertificationUpdated" @visibilityToggled="handleCertificationVisibilityToggled" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No certifications data available</p>
          </div>
        </template>
        <template v-else-if="section.id === 'technologies'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.technologies?.length">
            <SectionsTechnologies :technologies="projectsBoardData.technologies" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No technologies data available</p>
          </div>
        </template>
        <template v-else-if="section.id === 'achievements'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.achievements?.length">
            <SectionsAchievements :achievements="projectsBoardData.achievements" @deleted="handleAchievementDeleted" @updated="handleAchievementUpdated" @visibilityToggled="handleAchievementVisibilityToggled" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No achievements data available</p>
          </div>
        </template>
        <template v-else-if="section.id === 'publications'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.publications?.length">
            <SectionsPublications :publications="projectsBoardData.publications" @deleted="handlePublicationDeleted" @updated="handlePublicationUpdated" @visibilityToggled="handlePublicationVisibilityToggled" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No publications data available</p>
          </div>
        </template>
      </AccordionCard>
    </div>
  </div>
  <!-- EducationForm Modal -->
<div v-if="showEducationForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
    <FormsEducationForm @close="closeEducationForm" @save="saveEducation" />
  </div>
</div>

  <!-- AchievementForm Modal -->
<FormsAchievementForm v-if="showAchievementForm" @close="closeAchievementForm" @save="saveAchievements" />

  <!-- ExperienceForm Modal -->
<FormsExperienceForm v-if="showExperienceForm" @close="closeExperienceForm" @save="saveExperience" />

  <!-- PublicationsForm Modal -->
<FormsPublicationsForm v-if="showPublicationsForm" @close="closePublicationsForm" @save="savePublication" />

  <!-- CertificationForm Modal -->
<FormsCertificationForm v-if="showCertificationForm" @close="closeCertificationForm" @save="saveCertification" />

  <!-- SkillsForm Modal -->
<FormsSkillsForm v-if="showSkillsForm" @close="closeSkillsForm" @save="saveSkill" />

  <!-- ContactDetailsForm Modal -->
<FormsContactDetailsForm v-if="showContactDetailsForm" @close="closeContactDetailsForm" @save="saveContactDetails" />

  <!-- ContactDetailsEditForm Modal (triggered from Add button when data exists) -->
<FormsContactDetailsEditForm 
  v-if="showContactDetailsEditForm && projectsBoardData?.userProfile" 
  :contact-details="{
    phone_number: projectsBoardData.userProfile.phone_number || '',
    secondary_email: projectsBoardData.userProfile.secondary_email || '',
    introduction: projectsBoardData.userProfile.introduction || ''
  }"
  @updated="saveContactDetailsFromEdit" 
  @close="closeContactDetailsEditFormFromAdd" 
/>

  <!-- ProjectsBoardModal -->
<ModalsProjectsBoardModal v-if="showProjectsBoardModal" :section="projectsBoardSection" @close="closeProjectsBoardModal" />

  <!-- ProjectsBoardInfoModal -->
<ModalsProjectsBoardInfoModal v-if="showProjectsBoardInfoModal" :section="projectsBoardInfoSection" @close="closeProjectsBoardInfoModal" />

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/user'

// Define sections data
const sections = computed(() => [
  {
    id: 'user-info',
    title: 'User Information',
    itemCount: projectsBoardData.value?.userProfile ? 1 : 0,
    icon: 'i-heroicons-user',
    iconColor: 'blue'
  },
  {
    id: 'contact-details',
    title: 'Extra Details',
    itemCount: projectsBoardData.value?.userProfile && (projectsBoardData.value.userProfile.phone_number || projectsBoardData.value.userProfile.secondary_email) ? 1 : 0,
    icon: 'i-heroicons-squares-plus-16-solid',
    iconColor: 'teal'
  },
  {
    id: 'experience',
    title: 'Experience',
    itemCount: projectsBoardData.value?.experiences?.length || 0,
    icon: 'i-heroicons-briefcase',
    iconColor: 'green'
  },
  {
    id: 'projects',
    title: 'Projects',
    itemCount: projectsBoardData.value?.projects?.length || 0,
    icon: 'i-heroicons-code-bracket',
    iconColor: 'purple'
  },
  {
    id: 'education',
    title: 'Education',
    itemCount: projectsBoardData.value?.education?.length || 0,
    icon: 'i-heroicons-academic-cap',
    iconColor: 'yellow'
  },
  {
    id: 'skills',
    title: 'Skills',
    itemCount: projectsBoardData.value?.skills?.length || 0,
    icon: 'i-heroicons-trophy',
    iconColor: 'red'
  },
  {
    id: 'certifications',
    title: 'Certifications',
    itemCount: projectsBoardData.value?.certifications?.length || 0,
    icon: 'i-heroicons-document-text',
    iconColor: 'indigo'
  },
  // {
  //   id: 'technologies',
  //   title: 'Technologies',
  //   itemCount: projectsBoardData.value?.technologies?.length || 0,
  //   icon: 'i-heroicons-cpu-chip',
  //   iconColor: 'blue'
  // },
  {
    id: 'achievements',
    title: 'Achievements',
    itemCount: projectsBoardData.value?.achievements?.length || 0,
    icon: 'i-heroicons-trophy',
    iconColor: 'yellow'
  },
  {
    id: 'publications',
    title: 'Publications',
    itemCount: projectsBoardData.value?.publications?.length || 0,
    icon: 'i-heroicons-book-open',
    iconColor: 'red'
  }
])

const openSections = ref({
  'user-info': false,
  'contact-details': false,
  'experience': false,
  'projects': false,
  'education': false,
  'skills': false,
  'certifications': false,
  'technologies': false,
  'achievements': false,
  'publications': false
})

const toggleAccordion = (section) => {
  openSections.value[section] = !openSections.value[section]
}

// Function to handle add button clicks
const addItem = (section) => {
  if (section === 'education') {
    showEducationForm.value = true
  } else if (section === 'achievements') {
    showAchievementForm.value = true
  } else if (section === 'experience') {
    showExperienceForm.value = true
  } else if (section === 'publications') {
    showPublicationsForm.value = true
  } else if (section === 'certifications') {
    showCertificationForm.value = true
  } else if (section === 'skills') {
    showSkillsForm.value = true
  } else if (section === 'contact-details') {
    // For contact details, if data exists, treat as edit
    const hasContactData = projectsBoardData.value?.userProfile && 
      (projectsBoardData.value.userProfile.phone_number || 
       projectsBoardData.value.userProfile.secondary_email || 
       projectsBoardData.value.userProfile.introduction)
    
    if (hasContactData) {
      showContactDetailsEditForm.value = true
    } else {
      showContactDetailsForm.value = true
    }
  } else if (section === 'projects' || section === 'user-info' || section === 'technologies') {
    projectsBoardSection.value = section
    showProjectsBoardModal.value = true
  }
}
const closeEducationForm = () => {
  showEducationForm.value = false
}
const saveEducation = (data) => {
  // Append new education to projectsBoardData
  projectsBoardData.value.education = projectsBoardData.value.education || []
  projectsBoardData.value.education.push(data)
  showEducationForm.value = false
}

const closeAchievementForm = () => {
  showAchievementForm.value = false
}
const saveAchievements = (data) => {
  // Append new achievements to projectsBoardData
  projectsBoardData.value.achievements = projectsBoardData.value.achievements || []
  projectsBoardData.value.achievements.push(...data.achievements)
  showAchievementForm.value = false
}

const closeExperienceForm = () => {
  showExperienceForm.value = false
}
const saveExperience = (data) => {
  // Append new experience to projectsBoardData
  projectsBoardData.value.experiences = projectsBoardData.value.experiences || []
  projectsBoardData.value.experiences.push(data)
  showExperienceForm.value = false
}

const closePublicationsForm = () => {
  showPublicationsForm.value = false
}
const savePublication = (data) => {
  // Append new publication to projectsBoardData
  projectsBoardData.value.publications = projectsBoardData.value.publications || []
  projectsBoardData.value.publications.push(data)
  showPublicationsForm.value = false
}

const closeCertificationForm = () => {
  showCertificationForm.value = false
}
const saveCertification = (data) => {
  // Append new certification to projectsBoardData
  projectsBoardData.value.certifications = projectsBoardData.value.certifications || []
  projectsBoardData.value.certifications.push(data)
  showCertificationForm.value = false
}

const closeSkillsForm = () => {
  showSkillsForm.value = false
}
const saveSkill = (data) => {
  // Append new skill to projectsBoardData
  projectsBoardData.value.skills = projectsBoardData.value.skills || []
  projectsBoardData.value.skills.push(data)
  showSkillsForm.value = false
}

const closeContactDetailsForm = () => {
  showContactDetailsForm.value = false
}

const closeContactDetailsEditFormFromAdd = () => {
  showContactDetailsEditForm.value = false
}

const saveContactDetails = (data) => {
  // Update userProfile with contact details
  if (projectsBoardData.value?.userProfile) {
    projectsBoardData.value.userProfile = {
      ...projectsBoardData.value.userProfile,
      phone_number: data.phone_number,
      secondary_email: data.secondary_email,
      introduction: data.introduction
    }
  }
  showContactDetailsForm.value = false
}

const saveContactDetailsFromEdit = (data) => {
  // Update userProfile with contact details (when edit is triggered from add button)
  if (projectsBoardData.value?.userProfile) {
    projectsBoardData.value.userProfile = {
      ...projectsBoardData.value.userProfile,
      phone_number: data.phone_number,
      secondary_email: data.secondary_email,
      introduction: data.introduction
    }
  }
  showContactDetailsEditForm.value = false
}

const handleContactDetailsUpdated = (updatedProfile) => {
  if (projectsBoardData.value?.userProfile) {
    projectsBoardData.value.userProfile = {
      ...projectsBoardData.value.userProfile,
      phone_number: updatedProfile.phone_number,
      secondary_email: updatedProfile.secondary_email,
      introduction: updatedProfile.introduction
    }
  }
}

const handleContactDetailsFieldDeleted = (field) => {
  if (projectsBoardData.value?.userProfile) {
    if (field === 'phone') {
      projectsBoardData.value.userProfile = {
        ...projectsBoardData.value.userProfile,
        phone_number: undefined
      }
    } else if (field === 'secondary_email') {
      projectsBoardData.value.userProfile = {
        ...projectsBoardData.value.userProfile,
        secondary_email: undefined
      }
    } else if (field === 'introduction') {
      projectsBoardData.value.userProfile = {
        ...projectsBoardData.value.userProfile,
        introduction: undefined
      }
    }
  }
}

const handleContactDetailsVisibilityToggled = (updatedProfile) => {
  if (projectsBoardData.value?.userProfile) {
    projectsBoardData.value.userProfile = {
      ...projectsBoardData.value.userProfile,
      hide_phone_on_website: updatedProfile.hide_phone_on_website,
      hide_secondary_email_on_website: updatedProfile.hide_secondary_email_on_website,
      hide_introduction_on_website: updatedProfile.hide_introduction_on_website,
      override_email: updatedProfile.override_email
    }
  }
}

const closeProjectsBoardModal = () => {
  showProjectsBoardModal.value = false
}

const showInfoModal = (section) => {
  projectsBoardInfoSection.value = section
  showProjectsBoardInfoModal.value = true
}

const closeProjectsBoardInfoModal = () => {
  showProjectsBoardInfoModal.value = false
}

// Generic delete handler
const handleItemDeleted = (itemId, section) => {
  if (projectsBoardData.value?.[section]) {
    projectsBoardData.value[section] = projectsBoardData.value[section].filter(
      item => item.id !== itemId
    )
  }
}

// Specific delete handlers
const handleExperienceDeleted = (experienceId) => handleItemDeleted(experienceId, 'experiences')
const handleEducationDeleted = (educationId) => handleItemDeleted(educationId, 'education')
const handleAchievementDeleted = (achievementId) => handleItemDeleted(achievementId, 'achievements')
const handlePublicationDeleted = (publicationId) => handleItemDeleted(publicationId, 'publications')
const handleCertificationDeleted = (certificationId) => handleItemDeleted(certificationId, 'certifications')
const handleSkillDeleted = (skillId) => handleItemDeleted(skillId, 'skills')

const handleCategoryDeleted = (categoryId) => {
  // Remove all skills from the deleted category
  if (projectsBoardData.value?.skills) {
    projectsBoardData.value.skills = projectsBoardData.value.skills.filter(
      skill => skill.category?.id !== categoryId
    )
  }
}

// Generic update handler
const handleItemUpdated = (updatedItem, section) => {
  if (projectsBoardData.value?.[section]) {
    const index = projectsBoardData.value[section].findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      projectsBoardData.value[section][index] = updatedItem
    }
  }
}

// Specific update handlers
const handleExperienceUpdated = (updatedExperience) => handleItemUpdated(updatedExperience, 'experiences')
const handleEducationUpdated = (updatedEducation) => handleItemUpdated(updatedEducation, 'education')
const handleSkillUpdated = (updatedSkill) => handleItemUpdated(updatedSkill, 'skills')
const handleCertificationUpdated = (updatedCertification) => handleItemUpdated(updatedCertification, 'certifications')
const handleAchievementUpdated = (updatedAchievement) => handleItemUpdated(updatedAchievement, 'achievements')
const handlePublicationUpdated = (updatedPublication) => handleItemUpdated(updatedPublication, 'publications')

// Generic visibility toggle handler
const handleVisibilityToggled = (updatedItem, section) => {
  if (projectsBoardData.value?.[section]) {
    const index = projectsBoardData.value[section].findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      projectsBoardData.value[section][index] = updatedItem
    }
  }
}

// Specific visibility toggle handlers
const handleExperienceVisibilityToggled = (updatedExperience) => handleVisibilityToggled(updatedExperience, 'experiences')
const handleEducationVisibilityToggled = (updatedEducation) => handleVisibilityToggled(updatedEducation, 'education')
const handleSkillVisibilityToggled = (updatedSkill) => handleVisibilityToggled(updatedSkill, 'skills')
const handleCertificationVisibilityToggled = (updatedCertification) => handleVisibilityToggled(updatedCertification, 'certifications')
const handleAchievementVisibilityToggled = (updatedAchievement) => handleVisibilityToggled(updatedAchievement, 'achievements')
const handlePublicationVisibilityToggled = (updatedPublication) => handleVisibilityToggled(updatedPublication, 'publications')
const handleProjectVisibilityToggled = (updatedProject) => handleVisibilityToggled(updatedProject, 'projects')

const userStore = useUserStore()
const projectsBoardData = ref(null)
const loading = ref(false)
const error = ref(null)
const showEducationForm = ref(false)
const showAchievementForm = ref(false)
const showExperienceForm = ref(false)
const showPublicationsForm = ref(false)
const showCertificationForm = ref(false)
const showSkillsForm = ref(false)
const showContactDetailsForm = ref(false)
const showContactDetailsEditForm = ref(false)
const showProjectsBoardModal = ref(false)
const projectsBoardSection = ref('')
const showProjectsBoardInfoModal = ref(false)
const projectsBoardInfoSection = ref('')

const fetchProjectsBoardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const userId = userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }
    
    const response = await $fetch('/api/projectsboard', {
      query: { userId }
    })
    projectsBoardData.value = response
  } catch (err) {
    error.value = err.message || 'Failed to fetch projects board data'
    console.error('Error fetching projects board data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjectsBoardData()
})

</script>
