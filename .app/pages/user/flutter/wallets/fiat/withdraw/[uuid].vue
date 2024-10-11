<script setup lang="ts">
definePageMeta({
  title: 'Fiat Withdraw',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsFiatWithdraw :flutter="true" />
  </div>
</template>
