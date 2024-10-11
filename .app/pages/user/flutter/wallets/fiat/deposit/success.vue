<script setup lang="ts">
definePageMeta({
  title: 'Payment Success',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsFiatDepositSuccess :flutter="true" />
  </div>
</template>
