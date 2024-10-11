<script setup lang="ts">
definePageMeta({
  title: 'Identity Verification',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <Kyc :flutter="true" />
  </div>
</template>
