<template>
  <div class="mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Personal Domain</h2>
        <UBadge v-if="!isPro" color="warning" variant="subtle">Pro Plan Required</UBadge>
      </div>
      
      <!-- Content for all users -->
      <div class="space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Connect your personal domain to your portfolio website by adding a CNAME record in your DNS settings.
        </p>
          
          <!-- Steps -->
          <div class="space-y-4">
            <div class="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Access Your Domain's DNS Settings</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Log into your domain registrar or DNS provider (like Cloudflare, Namecheap, GoDaddy, etc.)
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex-col md:flex-row">
              <div class="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Add a CNAME Record</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Create new CNAME records with the following details:
                </p>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div class="flex items-center gap-2 text-sm">
                    <span class="font-medium text-gray-700 dark:text-gray-300 w-16">Type:</span>
                    <span class="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">CNAME</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="font-medium text-gray-700 dark:text-gray-300 w-16">Name:</span>
                    <span class="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs"><span class="font-bold">www</span> and <span class="font-bold">@</span></span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="font-medium text-gray-700 dark:text-gray-300 w-16">Value:</span>
                    <div class="flex items-center gap-2">
                      <span v-if="isPro" class="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs flex-1">{{ ddnsHostname }}</span>
                      <span v-else class="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs flex-1 text-gray-500">[Pro Required]</span>
                      <UButton
                        v-if="isPro"
                        @click="copyDDNSHostname"
                        variant="outline"
                        color="neutral"
                        size="xs"
                        :icon="ddnsCopied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
                        class="cursor-pointer"
                      >
                        {{ ddnsCopied ? 'Copied!' : 'Copy' }}
                      </UButton>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="font-medium text-gray-700 dark:text-gray-300 w-16">TTL:</span>
                    <span class="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">3600</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(or Auto)</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Wait for DNS Propagation</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  DNS changes can take anywhere from a few minutes to 48 hours to propagate worldwide. 
                  Most changes are visible within 1-2 hours.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div class="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">4</div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Test Your Connection</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Once DNS has propagated, your personal domain should automatically redirect to your portfolio.
                </p>
                
                <!-- Test Connection Button -->
                <div v-if="personalDomain" class="space-y-3">
                  <UButton
                    @click="testDomainConnection"
                    :loading="isPinging"
                    :disabled="isPinging || !isPro"
                    variant="outline"
                    color="neutral"
                    size="sm"
                    icon="i-heroicons-rss-16-solid"
                    class="cursor-pointer"
                  >
                    {{ !isPro ? 'Pro Required to Test' : (isPinging ? 'Testing Connection...' : `Test ${personalDomain}`) }}
                  </UButton>
                  
                  <!-- Ping Result Display -->
                  <div v-if="pingResult && isPro" class="space-y-2">
                    <div class="flex items-center gap-2 p-3 rounded-lg" 
                         :class="pingResult.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
                      <UIcon 
                        :name="pingResult.isCorrect ? 'i-heroicons-hand-thumb-up' : 'i-heroicons-hand-thumb-down'" 
                        :class="pingResult.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                        class="w-5 h-5 flex-shrink-0"
                      />
                      <div class="flex-1">
                        <p class="text-sm font-medium" 
                           :class="pingResult.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
                          {{ pingResult.isCorrect ? 'Domain correctly configured!' : 'Domain not pointing to correct server' }}
                        </p>
                        <p class="text-xs mt-1" 
                           :class="pingResult.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                          <span v-if="pingResult.resolvedHostname">
                            <div class="space-y-1">
                                <div>
                                    Your domain resolves to:
                                    <code class="bg-white dark:bg-gray-800 px-1 rounded">
                                        {{
                                        pingResult.isCorrect
                                            ? ddnsHostname
                                            : (pingResult.allAddresses?.join(', ') || pingResult.resolvedHostname)
                                        }}
                                    </code>
                                    </div>

                              <div v-if="pingResult.expectedAddresses">
                                Expected DDNS resolves to: <code class="bg-white dark:bg-gray-800 px-1 rounded">{{ ddnsHostname }}</code>
                              </div>
                              <div v-else-if="!pingResult.isCorrect">
                                ❌ No matching IP addresses found
                              </div>
                            </div>
                          </span>
                          <span v-else-if="pingResult.error">
                            Error: {{ pingResult.error }}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          <!-- Help Section -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-yellow-800 dark:text-yellow-200">
                <p class="font-medium mb-1">Need Help?</p>
                <p class="text-xs mb-2">
                  If you're having trouble setting up your CNAME record, check your domain provider's documentation or contact their support.
                </p>
                <p class="text-xs mb-2">
                  Common DNS providers: Cloudflare, Namecheap, GoDaddy, Google Domains, Route 53
                </p>
                <div v-if="!isPro" class="mt-3 p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded border border-yellow-300 dark:border-yellow-700">
                  <p class="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                    💡 Upgrade to Pro to get your DDNS hostname and test your domain connection!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Video Tutorial Section (Collapsible) -->
          <details class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <summary class="p-4 cursor-pointer flex items-start gap-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <UIcon name="i-heroicons-play-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-1">Video Tutorial</h4>
                <p class="text-sm text-blue-800 dark:text-blue-200">
                  Watch this step-by-step tutorial showing how to set up CNAME records with Namecheap
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-200 details-open:rotate-180" />
            </summary>
            
            <div class="px-4 pb-4">
              <!-- YouTube Video Embed -->
              <div class="relative w-full" style="padding-bottom: 56.25%; /* 16:9 aspect ratio */">
                <iframe
                  class="absolute top-0 left-0 w-full h-full rounded-lg"
                  :src="`https://www.youtube.com/embed/Ytr7R_BN0JY`"
                  title="Namecheap CNAME Setup Tutorial"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              
              <div class="mt-3 flex items-center gap-2">
                <UIcon name="i-heroicons-link" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <a 
                  href="https://www.youtube.com/watch?v=Ytr7R_BN0JY" 
                  target="_blank" 
                  class="text-xs text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Open video in YouTube
                </a>
              </div>
            </div>
          </details>
        </div>
      </div>

    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  userId: number | string
  isPro: boolean
  personalWebsiteUrl?: string
}>()

