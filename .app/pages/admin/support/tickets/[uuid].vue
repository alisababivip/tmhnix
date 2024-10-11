<script setup lang="ts">
definePageMeta({
  title: 'Support Ticket',
  permissions: ['Access Support Ticket Details'],
  layout: 'empty',
})
</script>
<template>
  <div>
    <Chat :is-support="true" />
  </div>
</template>
