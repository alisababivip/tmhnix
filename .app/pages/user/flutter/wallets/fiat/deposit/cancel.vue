<script setup lang="ts">
definePageMeta({
  title: 'Payment Cancelled',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsFiatDepositCancel :flutter="true" />
  </div>
</template>
