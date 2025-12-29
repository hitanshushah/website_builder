<script setup lang="ts">
definePageMeta({
  layout: false
})

const subdomainData = useState('subdomainAccess', () => {
  if (process.server) {
    const event = useRequestEvent()
    const subdomainAccess = event?.context?.subdomainAccess
    
    if (!subdomainAccess?.isSubdomainAccess) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page not found'
      })
    }
    
    return subdomainAccess
  }
  return null
})

if (!subdomainData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found'
  })
}
</script>

<template>
  <SubdomainTemplate />
</template>

