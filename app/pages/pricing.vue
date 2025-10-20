<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
    <UContainer class="max-w-7xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h1>
      </div>
      <div v-if="currentPlanId !== 1 && !userStore.isLifetimePlan" class="text-center md:text-end mt-4 mb-4">
          <UButton
            color="primary"
            variant="outline"
            @click="handleManageMembership"
            class="cursor-pointer"
          >
            Manage Membership
          </UButton>
        </div>
        <div v-if="currentPlanId !== 1 && userStore.isLifetimePlan" class="text-center md:text-end mt-4 mb-4">
          <UButton
            color="warning"
            variant="outline"
            disabled
          >
            Lifetime Plan
          </UButton>
        </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-white-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400 text-lg">Loading pricing plans...</p>
        </div>
      </div>

      <!-- Pricing Table -->
      <div v-else class="mb-12">
        <UPricingTable :tiers="tiers" :sections="sections" />
      </div>

    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../stores/user'

interface PremiumPlan {
  id: number
  key: string
  name: string
  price: number
  created_at: Date
  updated_at: Date
}

useHead({
  title: 'Pricing Plans - Website Builder',
  meta: [
    { name: 'description', content: 'Choose the perfect plan for your portfolio website. Upgrade or downgrade at any time.' }
  ]
})

const toast = useToast()
const config = useRuntimeConfig()
const userStore = useUserStore()

const appDomain = computed(() => {
  const domain = config.public.domainUrl
  return domain || 'example.com'
})

const dbPlans = ref<PremiumPlan[]>([])
const loading = ref(true)

const currentPlanId = computed(() => userStore.user?.premium_plan_id || 1)

const fetchPlans = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; data: PremiumPlan[] }>('/api/premium-plans')
    dbPlans.value = response.data
  } catch (error) {
    console.error('Error fetching premium plans:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load pricing plans',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const getPlanByKey = (key: string) => {
  return dbPlans.value.find(plan => plan.key === key)
}

const formatPrice = (price: number) => {
  return price === 0 ? 'Free' : `$${price}`
}

const getButtonConfig = (planId: number, planName: string) => {
  const isCurrentPlan = currentPlanId.value === planId
  const isLowerTier = planId < currentPlanId.value
  
  if (isCurrentPlan) {
    return {
      label: 'Current Plan',
      color: 'neutral' as const,
      variant: 'subtle' as const,
      disabled: true
    }
  }
  
  if (isLowerTier) {
    if (userStore.isLifetimePlan) {
      return {
        label: 'Lifetime Plan',
        color: 'neutral' as const,
        variant: 'outline' as const,
        disabled: true
      }
    } 
    else {
      return {
        label: 'Downgrade',
        color: 'neutral' as const,
        variant: 'outline' as const,
        onClick: () => handlePlanChange(planId, planName, 'downgrade')
      }
    }
  }
  
  return {
    label: `Upgrade to ${planName}`,
    onClick: () => handlePlanChange(planId, planName, 'upgrade')
  }
}

const tiers = computed(() => {
  if (!dbPlans.value.length) return []

  const availablePlans = dbPlans.value.map((plan) => {
    return {
      id: plan.key,
      title: plan.name,
      price: formatPrice(plan.price),
      billingCycle: plan.price === 0 ? '' : '/month',
      button: getButtonConfig(plan.id, plan.name),
      highlight: currentPlanId.value === plan.id,
      badge: plan.key === 'plus' ? 'Most Popular' : undefined
    }
  })

  return availablePlans
})


const sections = computed(() => [
  {
    title: 'Features',
    features: [
      {
        title: 'Premium Templates',
        tiers: {
          basic: false,
          plus: true,
          pro: true
        }
      },
      {
        title: 'Data Management',
        tiers: {
          basic: true,
          plus: true,
          pro: true
        }
      },
      {
        title: 'Visibility Controls',
        tiers: {
          basic: true,
          plus: true,
          pro: true
        }
      },
      {
        title: `Custom Subdomain (.${appDomain.value})`,
        tiers: {
          basic: true,
          plus: true,
          pro: true
        }
      },
      {
        title: 'Contact Form in Website',
        tiers: {
          basic: true,
          plus: true,
          pro: true
        }
      }
    ]
  },
  {
    title: 'Customization',
    features: [
      {
        title: 'Customize Color Themes',
        tiers: {
          basic: false,
          plus: true,
          pro: true
        }
      },
      {
        title: 'Use Your Own Domain',
        tiers: {
          basic: false,
          plus: false,
          pro: true
        }
      },
      {
        title: 'Remove Website Powered by Text',
        tiers: {
          basic: false,
          plus: false,
          pro: true
        }
      }
    ]
  },
])

const handlePlanChange = async (planId: number, planName: string, action: 'upgrade' | 'downgrade') => {
  if (action === 'downgrade') {
    handleManageMembership()
    return
  }

  // For upgrades, redirect to Stripe checkout
  try {
    const plan = dbPlans.value.find(p => p.id === planId)
    if (!plan) {
      throw new Error('Plan not found')
    }

    // Skip Stripe checkout for free plans
    if (plan.price === 0) {
      toast.add({
        title: 'Free Plan',
        description: `${planName} is already free! No payment required.`,
        color: 'info',
        icon: 'i-heroicons-information-circle'
      })
      return
    }

    if (!userStore.user?.id) {
      toast.add({
        title: 'Authentication Required',
        description: 'Please log in to upgrade your plan',
        color: 'error'
      })
      return
    }

    const response = await $fetch<{ url: string }>('/api/create-checkout-session', {
      method: 'POST',
      body: {
        planKey: plan.key,
        userId: userStore.user.id,
        customerEmail: userStore.user.email
      }
    })

    if (response.url) {
      window.location.href = response.url
    }
  } catch (error: any) {
    console.error('Checkout error:', error)
    
    // Handle specific error messages
    const errorMessage = error.data?.statusMessage || error.message || 'Failed to start checkout process. Please try again.'
    
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error'
    })
  }
}

