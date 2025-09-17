<template>
  <div>
    <Navbar :user-profile="userProfile" />
    <PortfolioData @user-profile-loaded="handleUserProfileLoaded" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '../components/Navbar.vue'
import PortfolioData from '../components/PortfolioData.vue'
import type { UserProfile } from '../types'

const userProfile = ref<UserProfile | null>(null)

const handleUserProfileLoaded = (profile: UserProfile) => {
  userProfile.value = profile
}
</script>
