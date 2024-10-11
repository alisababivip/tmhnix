<template>
  <div>
    <div v-if="resetError" :show-close="false">
      <strong>{{ resetError.message }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Verify Email',
})
const route = useRoute()
const { verifyEmailToken } = useAuth()

const resetError = ref(<Error | null>null)

const token = route.query.token as string

if (!token) navigateTo('/confirm/verifyfailed')

try {
  const response = await verifyEmailToken(token)

  if (response.status === 'fail') {
    navigateTo('/confirm/verifyfailed')
  }

  if (response.status === 'success') {
    navigateTo('/confirm/success')
  }
} catch (e) {
  // If other error, like a server error occurs, show generic error message
  // console.log(e)
  resetError.value = {} as Error
  resetError.value.message = 'Error. Please contact an administrator.'
}
</script>
