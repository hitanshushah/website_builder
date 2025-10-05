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

</script>

<template>
  <div
    v-if="data"
    class="min-h-screen"
    :style="{
      '--color-primary': primary,
      '--color-secondary': secondary,
      '--color-background': background,
    }"
  >
    <!-- Hero Section -->
    <section
      class="relative text-white py-20 px-6"
      :style="{ background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))` }"
    >
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
            <p v-if="data.userProfile.designation" class="text-xl md:text-2xl text-white/80 mb-4">
              {{ data.userProfile.designation }}
            </p>
            <p v-if="data.userProfile.bio" class="text-lg text-white/90 mb-4">{{ data.userProfile.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Introduction -->
    <section
      v-if="data?.userProfile.introduction && !data?.userProfile.hide_introduction_on_website" 
      class="py-16 px-6"
      :style="{ background: 'var(--color-background)' }"
    >
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-6" style="color: var(--color-primary)">About Me</h2>
        <p class="text-lg leading-relaxed text-black/80 dark:text-white/80">
          {{ data.userProfile.introduction }}
        </p>
      </div>
    </section>

    <!-- Experience Section -->
    <section v-if="data?.experiences.length" class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 flex items-center gap-3" style="color: var(--color-primary)">
          <UIcon name="i-lucide-briefcase" class="w-8 h-8" />
          Experience
        </h2>
        <div class="space-y-8">
          <div v-for="exp in data?.experiences" :key="exp.id" class="rounded-xl shadow-lg p-6 hover:shadow-xl transition" :style="{ background: 'var(--color-background)' }">
            <div class="flex flex-col md:flex-row gap-6">
              <div v-if="exp.company_logo" class="flex-shrink-0">
                <img :src="exp.company_logo" :alt="exp.company_name" class="w-16 h-16 rounded-lg object-cover" />
              </div>
              <div class="flex-1">
                <h3 class="text-2xl font-bold mb-1" style="color: var(--color-primary)">{{ exp.role }}</h3>
                <p class="text-lg mb-2" style="color: var(--color-secondary)">{{ exp.company_name }}</p>
                <p v-if="exp.description" class="text-black/80 dark:text-white/80 mb-4">{{ exp.description }}</p>
                <div v-if="exp.skills?.length" class="flex flex-wrap gap-2">
                  <span v-for="skill in exp.skills" :key="skill" class="px-3 py-1 rounded-full text-sm"
                        :style="{ background: 'var(--color-primary)20', color: 'var(--color-primary)' }">
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
    <section v-if="data?.projects.length" class="py-16 px-6" :style="{ background: 'var(--color-background)' }">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-10 flex items-center gap-3" style="color: var(--color-primary)">
          <UIcon name="i-lucide-folder-kanban" class="w-8 h-8" />
          Projects
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="project in data?.projects" :key="project.id" class="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition" style="background: var(--color-background)">
            <div v-if="project.assets?.length && project.settings?.show_assets && project.assets[0]" class="relative h-48">
              <img :src="project.assets[0].url" :alt="project.name" class="w-full h-full object-cover" />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold mb-3" style="color: var(--color-primary)">{{ project.name }}</h3>
              <p v-if="project.description" class="mb-4 text-black/80 dark:text-white/80">{{ project.description }}</p>
              <div v-if="project.technologies?.length" class="flex flex-wrap gap-2 mb-4">
                <span v-for="tech in project.technologies" :key="tech" class="px-2 py-1 rounded-full text-xs"
                      :style="{ background: 'var(--color-secondary)20', color: 'var(--color-secondary)' }">
                  {{ tech }}
                </span>
              </div>
              <div v-if="project.links?.length" class="flex flex-wrap gap-2">
                <a v-for="link in project.links" :key="link.url" :href="link.url" target="_blank"
                   class="px-3 py-1 text-white rounded-lg text-sm flex items-center gap-1 transition"
                   :style="{ background: 'var(--color-primary)' }">
                  <UIcon :name="`i-lucide-${link.type === 'github' ? 'github' : 'external-link'}`" class="w-4 h-4" />
                  {{ link.title }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-6 text-center text-white" :style="{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }">
      <p class="opacity-80">© {{ new Date().getFullYear() }} {{ data.userProfile.name }}. All rights reserved.</p>
    </footer>
  </div>

  <!-- Loader -->
  <div v-else class="min-h-screen flex items-center justify-center" :style="{ background: 'var(--color-background)' }">
    <div class="text-center">
      <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin mx-auto mb-4" :style="{ color: 'var(--color-primary)' }" />
      <p class="opacity-70">Loading your data...</p>
    </div>
  </div>
</template>
