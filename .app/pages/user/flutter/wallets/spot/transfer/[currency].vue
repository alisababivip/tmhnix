<script setup lang="ts">
definePageMeta({
  title: 'Spot Transfer',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsSpotTransfer :flutter="true" />
  </div>
</template>
