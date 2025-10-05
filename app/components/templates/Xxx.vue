<script setup lang="ts">
import type { ProcessedTemplateData } from '~/composables/useTemplateData'

interface Props {
  data: ProcessedTemplateData | null
  primary?: string
  secondary?: string
  background?: string
  fourth?: string
}
const props = defineProps<Props>()

const primary = props.primary
const secondary = props.secondary
const background = props.background
const fourth = props.fourth
</script>

<template>
  <div v-if="data" class="min-h-screen flex"
       :style="{ background: background }">

    <!-- Sidebar -->
    <aside class="w-80 bg-white shadow-xl p-6 flex flex-col items-center text-center sticky top-0 h-screen overflow-y-auto">
      <!-- Profile Photo & Info -->
      <img v-if="data.userProfile.profile_photo_url" :src="data.userProfile.profile_photo_url"
           class="w-32 h-32 rounded-full border-4 mb-4" :style="{ borderColor: primary }" />
      <h1 class="text-2xl font-bold mb-2" :style="{ color: primary }">{{ data.userProfile.name }}</h1>
      <p class="text-sm text-gray-500 mb-4">{{ data.userProfile.designation }}</p>
      <p class="text-gray-700 text-sm leading-relaxed">{{ data.userProfile.bio }}</p>

      <!-- Contact Info -->
      <div class="w-full mb-8 mt-6">
        <h3 class="text-lg font-semibold mb-4" :style="{ color: primary }">Contact</h3>
        <div class="space-y-2 text-sm">
          <div v-if="data.userProfile.email" class="flex items-center justify-center gap-2">
            <span class="text-gray-500">📧</span>
            <a :href="`mailto:${data.userProfile.email}`" class="text-gray-700 hover:text-blue-600">
              {{ data.userProfile.email }}
            </a>
          </div>
          <div v-if="data.userProfile.phone" class="flex items-center justify-center gap-2">
            <span class="text-gray-500">📞</span>
            <a :href="`tel:${data.userProfile.phone}`" class="text-gray-700 hover:text-blue-600">
              {{ data.userProfile.phone }}
            </a>
          </div>
          <div v-if="data.userProfile.location" class="flex items-center justify-center gap-2">
            <span class="text-gray-500">📍</span>
            <span class="text-gray-700">{{ data.userProfile.location }}</span>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div v-if="data.skills?.length" class="w-full mb-8">
        <h3 class="text-lg font-semibold mb-4" :style="{ color: primary }">Skills</h3>
        <div class="flex flex-wrap gap-2 justify-center">
          <span v-for="skill in data.skills.slice(0, 12)" :key="skill.id"
                class="text-xs px-2 py-1 rounded-full text-white"
                :style="{ backgroundColor: secondary }">
            {{ skill.name }}
          </span>
        </div>
      </div>

      <!-- Education -->
      <div v-if="data.education?.length" class="w-full">
        <h3 class="text-lg font-semibold mb-4" :style="{ color: primary }">Education</h3>
        <div class="space-y-3 text-sm">
          <div v-for="edu in data.education.slice(0, 3)" :key="edu.id" class="bg-gray-50 p-3 rounded-lg shadow">
            <p class="font-semibold text-gray-800">{{ edu.degree }}</p>
            <p class="text-gray-600">{{ edu.institution }}</p>
            <p class="text-gray-500 text-xs">{{ edu.graduation_year }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-10 space-y-12 overflow-y-auto">
      
      <!-- About Me -->
      <section v-if="data.userProfile.introduction && !data.userProfile.hide_introduction_on_website">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4" :style="{ color: primary }">About Me</h2>
          <p class="text-gray-700 leading-relaxed">{{ data.userProfile.introduction }}</p>
        </div>
      </section>

      <!-- Experiences -->
      <section v-if="data.experiences?.length">
        <h2 class="text-2xl font-semibold mb-6" :style="{ color: primary }">Professional Experience</h2>
        <div class="space-y-6">
          <div v-for="exp in data.experiences" :key="exp.id" class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold" :style="{ color: primary }">{{ exp.role }}</span>
              <span class="text-sm text-gray-500">
                {{ exp.start_date ? new Date(exp.start_date).getFullYear() : '' }} - {{ exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present' }}
              </span>
            </div>
            <div class="text-sm mb-2">
              <span :style="{ color: secondary }">{{ exp.company_name }}</span>
              <span v-if="exp.location" class="text-gray-500"> • {{ exp.location }}</span>
            </div>
            <p class="text-gray-600 leading-relaxed">{{ exp.description }}</p>
            <div v-if="exp.skills?.length" class="mt-3 flex flex-wrap gap-2">
              <span v-for="skill in exp.skills" :key="skill" class="text-xs px-2 py-1 bg-gray-200 rounded-full">{{ skill }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Projects -->
      <section v-if="data.projects?.length">
        <h2 class="text-2xl font-semibold mb-6" :style="{ color: primary }">Projects</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="project in data.projects" :key="project.id" class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 class="font-bold mb-2" :style="{ color: primary }">{{ project.name }}</h3>
            <p v-if="project.description" class="text-gray-600 mb-2">{{ project.description }}</p>
            <div v-if="project.technologies?.length" class="flex flex-wrap gap-2 mb-2">
              <span v-for="tech in project.technologies" :key="tech" class="text-xs px-2 py-1 rounded-full text-white" :style="{ backgroundColor: primary }">
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="text-center py-8 border-t border-gray-200 mt-12">
        <p class="text-gray-500">
          © {{ new Date().getFullYear() }} {{ data.userProfile.name }}. All rights reserved.
        </p>
      </footer>
    </main>
  </div>

  <!-- Loader -->
  <div v-else class="min-h-screen flex items-center justify-center" :style="{ background: background }">
    <div class="text-center">
      <div class="animate-spin text-4xl mb-4" :style="{ color: primary }">⏳</div>
      <p class="text-gray-600">Loading your portfolio...</p>
    </div>
  </div>
</template>
