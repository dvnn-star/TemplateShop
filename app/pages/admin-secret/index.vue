<script setup lang="ts">
const config = useRuntimeConfig()
const adminBase = config.public.adminPath || '/admin-secret'
await navigateTo(`${adminBase}/dashboard`, { replace: true })
</script>

<template>
  <div></div>
</template>
