<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <UContainer class="py-12">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
          
          <div class="prose prose-gray dark:prose-invert max-w-none">

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support.
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (name, email address)</li>
                  <li>Profile information and website content you create</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Communications with our support team</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>We use the information we collect to:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Information Sharing</h2>
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With service providers who assist us in operating our platform</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. However, no method of 
                  transmission over the internet is 100% secure.
                </p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>You have the right to:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Object to processing of your information</li>
                  <li>Data portability</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Changes to This Policy</h2>
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes 
                  by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Contact Us</h2>
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  If you have any questions about this privacy policy, please contact us at:
                </p>
                <p>
                  <strong>Email:</strong> 
                  <a :href="`mailto:${supportEmail}`" class="text-blue-600 dark:text-blue-400 hover:underline">
                    {{ supportEmail }}
                  </a>
                </p>
              </div>
            </section>
            <div>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Open Source Disclaimer:</strong> This is an open source system and this privacy policy is just for simulation purposes, the entire source code is available on <a href="https://github.com/hitanshushah/website_builder" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">GitHub</a>.
              </p>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton 
              to="/" 
              variant="outline" 
              color="neutral"
              class="w-full sm:w-auto"
            >
              Back to Home
            </UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const supportEmail = config.public.supportEmail || 'support@example.com'
const currentDate = new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})
const brandName = config.public.brandName || 'Website Builder'
useHead({
  title: `${brandName} - Privacy Policy`,
  meta: [
    { name: 'description', content: `Privacy policy for ${brandName} - Learn how we collect, use, and protect your personal information.` }
  ]
})
</script>
