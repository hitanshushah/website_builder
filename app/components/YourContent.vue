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
        @toggle="toggleAccordion(section.id)"
        @add="addItem(section.id)"
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

        <template v-else-if="section.id === 'experience'">
          <div v-if="loading">
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
          <div v-else-if="projectsBoardData?.experiences?.length">
            <SectionsExperience :experiences="projectsBoardData.experiences" @deleted="handleExperienceDeleted" />
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
            <SectionsProjects :projects="projectsBoardData.projects" />
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
            <SectionsEducation :education="projectsBoardData.education" @deleted="handleEducationDeleted" />
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
            <SectionsSkills :skills="projectsBoardData.skills" @deleted="handleSkillDeleted" @categoryDeleted="handleCategoryDeleted" />
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
            <SectionsCertifications :certifications="projectsBoardData.certifications" @deleted="handleCertificationDeleted" />
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
            <SectionsAchievements :achievements="projectsBoardData.achievements" @deleted="handleAchievementDeleted" />
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
            <SectionsPublications :publications="projectsBoardData.publications" @deleted="handlePublicationDeleted" />
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

  <!-- ProjectsBoardModal -->
<ModalsProjectsBoardModal v-if="showProjectsBoardModal" :section="projectsBoardSection" @close="closeProjectsBoardModal" />

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
  {
    id: 'technologies',
    title: 'Technologies',
    itemCount: projectsBoardData.value?.technologies?.length || 0,
    icon: 'i-heroicons-cpu-chip',
    iconColor: 'blue'
  },
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

const closeProjectsBoardModal = () => {
  showProjectsBoardModal.value = false
}

const handleExperienceDeleted = (experienceId) => {
  // Remove the deleted experience from the data
  if (projectsBoardData.value?.experiences) {
    projectsBoardData.value.experiences = projectsBoardData.value.experiences.filter(
      exp => exp.id !== experienceId
    )
  }
}

const handleEducationDeleted = (educationId) => {
  // Remove the deleted education from the data
  if (projectsBoardData.value?.education) {
    projectsBoardData.value.education = projectsBoardData.value.education.filter(
      edu => edu.id !== educationId
    )
  }
}

const handleAchievementDeleted = (achievementId) => {
  // Remove the deleted achievement from the data
  if (projectsBoardData.value?.achievements) {
    projectsBoardData.value.achievements = projectsBoardData.value.achievements.filter(
      achievement => achievement.id !== achievementId
    )
  }
}

const handlePublicationDeleted = (publicationId) => {
  // Remove the deleted publication from the data
  if (projectsBoardData.value?.publications) {
    projectsBoardData.value.publications = projectsBoardData.value.publications.filter(
      publication => publication.id !== publicationId
    )
  }
}

const handleCertificationDeleted = (certificationId) => {
  // Remove the deleted certification from the data
  if (projectsBoardData.value?.certifications) {
    projectsBoardData.value.certifications = projectsBoardData.value.certifications.filter(
      certification => certification.id !== certificationId
    )
  }
}

const handleSkillDeleted = (skillId) => {
  // Remove the deleted skill from the data
  if (projectsBoardData.value?.skills) {
    projectsBoardData.value.skills = projectsBoardData.value.skills.filter(
      skill => skill.id !== skillId
    )
  }
}

const handleCategoryDeleted = (categoryId) => {
  // Remove all skills from the deleted category
  if (projectsBoardData.value?.skills) {
    projectsBoardData.value.skills = projectsBoardData.value.skills.filter(
      skill => skill.category?.id !== categoryId
    )
  }
}

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
const showProjectsBoardModal = ref(false)
const projectsBoardSection = ref('')

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
