<script setup lang="ts">
definePageMeta({
  title: 'Fiat Deposit',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsFiatDeposit :flutter="true" />
  </div>
</template>
