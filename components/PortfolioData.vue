<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-center py-12">
        <ProgressSpinner />
        <span class="ml-3 text-gray-600 dark:text-gray-400">Loading Website Buider...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Message severity="error" :closable="false">
        <template #icon>
          <i class="pi pi-exclamation-triangle"></i>
        </template>
        {{ error }}
      </Message>
    </div>

    <!-- Not Logged In -->
    <div v-else-if="!userStore.isLoggedIn" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Message severity="warn" :closable="false">
        <template #icon>
          <i class="pi pi-exclamation-triangle"></i>
        </template>
        Please log in to view your Website Buider.
      </Message>
    </div>

    <!-- Main Content -->
    <div v-else-if="projectsBoardData" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Accordion :multiple="true" class="w-full">
        <!-- User Profile Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-user text-primary"></i>
              <span class="font-semibold">Profile</span>
              <Button 
                variant="outlined"  
                label="Edit Profile" 
                size="small"
                class="ml-4"
                @click.stop="showRedirectModal = true"
              />
            </div>
          </template>
          <UserProfileSection :user-profile="projectsBoardData.userProfile" />
        </AccordionTab>

        <!-- Experiences Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-building text-primary"></i>
              <span class="font-semibold">Experience</span>
              <Badge v-if="projectsBoardData.experiences.length > 0" :value="projectsBoardData.experiences.length" severity="info" />
              <Button
                variant="outlined"  
                label="Add Experience" 
                size="small"
                class="ml-4"
                @click.stop="showExperienceForm = true"
              />
            </div>
          </template>
          <ExperiencesSection 
            :experiences="projectsBoardData.experiences" 
            :user-id="Number(userStore.user?.id) || 0"
            @refresh="fetchProjectsBoardData"
          />
        </AccordionTab>

        <!-- Projects Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-briefcase text-primary"></i>
              <span class="font-semibold">Projects</span>
              <Badge v-if="projectsBoardData.projects.length > 0" :value="projectsBoardData.projects.length" severity="info" />
              <Button
                variant="outlined"  
                label="Add Projects" 
                size="small"
                class="ml-4"
                @click.stop="showRedirectModal = true"
              />
            </div>
          </template>
          <ProjectsSection :projects="projectsBoardData.projects" />
        </AccordionTab>

        <!-- Technologies Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-cog text-primary"></i>
              <span class="font-semibold">Technologies</span>
              <Badge v-if="projectsBoardData.technologies.length > 0" :value="projectsBoardData.technologies.length" severity="info" />
              <Button 
                variant="outlined"  
                label="Add Technologies" 
                size="small"
                class="ml-4"
                @click.stop="showRedirectModal = true"
              />
            </div>
          </template>
          <TechnologiesSection :technologies="projectsBoardData.technologies" />
        </AccordionTab>

        <!-- Skills Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-cog text-primary"></i>
              <span class="font-semibold">Skills</span>
              <Badge v-if="projectsBoardData.skills.length > 0" :value="projectsBoardData.skills.length" severity="info" />
              <Button
                variant="outlined"  
                label="Add Skill" 
                size="small"
                class="ml-4"
                @click.stop="showSkillForm = true"
              />
            </div>
          </template>
          <SkillsSection 
            :skills="projectsBoardData.skills" 
            :user-id="Number(userStore.user?.id) || 0"
            @refresh="fetchProjectsBoardData"
          />
        </AccordionTab>

        <!-- Certifications Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-objects-column text-primary"></i>
              <span class="font-semibold">Certifications</span>
              <Badge v-if="projectsBoardData.certifications.length > 0" :value="projectsBoardData.certifications.length" severity="info" />
              <Button
                variant="outlined"  
                label="Add Certification" 
                size="small"
                class="ml-4"
                @click.stop="showCertificationForm = true"
              />
            </div>
          </template>
          <CertificationsSection 
            :certifications="projectsBoardData.certifications" 
            :user-id="Number(userStore.user?.id) || 0"
            @refresh="fetchProjectsBoardData"
          />
        </AccordionTab>

        <!-- Achievements Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-trophy text-primary"></i>
              <span class="font-semibold">Achievements</span>
              <Badge v-if="projectsBoardData.achievements.length > 0" :value="projectsBoardData.achievements.length" severity="info" />
              <Button
                variant="outlined"  
                label="Add Achievement" 
                size="small"
                class="ml-4"
                @click.stop="showAchievementForm = true"
              />
            </div>
          </template>
          <AchievementsSection 
            :achievements="projectsBoardData.achievements" 
            :user-id="Number(userStore.user?.id) || 0"
            @refresh="fetchProjectsBoardData"
          />
        </AccordionTab>

        <!-- Publications Section -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-2 w-full">
              <i class="pi pi-book text-primary"></i>
              <span class="font-semibold">Publications</span>
              <Badge v-if="projectsBoardData.publications.length > 0" :value="projectsBoardData.publications.length" severity="info" />
              <Button
                variant="outlined"  
                label="Add Publication" 
                size="small"
                class="ml-4"
                @click.stop="showPublicationForm = true"
              />
            </div>
          </template>
          <PublicationsSection 
            :publications="projectsBoardData.publications" 
            :user-id="Number(userStore.user?.id) || 0"
            @refresh="fetchProjectsBoardData"
          />
        </AccordionTab>
      </Accordion>

      <!-- Form Modals -->
      <AddExperienceForm 
        v-model="showExperienceForm"
        :user-id="Number(userStore.user?.id) || 0"
        @saved="handleFormSaved"
      />
      
      <AddAchievementForm 
        v-model="showAchievementForm"
        :user-id="Number(userStore.user?.id) || 0"
        @saved="handleFormSaved"
      />
      
      <AddCertificationForm 
        v-model="showCertificationForm"
        :user-id="Number(userStore.user?.id) || 0"
        @saved="handleFormSaved"
      />
      
      <AddPublicationForm 
        v-model="showPublicationForm"
        :user-id="Number(userStore.user?.id) || 0"
        @saved="handleFormSaved"
      />
      
      <AddSkillForm 
        v-model="showSkillForm"
        :user-id="Number(userStore.user?.id) || 0"
        @saved="handleFormSaved"
      />

      <!-- Redirect Modal -->
      <Dialog 
        v-model:visible="showRedirectModal" 
        modal 
        header="Redirect to ProjectsBoard" 
        :style="{ width: '400px' }"
      >
        <div class="text-center py-4">
          <p class="text-gray-600 dark:text-gray-400">
            To add projects, edit profile, and add technologies, please log in to ProjectsBoard.
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <Button 
              label="Cancel" 
              severity="secondary" 
              @click="showRedirectModal = false"
            />
            <Button 
              label="Go to ProjectsBoard" 
              @click="goToProjectsBoard"
            />
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { ref, onMounted } from 'vue'
import type { ProjectsBoardData, UserProfile } from '../types'
import UserProfileSection from './UserProfileSection.vue'
import ProjectsSection from './ProjectsSection.vue'
import TechnologiesSection from './TechnologiesSection.vue'
import SkillsSection from './SkillsSection.vue'
import CertificationsSection from './CertificationsSection.vue'
import AchievementsSection from './AchievementsSection.vue'
import ExperiencesSection from './ExperiencesSection.vue'
import PublicationsSection from './PublicationsSection.vue'
import AddExperienceForm from './AddExperienceForm.vue'
import AddAchievementForm from './AddAchievementForm.vue'
import AddCertificationForm from './AddCertificationForm.vue'
import AddPublicationForm from './AddPublicationForm.vue'
import AddSkillForm from './AddSkillForm.vue'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