// Handle success/cancel from Stripe checkout
const handleCheckoutResult = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const success = urlParams.get('success')
  const canceled = urlParams.get('canceled')
  const sessionId = urlParams.get('session_id')

  if (success && sessionId) {
    toast.add({
      title: 'Payment Successful!',
      description: 'Your subscription has been activated. Welcome to your new plan!',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
    // Refresh user data to get updated plan
    userStore.fetchUser()
  } else if (canceled) {
    toast.add({
      title: 'Payment Canceled',
      description: 'Your payment was canceled. You can try again anytime.',
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle'
    })
  }
}

const handleManageMembership = async () => {
  try {
    if (!userStore.user?.id) {
      toast.add({
        title: 'Authentication Required',
        description: 'Please log in to manage your membership',
        color: 'error'
      })
      return
    }

    // Check if user is on basic plan
    if (currentPlanId.value === 1) {
      toast.add({
        title: 'Upgrade Required',
        description: 'Customer portal is only available for paid plans. Please upgrade your plan first.',
        color: 'warning',
        icon: 'i-heroicons-exclamation-triangle'
      })
      return
    }

    const response = await $fetch<{ url: string; success: boolean }>('/api/customer-portal', {
      method: 'POST',
      body: {
        userId: userStore.user.id,
        customerEmail: userStore.user.email
      }
    })

    if (response.url) {
      window.open(
        response.url,
        '_blank' // opens in a new tab
      )
    } else {
      throw new Error('No portal URL received')
    }
  } catch (error: any) {
    console.error('Customer portal error:', error)
    
    const errorMessage = error.data?.statusMessage || error.message || 'Failed to access customer portal. Please try again.'
    
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error'
    })
  }
}

onMounted(async () => {
  await fetchPlans()
  await userStore.fetchUser()
  handleCheckoutResult()
})
</script>

