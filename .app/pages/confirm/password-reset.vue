<template>
  <div>
    <NxAlert v-if="resetError" :show-close="false">
      <strong>{{ resetError.message }}</strong>
    </NxAlert>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Verify Password Reset',
})
const route = useRoute()
const { verifyReset } = useAuth()

const resetError = ref(<Error | null>null)

// Get token from url parameters
const token = route.query.token as string

console.log(token)

// If verification fails
if (!token) navigateTo('/confirm/verifyfailed')

// Attempt to reset password
try {
  const response = await verifyReset(token)
  if (response.status === 'success') {
    navigateTo(
      `/confirm/verifysuccessful?pass=${response.data.result.password}`,
    )
  } else {
    navigateTo(`/confirm/verifyfailed`)
  }
} catch (e) {
  // If some other error, like a server error, occurs
  // It's not wise to show server errors in the front end so console.log(e) below is commented out
  // console.log(e);
  resetError.value = {} as Error
  resetError.value.message = 'Error. Please contact an administrator.'
}
</script>