const userStore = useUserStore()
const projectsBoardData = ref<ProjectsBoardData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

interface Emits {
  (e: 'user-profile-loaded', profile: UserProfile): void
}

const emit = defineEmits<Emits>()

// Form state management
const showExperienceForm = ref(false)
const showAchievementForm = ref(false)
const showCertificationForm = ref(false)
const showPublicationForm = ref(false)
const showSkillForm = ref(false)

// Redirect modal state
const showRedirectModal = ref(false)

const fetchProjectsBoardData = async () => {
  if (!userStore.user?.id) {
    error.value = 'User not authenticated'
    return
  }

  loading.value = true
  error.value = null

  try {
    const data = await $fetch<ProjectsBoardData>('/api/projectsboard', {
      query: { userId: userStore.user.id }
    })
    
    if (data) {
      projectsBoardData.value = data
      // Emit user profile to parent component
      if (data.userProfile) {
        emit('user-profile-loaded', data.userProfile)
      }
    } else {
      error.value = 'No data received from server'
    }
  } catch (err: any) {
    console.error('Failed to fetch Website Buider data:', err)
    error.value = 'Failed to load Website Buider data'
  } finally {
    loading.value = false
  }
}

const handleFormSaved = () => {
  fetchProjectsBoardData()
}

const goToProjectsBoard = () => {
  showRedirectModal.value = false
  window.open('https://projectsboard.live', '_blank')
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchProjectsBoardData()
  }
})
</script>
