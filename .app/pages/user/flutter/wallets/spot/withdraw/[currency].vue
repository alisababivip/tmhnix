<script setup lang="ts">
definePageMeta({
  title: 'Spot Withdraw',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsSpotWithdraw :flutter="true" />
  </div>
</template>
