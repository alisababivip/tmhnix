<script setup lang="ts">
definePageMeta({
  title: 'Wallet Portfolio',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsSpot :flutter="true" />
  </div>
</template>
