<script setup lang="ts">
definePageMeta({
  title: 'Transaction Details',
  layout: 'empty',
})
</script>

<template>
  <div class="p-5">
    <UserWalletsTrx :flutter="true" />
  </div>
</template>
