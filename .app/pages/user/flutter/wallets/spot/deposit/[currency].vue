<script setup lang="ts">
definePageMeta({
  title: 'Spot Deposit',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsSpotDeposit :flutter="true" />
  </div>
</template>
