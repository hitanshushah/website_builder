<template>
  <footer class="bg-gray-900 dark:bg-gray-950 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-start md:justify-items-center">
        <!-- Support Section -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Support</h3>
          <p>Check out our guided demo to get started:</p>
          <a href="https://webbstyle.com/demo-player.html?page=dashboard" target="_blank" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">Webb Style Demo</a>
          <p class="text-gray-300 mt-2">Need more help? Contact our support team:</p>
          <a 
            :href="`mailto:${supportEmail}`"
            class="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            {{ supportEmail }}
          </a>
        </div>

        <!-- Legal Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Legal</h3>
          <div class="space-y-2">
            <NuxtLink 
              to="/privacy-policy" 
              class="block text-gray-300 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </NuxtLink>
            <NuxtLink 
              to="/terms-conditions" 
              class="block text-gray-300 hover:text-white transition-colors duration-200"
            >
              Terms & Conditions
            </NuxtLink>
          </div>
        </div>

        <!-- Company Info -->
        <div>
          <h3 class="text-lg font-semibold">Company</h3>
          <NuxtLink to="https://webbstyle.com" target="_blank">
            <div class="flex items-center gap-8">
                <div class="w-24 h-24">
                    <img src="/dark_mode_logo.png" alt="Logo" class="w-full h-full object-contain">
                </div>
                <div class="flex flex-col">
                    <h1 class="text-lg font-bold text-white">Website Builder</h1>
                    <p class="text-xs text-gray-400">Professional CMS</p>
                </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-gray-800 mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400 text-sm">
            © {{ currentYear }} <a href="https://webbstyle.com" target="_blank" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">{{ brandName || 'Website Builder' }}</a>. All rights reserved.
          </p>
          <p class="text-gray-400 text-sm mt-2 md:mt-0">
            Developed by <a href="https://hitanshushah.com" target="_blank" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">Hitanshu Shah</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const supportEmail = config.public.supportEmail || 'support@example.com'
const brandName = config.public.brandName || 'Website Builder'
const currentYear = new Date().getFullYear()
</script>
