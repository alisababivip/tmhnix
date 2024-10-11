<template>
  <div>
    <BaseIconBox size="lg" shape="full" flavor="solid" color="danger">
      <Icon name="ph:cookie-duotone" class="h-6 w-6" />
    </BaseIconBox>
    <h1>{{ $t('Verification Failed') }}!</h1>
    <p>
      {{ $t('Your account verification failed. Link expired or other error') }}.
      &#128542;. {{ $t('Please contact our support team for assistance') }}.
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Verification Failed',
})
</script>

<style scoped>
.text-danger {
  color: #dc3545;
}
</style>