const toast = useToast()
const config = useRuntimeConfig()
const ddnsHostname = config.public.ddns || 'your-ddns-domain.com'

const ddnsCopied = ref(false)
const personalUrlCopied = ref(false)
const pingResult = ref<{
  isCorrect: boolean
  resolvedHostname?: string
  allAddresses?: string[]
  expectedHostname?: string
  expectedAddresses?: string[]
  matchingAddresses?: string[]
  pingOutput?: string
  error?: string
} | null>(null)
const isPinging = ref(false)



// Extract personal domain from personal website URL
const personalDomain = computed(() => {
  if (!props.personalWebsiteUrl) return null
  
  try {
    const url = new URL(props.personalWebsiteUrl)
    return url.hostname
  } catch {
    return null
  }
})

const copyDDNSHostname = async () => {
  try {
    await navigator.clipboard.writeText(ddnsHostname.value)
    ddnsCopied.value = true
    
    toast.add({
      title: 'Copied!',
      description: 'DDNS hostname copied to clipboard',
      color: 'success'
    })
    
    setTimeout(() => {
      ddnsCopied.value = false
    }, 2000)
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to copy to clipboard',
      color: 'error'
    })
  }
}

const copyPersonalUrl = async () => {
  if (!props.personalWebsiteUrl) return
  
  try {
    await navigator.clipboard.writeText(props.personalWebsiteUrl)
    personalUrlCopied.value = true
    
    toast.add({
      title: 'Copied!',
      description: 'Personal website URL copied to clipboard',
      color: 'success'
    })
    
    setTimeout(() => {
      personalUrlCopied.value = false
    }, 2000)
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to copy to clipboard',
      color: 'error'
    })
  }
}

const testDomainConnection = async () => {
  if (!personalDomain.value) {
    toast.add({
      title: 'Error',
      description: 'No personal domain configured',
      color: 'error'
    })
    return
  }

  isPinging.value = true
  pingResult.value = null

  try {
    const response = await $fetch('/api/ping-domain', {
      method: 'POST',
      body: {
        domain: personalDomain.value,
        expectedHostname: ddnsHostname
      }
    })

    pingResult.value = response as any

    if (response.success && response.isCorrect) {
      toast.add({
        title: 'Success!',
        description: `Domain correctly points to ${ddnsHostname}`,
        color: 'success'
      })
    } else if (response.success && !response.isCorrect) {
      toast.add({
        title: 'Domain Not Configured',
        description: `Domain points to ${response.resolvedHostname}, expected ${ddnsHostname}`,
        color: 'warning'
      })
    } else {
      toast.add({
        title: 'Ping Failed',
        description: response.error || 'Could not ping domain',
        color: 'error'
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'Failed to test domain connection',
      color: 'error'
    })
  } finally {
    isPinging.value = false
  }
}
</script>
