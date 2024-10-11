<script setup lang="ts">
definePageMeta({
  title: 'Verification Successful',
})
const userStore = useUserStore()
await userStore.fetchProfile()
</script>
<template>
  <div class="my-auto text-center flex-col justify-center space-y-5">
    <div class="flex justify-center">
      <TairoCheckAnimated color="success" size="lg" />
    </div>
    <h1 class="text-2xl font-bold">{{ $t('Verification Successful') }}!</h1>
    <p>
      {{ $t('Your account has been verified. You can now use our platform') }}.
    </p>
    <BaseButton color="primary" to="/user">
      <Icon name="ph:arrow-left-bold" class="h-4 w-4 mr-2" />
      {{ $t('Go to User Dashboard') }}
    </BaseButton>
  </div>
</template>
