// stores/user.ts
import { defineStore } from 'pinia'
import type { User } from '../app/types/index'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isPremium: (state) => state.user ? state.user.premium_plan_id >= 2 : false,
    isPro: (state) => state.user?.premium_plan_id === 3,
    isLifetimePlan: (state) => state.user?.is_lifetime_plan || false,
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
            premium_plan_id: userData.premium_plan_id || 1,
            is_lifetime_plan: userData.is_lifetime_plan || false
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },
  },
})
