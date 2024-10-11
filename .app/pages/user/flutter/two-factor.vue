<script setup lang="ts">
definePageMeta({
  title: '2 Factor Authentication',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserProfileTwoFactor :flutter="true" />
  </div>
</template>
