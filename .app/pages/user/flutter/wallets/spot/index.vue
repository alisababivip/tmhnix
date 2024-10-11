<script setup lang="ts">
definePageMeta({
  title: 'Spot Wallets',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsSpotList :flutter="true" />
  </div>
</template>
