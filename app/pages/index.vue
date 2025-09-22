<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <UContainer class="m-0 max-w-full py-8">
      <div class="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
        <!-- Your Website Section -->
        <YourWebsite class="h-fit" />
        
        <!-- Your Content Section -->
        <YourContent />
      </div>
    </UContainer>
  </div>
</template>

<script setup>
// Page metadata
useHead({
  title: 'Dashboard - Website Builder',
  meta: [
    { name: 'description', content: 'Manage your website and content with our professional dashboard.' }
  ]
})
</script>