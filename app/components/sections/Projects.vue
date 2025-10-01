<template>
  <div class="space-y-4">
    <!-- No projects -->
    <div v-if="!projects || projects.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl mb-4 block">🚀</span>
      <p>No projects data available</p>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard
        v-for="(project, idx) in localProjects"
        :key="project.id"
        class="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 flex items-center gap-3">
              <!-- Thumbnail -->
              <div v-if="getProjectImages(project.assets).length" class="flex flex-col items-center gap-1 cursor-pointer" @click="openImageModal(idx)">
                <img
                  :src="getProjectImages(project.assets)[0]?.url"
                  class="w-12 h-12 rounded-lg object-cover"
                />
                <span class="text-xs text-gray-500 dark:text-gray-400">See more</span>
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-x-2 mb-2">
                  <h4 class="font-semibold text-gray-900 dark:text-white text-lg">
                    {{ project.name }}
                  </h4>
                  <span
                    v-if="project.category"
                    class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                  >
                    {{ project.category }}
                  </span>
                  <span
                    v-if="project.status"
                    class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs"
                  >
                    {{ project.status }}
                  </span>
                </div>
                <p v-if="project.start_date" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDateRange(project.start_date, project.end_date) }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <ActionButtons 
              :item="project"
              container-class="ml-3"
              :show-edit="false"
              :show-delete="false"
              @toggle-visibility="toggleVisibility"
            />
          </div>

          <!-- Description -->
          <p
            v-if="project.description"
            class="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
          >
            {{ project.description }}
          </p>

          <!-- Tech Stack -->
          <div v-if="project.technologies && project.technologies.length" class="mb-3">
            <h5 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Technologies
            </h5>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tech in project.technologies"
                :key="tech"
                class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full font-medium"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <!-- Links -->
          <div
            v-if="project.links && project.links.length"
            class="flex flex-wrap gap-4 mt-3"
          >
            <UButton
              v-for="link in project.links"
              :key="link.url"
              :label="link.title"
              size="md"
              color="neutral"
              variant="subtle"
              @click="openLink(link.url)"
            />
          </div>
        </div>
      </UCard>
    </div>

  </div>

  <!-- Image Modal -->
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" @click.self="showModal = false">
    <div v-if="activeProject" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-5xl p-6 relative">
      <!-- Close Button -->
      <button
        @click="showModal = false"
        class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <!-- Carousel -->
      <UCarousel
        ref="carousel"
        v-slot="{ item }"
        :items="getProjectImages(activeProject.assets).map(i => i.url)"
        class="w-full mx-auto mb-4"
        @select="onSelect"
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
          @click="select(i)"
        >
          <img :src="img.url" class="rounded-md object-cover w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Project } from '@/types'

const props = defineProps<{ projects: Project[] }>()
const emit = defineEmits<{ (e: 'visibilityToggled', project: Project): void }>()

const localProjects = ref<Project[]>([])
const showModal = ref(false)
const activeProject = ref<Project | null>(null)
const activeIndex = ref(0)
const carousel = ref<any>()

watch(
  () => props.projects,
  newProjects => {
    localProjects.value = [...newProjects]
  },
  { immediate: true }
)

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate) return ''
  const start = new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  if (!endDate) return `${start} - Present`
  const end = new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  return `${start} - ${end}`
}

const toggleVisibility = async (project: Project) => {
  try {
    const idx = localProjects.value.findIndex(p => p.id === project.id)
    const localProject = localProjects.value[idx]
    if (idx !== -1 && localProject) localProject.hide_on_website = !localProject.hide_on_website
    const response = await $fetch<{ success: boolean; project: Project }>('/api/projects.toggle', {
      method: 'POST',
      body: { id: project.id }
    })
    if (response.success && idx !== -1) {
      localProjects.value[idx] = response.project
      emit('visibilityToggled', response.project)
    }
  } catch (err) {
    console.error('Error toggling project visibility:', err)
  }
}

const openLink = (url: string) => window.open(url, '_blank')

const getProjectImages = (assets: any[] = []) =>
  assets
    .filter(
      a =>
        a.asset_type?.key === 'images' ||
        a.type === 'images' ||
        a.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    )
    .map(a => ({ url: a.url || a.filename, display_name: a.display_name || 'Project Image' }))

// --- Modal / Carousel Logic ---
const openImageModal = (idx: number) => {
  const project = localProjects.value[idx]
  if (!project) return
  activeProject.value = project
  activeIndex.value = 0
  showModal.value = true
}
function onClickPrev() {
  if (activeIndex.value > 0) activeIndex.value--
}
function onClickNext() {
  if (activeProject.value && activeIndex.value < getProjectImages(activeProject.value.assets).length - 1)
    activeIndex.value++
}
function onSelect(i: number) {
  activeIndex.value = i
}
function select(i: number) {
  activeIndex.value = i
  carousel.value?.emblaApi?.scrollTo(i)
}
</script>
