<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <h1 class="text-3xl font-bold mb-6">Welcome to Website Builder</h1>

    <div v-if="userStore.isLoggedIn" class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-2">Logged-in User:</h2>
      <p><strong>ID:</strong> {{ userStore.user?.id }}</p>
      <p><strong>Username:</strong> {{ userStore.user?.username }}</p>
      <p><strong>Email:</strong> {{ userStore.user?.email }}</p>
    </div>

    <div v-else class="p-6 bg-red-100 dark:bg-red-800 rounded-lg shadow-md mb-6">
      <p>No user is logged in.</p>
    </div>

    <div class="w-full max-w-3xl">
      <h2 class="text-2xl font-semibold mb-4">All Users</h2>
      <div v-if="users.length === 0" class="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
        No users found.
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="user in users"
          :key="user.id"
          class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex justify-between"
        >
          <div>
            <p><strong>ID:</strong> {{ user.id }}</p>
            <p><strong>Username:</strong> {{ user.username }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { ref, onMounted } from 'vue'

interface User {
  id: number
  username: string
  email: string
}

const userStore = useUserStore()
const users = ref<User[]>([])

const fetchUsers = async () => {
  try {
    const { data } = await useFetch<User[]>('/api/users')
    users.value = data.value || []
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
