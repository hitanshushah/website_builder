<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="admin-header">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>
      <div class="admin-stats grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="stat-card bg-white p-6 rounded-lg shadow transition-all duration-200 hover:shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900">Total Users</h3>
          <p class="text-3xl font-bold text-blue-600">{{ users.length }}</p>
        </div>
        <div class="stat-card bg-white p-6 rounded-lg shadow transition-all duration-200 hover:shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900">Lifetime Users</h3>
          <p class="text-3xl font-bold text-green-600">{{ lifetimeUsers }}</p>
        </div>
        <div class="stat-card bg-white p-6 rounded-lg shadow transition-all duration-200 hover:shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900">Super Admins</h3>
          <p class="text-3xl font-bold text-red-600">{{ superAdmins }}</p>
        </div>
        <div class="stat-card bg-white p-6 rounded-lg shadow transition-all duration-200 hover:shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900">Verified Domains</h3>
          <p class="text-3xl font-bold text-purple-600">{{ verifiedDomains }}</p>
        </div>
      </div>
    </div>

    <div class="admin-content">
      <div class="users-table-container bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">User Management</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website URLs</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ user.profile_name?.charAt(0) || user.username.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.profile_name || user.username }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ user.email }}
                      </div>
                      <div class="flex items-center mt-1">
                        <span v-if="user.is_super_admin" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Super Admin
                        </span>
                        <span v-if="user.is_lifetime_plan" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          Lifetime
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.plan_name }}</div>
                  <div class="text-sm text-gray-500">${{ user.plan_price }}/month</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    <div v-if="user.personal_website_url" class="mb-1">
                      <div class="flex items-center gap-2">
                        <a :href="`https://${user.personal_website_url}`" target="_blank" class="text-blue-600 hover:text-blue-800">
                          {{ user.personal_website_url }}
                        </a>
                        <UButton
                          @click="testUserDomainConnection(user)"
                          :loading="testingDomain === user.id"
                          variant="outline"
                          color="primary"
                          size="xs"
                          icon="i-heroicons-rss-16-solid"
                          class="cursor-pointer"
                        >
                          {{ testingDomain === user.id ? 'Testing...' : 'Test' }}
                        </UButton>
                      </div>
                    </div>
                    <div v-if="user.website_url" class="text-sm">
                      <a :href="user.website_url" target="_blank" class="text-blue-600 hover:text-blue-800">
                        {{ user.website_url }}
                      </a>
                    </div>
                    <div v-if="!user.personal_website_url && !user.website_url" class="text-gray-500">
                      No URLs
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span v-if="user.domain_verified" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Not Verified
                    </span>
                  </div>
                  <div v-if="user.domain_key" class="text-xs text-gray-500 mt-1">
                    Key: {{ user.domain_key }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="openUserModal(user)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Edit Modal -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <select v-model="editingUser.premium_plan_id" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.name }} - ${{ plan.price }}/month
                </option>
              </select>
            </div>
            
            <div class="flex items-center">
              <input
                v-model="editingUser.is_lifetime_plan"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">Lifetime Plan</label>
            </div>
            
            <div class="flex items-center">
              <input
                v-model="editingUser.is_super_admin"
                type="checkbox"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">Super Admin</label>
            </div>
            
            <div class="flex items-center">
              <input
                v-model="editingUser.domain_verified"
                type="checkbox"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">Domain Verified</label>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="closeUserModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              @click="saveUser"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'

// Define types for our data
interface AdminUser {
  id: number
  username: string
  email: string
  premium_plan_id: number
  is_lifetime_plan: boolean
  is_super_admin: boolean
  created_at: string
  updated_at: string
  profile_name?: string
  personal_website_url?: string
  website_url?: string
  domain_verified?: boolean
  domain_key?: string
  domain_value?: string
  plan_name?: string
  plan_key?: string
  plan_price?: number
}

interface PremiumPlan {
  id: number
  key: string
  name: string
  price: number
  created_at: string
  updated_at: string
}

// Middleware to ensure only super admins can access
definePageMeta({
  middleware: 'admin' as any
})

const users = ref<AdminUser[]>([])
const plans = ref<PremiumPlan[]>([])
const showUserModal = ref(false)
const editingUser = ref<Partial<AdminUser>>({})
const testingDomain = ref<number | null>(null)
const domainTestResults = ref<Record<number, any>>({})

const lifetimeUsers = computed(() => users.value.filter(user => user.is_lifetime_plan).length)
const superAdmins = computed(() => users.value.filter(user => user.is_super_admin).length)
const verifiedDomains = computed(() => users.value.filter(user => user.domain_verified).length)

onMounted(async () => {
  await loadUsers()
  await loadPlans()
})

const loadUsers = async () => {
  try {
    const response = await $fetch<{ success: boolean; users: AdminUser[] }>('/api/admin/users')
    users.value = response.users
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const loadPlans = async () => {
  try {
    const response = await $fetch<{ success: boolean; plans: PremiumPlan[] }>('/api/admin/plans')
    plans.value = response.plans
  } catch (error) {
    console.error('Error loading plans:', error)
  }
}

const openUserModal = (user: AdminUser) => {
  editingUser.value = { ...user }
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = {}
}

const saveUser = async () => {
  try {
    await $fetch('/api/admin/users', {
      method: 'PUT',
      body: {
        userId: editingUser.value.id,
        updates: {
          premium_plan_id: editingUser.value.premium_plan_id,
          is_lifetime_plan: editingUser.value.is_lifetime_plan,
          is_super_admin: editingUser.value.is_super_admin,
          domain_verified: editingUser.value.domain_verified
        }
      }
    })
    
    // Update the user in the local array
    const userIndex = users.value.findIndex(u => u.id === editingUser.value.id)
    if (userIndex !== -1 && editingUser.value.id) {
      users.value[userIndex] = { ...users.value[userIndex], ...editingUser.value } as AdminUser
    }
    
    closeUserModal()
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

const testUserDomainConnection = async (user: AdminUser) => {
  if (!user.personal_website_url) {
    return
  }
  const config = useRuntimeConfig()
  const ddnsHostname = config.public.ddns || 'your-ddns-domain.com'

  testingDomain.value = user.id
  domainTestResults.value[user.id] = null

  try {
    const response = await $fetch('/api/ping-domain', {
      method: 'POST',
      body: {
        domain: user.personal_website_url,
        expectedHostname: ddnsHostname, // You might want to get this from config
        userId: user.id
      }
    })

    domainTestResults.value[user.id] = response

    // Show toast notification based on result
    const result = response as any
    if (result.success && result.ipCorrect) {
      if (result.isCorrect) {
        useToast().add({
          title: 'Domain Test: Success!',
          description: `${user.personal_website_url} is correctly configured`,
          color: 'success'
        })
      } else {
        useToast().add({
          title: 'Domain Test: Partial Success',
          description: `${user.personal_website_url} points correctly but verification pending`,
          color: 'warning'
        })
      }
    } else if (result.success && !result.ipCorrect) {
      useToast().add({
        title: 'Domain Test: Incorrect Configuration',
        description: `${user.personal_website_url} is not pointing to the correct server`,
        color: 'error'
      })
    } else {
      useToast().add({
        title: 'Domain Test: Failed',
        description: `Domain not configured correctly ${user.personal_website_url}`,
        color: 'error'
      })
    }
  } catch (error: any) {
    useToast().add({
      title: 'Domain Test: Error',
      description: error.data?.statusMessage || 'Failed to test domain connection',
      color: 'error'
    })
  } finally {
    testingDomain.value = null
  }
}
</script>
