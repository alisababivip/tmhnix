<script setup lang="ts">
definePageMeta({
  title: 'Fiat Wallets',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsFiat :flutter="true" />
  </div>
</template>
