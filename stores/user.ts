// stores/user.ts
import { defineStore } from 'pinia'
import type { User } from '../app/types/index'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isPremium: (state) => !!state.user?.website_premium,
  },
  actions: {
    setUser(user: User) {
      this.user = user
    },
    clearUser() {
      this.user = null
    },
    async fetchUser() {
      if (!this.user?.id) return
      
      try {
        const response = await $fetch('/api/users', {
          query: { userId: this.user.id }
        })
        
        if (response && (response as any).length > 0) {
          const userData = (response as any)[0]
          this.user = {
            ...this.user,
            website_premium: userData.website_premium || false
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },
  },
})
