<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <h1 class="text-3xl font-bold mb-6">Welcome to Website Builder</h1>

    <div v-if="userStore.isLoggedIn" class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-2">Logged-in User:</h2>
      <p><strong>ID:</strong> {{ userStore.user?.id }}</p>
      <p><strong>Username:</strong> {{ userStore.user?.username }}</p>
      <p><strong>Email:</strong> {{ userStore.user?.email }}</p>
      <p><strong>Created At:</strong> {{ formatDate(userStore.user?.created_at) }}</p>
      <p><strong>Updated At:</strong> {{ formatDate(userStore.user?.updated_at) }}</p>
    </div>

    <div v-else class="p-6 bg-red-100 dark:bg-red-800 rounded-lg shadow-md">
      <p>No user is logged in.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { computed } from 'vue'

const userStore = useUserStore()

const formatDate = (date: string | Date | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
body {
  margin: 0;
}
</style>
