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
            <UserInfo :user-profile="projectsBoardData.userProfile" />
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
            <Experience :experiences="projectsBoardData.experiences" />
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
            <Projects :projects="projectsBoardData.projects" />
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
            <Education :education="projectsBoardData.education" />
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
            <Skills :skills="projectsBoardData.skills" />
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
            <Certifications :certifications="projectsBoardData.certifications" />
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
            <Technologies :technologies="projectsBoardData.technologies" />
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
            <Achievements :achievements="projectsBoardData.achievements" />
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
            <Publications :publications="projectsBoardData.publications" />
          </div>
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400">No publications data available</p>
          </div>
        </template>
      </AccordionCard>
    </div>
  </div>
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
  console.log(`Add item to ${section}`)
  // Add your logic here to handle adding new items
  // For example, you could emit an event or call a function to show a modal
}

const userStore = useUserStore()
const projectsBoardData = ref(null)
const loading = ref(false)
const error = ref(null)

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