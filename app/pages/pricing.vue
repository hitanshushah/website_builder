<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
    <UContainer class="max-w-7xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h1>
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
      color: 'neutral',
      variant: 'subtle',
      disabled: true
    }
  }
  
  if (isLowerTier) {
    return {
      label: 'Downgrade',
      color: 'neutral',
      variant: 'outline',
      onClick: () => handlePlanChange(planId, planName, 'downgrade')
    }
  }
  
  return {
    label: `Upgrade to ${planName}`,
    onClick: () => handlePlanChange(planId, planName, 'upgrade')
  }
}

const tiers = computed(() => {
  const basicPlan = getPlanByKey('basic')
  const plusPlan = getPlanByKey('plus')
  const proPlan = getPlanByKey('pro')

  return [
    {
      id: 'basic',
      title: basicPlan?.name || 'Basic',
      price: basicPlan ? formatPrice(basicPlan.price) : 'Free',
      billingCycle: basicPlan?.price === 0 ? '' : '/month',
      button: getButtonConfig(basicPlan?.id || 1, basicPlan?.name || 'Basic')
    },
    {
      id: 'plus',
      title: plusPlan?.name || 'Plus',
      price: plusPlan ? formatPrice(plusPlan.price) : '$9',
      billingCycle: '/month',
      badge: 'Most Popular',
      button: getButtonConfig(plusPlan?.id || 2, plusPlan?.name || 'Plus'),
      highlight: currentPlanId.value === (plusPlan?.id || 2)
    },
    {
      id: 'pro',
      title: proPlan?.name || 'Pro',
      price: proPlan ? formatPrice(proPlan.price) : '$19',
      billingCycle: '/month',
      button: getButtonConfig(proPlan?.id || 3, proPlan?.name || 'Pro'),
      highlight: currentPlanId.value === (proPlan?.id || 3)
    }
  ]
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

const handlePlanChange = (planId: number, planName: string, action: 'upgrade' | 'downgrade') => {
  toast.add({
    title: 'Coming Soon',
    description: `${action === 'upgrade' ? 'Upgrade' : 'Downgrade'} to ${planName} plan will be available soon!`,
    color: 'primary',
    icon: 'i-heroicons-information-circle'
  })
}

onMounted(async () => {
  await fetchPlans()
  await userStore.fetchUser()
})
</script>

