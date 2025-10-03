<script setup lang="ts">
import type { ProcessedTemplateData } from '~/composables/useTemplateData'
import { formatDateRange, formatPublishDate, getProficiencyColor, getProficiencyWidth } from '~/composables/useTemplateData'

interface Props {
  data: ProcessedTemplateData | null
}

defineProps<Props>()
</script>

<template>
  <div v-if="data" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <!-- Profile Photo -->
          <div v-if="data.userProfile.profile_photo_url" class="flex-shrink-0">
            <img 
              :src="data.userProfile.profile_photo_url" 
              :alt="data.userProfile.name" 
              class="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl object-cover"
            />
          </div>
          
          <!-- Profile Info -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-4xl md:text-6xl font-bold mb-2">{{ data.userProfile.name }}</h1>
            <p v-if="data.userProfile.designation" class="text-xl md:text-2xl text-blue-100 mb-4">
              {{ data.userProfile.designation }}
            </p>
            <p v-if="data.userProfile.bio" class="text-lg text-white/90 mb-4">{{ data.userProfile.bio }}</p>
            
            <!-- Location -->
            <div v-if="data.userProfile.city || data.userProfile.country" class="flex items-center justify-center md:justify-start gap-2 mb-4">
              <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
              <span>
                {{ [data.userProfile.city, data.userProfile.province, data.userProfile.country].filter(Boolean).join(', ') }}
              </span>
            </div>

            <!-- Contact Info -->
            <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
              <a v-if="data.userProfile.email && !data.userProfile.override_email" 
                 :href="`mailto:${data.userProfile.email}`" 
                 class="flex items-center gap-2 hover:text-blue-200 transition">
                <UIcon name="i-lucide-mail" class="w-5 h-5" />
                {{ data.userProfile.email }}
              </a>
              <a v-if="data.userProfile.secondary_email && !data.userProfile.hide_secondary_email_on_website" 
                 :href="`mailto:${data.userProfile.secondary_email}`" 
                 class="flex items-center gap-2 hover:text-blue-200 transition">
                <UIcon name="i-lucide-mail" class="w-5 h-5" />
                {{ data.userProfile.secondary_email }}
              </a>
              <a v-if="data.userProfile.phone_number && !data.userProfile.hide_phone_on_website" 
                 :href="`tel:${data.userProfile.phone_number}`" 
                 class="flex items-center gap-2 hover:text-blue-200 transition">
                <UIcon name="i-lucide-phone" class="w-5 h-5" />
                {{ data.userProfile.phone_number }}
              </a>
            </div>

            <!-- Social Links -->
            <div v-if="data.userProfile.links?.length" class="flex gap-4 justify-center md:justify-start">
              <a v-for="link in data.userProfile.links" 
                 :key="link.url" 
                 :href="link.url" 
                 target="_blank"
                 class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition flex items-center gap-2">
                <UIcon :name="`i-lucide-${link.type === 'linkedin' ? 'linkedin' : link.type === 'github' ? 'github' : 'link'}`" class="w-5 h-5" />
                {{ link.title }}
              </a>
            </div>

            <!-- Documents -->
            <div v-if="data.userProfile.documents?.length" class="flex gap-4 justify-center md:justify-start mt-4">
              <a v-for="doc in data.userProfile.documents" 
                 :key="doc.id" 
                 :href="doc.url" 
                 target="_blank"
                 class="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition flex items-center gap-2">
                <UIcon name="i-lucide-file-text" class="w-5 h-5" />
                {{ doc.display_name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Introduction -->
    <section v-if="data?.userProfile.introduction && !data?.userProfile.hide_introduction_on_website" 
             class="py-16 px-6 bg-white dark:bg-gray-800">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">About Me</h2>
        <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{{ data.userProfile.introduction }}</p>
      </div>
    </section>

    <!-- Experience Section -->
    <section v-if="data?.experiences.length" class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-briefcase" class="w-8 h-8" />
          Experience
        </h2>
        <div class="space-y-8">
          <div v-for="exp in data?.experiences" 
               :key="exp.id" 
               class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div class="flex flex-col md:flex-row gap-6">
              <div v-if="exp.company_logo" class="flex-shrink-0">
                <img :src="exp.company_logo" :alt="exp.company_name" class="w-16 h-16 rounded-lg object-cover" />
              </div>
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ exp.role }}</h3>
                <p class="text-lg text-blue-600 dark:text-blue-400 mb-2">{{ exp.company_name }}</p>
                <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                    {{ formatDateRange(exp.start_date, exp.end_date) }}
                  </span>
                  <span v-if="exp.location" class="flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                    {{ exp.location }}
                  </span>
                </div>
                <p v-if="exp.description" class="text-gray-700 dark:text-gray-300 mb-4">{{ exp.description }}</p>
                <div v-if="exp.skills?.length" class="flex flex-wrap gap-2">
                  <span v-for="skill in exp.skills" 
                        :key="skill" 
                        class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
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
    <section v-if="data?.projects.length" class="py-16 px-6 bg-white dark:bg-gray-800">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-folder-kanban" class="w-8 h-8" />
          Projects
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="project in data?.projects" 
               :key="project.id" 
               class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <!-- Project Images -->
            <div v-if="project.assets?.length && project.settings?.show_assets && project.assets[0]" class="relative h-48 bg-gray-200 dark:bg-gray-700">
              <img :src="project.assets[0].url" 
                   :alt="project.name" 
                   class="w-full h-full object-cover" />
            </div>
            
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ project.name }}</h3>
                <span v-if="project.category && project.settings?.show_category" 
                      class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                  {{ project.category }}
                </span>
              </div>
              
              <p v-if="project.description && project.settings?.show_description" 
                 class="text-gray-700 dark:text-gray-300 mb-4">
                {{ project.description }}
              </p>
              
              <!-- Date Range -->
              <div v-if="project.settings?.show_dates && (project.start_date || project.end_date)" 
                   class="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                {{ formatDateRange(project.start_date, project.end_date) }}
              </div>

              <!-- Technologies -->
              <div v-if="project.technologies?.length && project.settings?.show_technologies" class="flex flex-wrap gap-2 mb-4">
                <span v-for="tech in project.technologies" 
                      :key="tech" 
                      class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
                  {{ tech }}
                </span>
              </div>

              <!-- Links -->
              <div v-if="project.links?.length && project.settings?.show_links" class="flex flex-wrap gap-2">
                <a v-for="link in project.links" 
                   :key="link.url" 
                   :href="link.url" 
                   target="_blank"
                   class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1 transition">
                  <UIcon :name="`i-lucide-${link.type === 'github' ? 'github' : 'external-link'}`" class="w-4 h-4" />
                  {{ link.title }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Education Section -->
    <section v-if="data?.education.length" class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-graduation-cap" class="w-8 h-8" />
          Education
        </h2>
        <div class="space-y-6">
          <div v-for="edu in data?.education" 
               :key="edu.id" 
               class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ edu.degree }}</h3>
            <p class="text-lg text-blue-600 dark:text-blue-400 mb-2">{{ edu.university_name }}</p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span v-if="edu.from_date || edu.end_date" class="flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                {{ formatDateRange(edu.from_date, edu.end_date) }}
              </span>
              <span v-if="edu.location" class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                {{ edu.location }}
              </span>
              <span v-if="edu.cgpa" class="flex items-center gap-1">
                <UIcon name="i-lucide-award" class="w-4 h-4" />
                GPA: {{ edu.cgpa }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section v-if="data?.skills.length" class="py-16 px-6 bg-white dark:bg-gray-800">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-code" class="w-8 h-8" />
          Skills
        </h2>
        <div class="space-y-8">
          <div v-for="[category, skills] in data?.skillsByCategory" :key="category">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ category }}</h3>
            <div class="space-y-4">
              <div v-for="skill in skills" :key="skill.id">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-gray-700 dark:text-gray-300 font-medium">{{ skill.name }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ skill.proficiency_level }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div :class="[getProficiencyColor(skill.proficiency_level || 'intermediate'), getProficiencyWidth(skill.proficiency_level || 'intermediate'), 'h-2 rounded-full transition-all']"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Certifications Section -->
    <section v-if="data?.certifications.length" class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-award" class="w-8 h-8" />
          Certifications
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="cert in data?.certifications" 
               :key="cert.id" 
               class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ cert.name }}</h3>
            <p class="text-blue-600 dark:text-blue-400 mb-2">{{ cert.institute_name }}</p>
            <p v-if="cert.description" class="text-gray-700 dark:text-gray-300 mb-3">{{ cert.description }}</p>
            <div class="flex items-center justify-between">
              <span v-if="cert.start_date" class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDateRange(cert.start_date, cert.end_date) }}
              </span>
              <a v-if="cert.certificate_pdf" 
                 :href="cert.certificate_pdf" 
                 target="_blank"
                 class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm flex items-center gap-1">
                <UIcon name="i-lucide-external-link" class="w-4 h-4" />
                View Certificate
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Publications Section -->
    <section v-if="data?.publications.length" class="py-16 px-6 bg-white dark:bg-gray-800">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-book-open" class="w-8 h-8" />
          Publications
        </h2>
        <div class="space-y-6">
          <div v-for="pub in data?.publications" 
               :key="pub.id" 
               class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ pub.paper_name }}</h3>
            <p class="text-blue-600 dark:text-blue-400 mb-2">{{ pub.conference_name }}</p>
            <p v-if="pub.description" class="text-gray-700 dark:text-gray-300 mb-3">{{ pub.description }}</p>
            <div class="flex items-center gap-4">
              <span v-if="pub.published_date" class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatPublishDate(pub.published_date) }}
              </span>
              <a v-if="pub.paper_pdf" 
                 :href="pub.paper_pdf" 
                 target="_blank"
                 class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm flex items-center gap-1">
                <UIcon name="i-lucide-file-text" class="w-4 h-4" />
                View PDF
              </a>
              <a v-if="pub.paper_link" 
                 :href="pub.paper_link" 
                 target="_blank"
                 class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm flex items-center gap-1">
                <UIcon name="i-lucide-external-link" class="w-4 h-4" />
                View Online
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievements Section -->
    <section v-if="data?.achievements.length" class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-trophy" class="w-8 h-8" />
          Achievements
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="achievement in data?.achievements" 
               :key="achievement.id" 
               class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition flex items-start gap-3">
            <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <p class="text-gray-700 dark:text-gray-300">{{ achievement.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8 px-6">
      <div class="max-w-6xl mx-auto text-center">
        <p class="text-gray-400">
          © {{ new Date().getFullYear() }} {{ data.userProfile.name }}. All rights reserved.
        </p>
      </div>
    </footer>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400">Loading your data...</p>
    </div>
  </div>
</template>
