<script setup lang="ts">
definePageMeta({
  title: 'Verification Successful',
  layout: 'nav',
})
const route = useRoute()
const tempPassword = route.fullPath.split('/confirm/verifysuccessful?pass=')[1]
</script>
<template>
  <div class="h-screen flex items-center justify-center">
    <div class="my-auto text-center flex-col justify-center space-y-5">
      <div class="flex justify-center">
        <TairoCheckAnimated color="success" size="lg" />
      </div>
      <h1
        class="font-bold"
        :class="{
          'text-2xl': $viewport.isGreaterOrEquals('sm'),
          'text-lg': $viewport.isLessThan('sm'),
        }"
      >
        {{ $t('Verification Successful') }}!
      </h1>
      <div>
        <h3>{{ $t('Your temporary password is') }}</h3>
        <code>{{ tempPassword }}</code>
        <h3>
          {{ $t('Copy it') }},
          <NuxtLink to="/login">{{ $t('log in') }}</NuxtLink
          >, {{ $t('and change it') }}.
        </h3>
      </div>
      <BaseButton color="primary" to="/login">
        {{ $t('Go to Login Page') }}
        <Icon name="ic:round-login" class="h-4 w-4 ml-2" />
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
code {
  font-size: 200%;
}
</style>
