<script setup lang="ts">
definePageMeta({
  title: 'Confirm Account',
})

const isSubmitting = ref(false)

import type { User } from '~~/types'

const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)
const { toast } = useUtils()
const router = useRouter()
const { sendEmailVerification } = useAuth()

onMounted(() => {
  if (!user.value?.email) {
    router.push('/user/profile-edit')
    toast.info('Please add your email address to continue')
  }
  if (user.value?.email_verified) {
    router.push('/user')
    toast.info('Your email address is already verified')
  }
})

const sendConfirmationEmail = async () => {
  isSubmitting.value = true
  try {
    const response = await sendEmailVerification(user.value?.email as string)
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isSubmitting.value = false
}
</script>

<template>
  <div class="flex items-center justify-center pb-12">
    <BasePlaceholderPage
      title="Confirm your account"
      subtitle="Hi, we're glad to have you on board! Please confirm your account to continue using our platform."
    >
      <template #image>
        <img
          class="block dark:hidden"
          src="/img/illustrations/placeholders/flat/placeholder-launch.svg"
          alt="placeholder-image"
        />
        <img
          class="hidden dark:block"
          src="/img/illustrations/placeholders/flat/placeholder-launch-dark.svg"
          alt="placeholder-image"
        />
      </template>

      <div class="mx-auto mt-4 flex w-full max-w-[280px] justify-between gap-2">
        <!-- <BaseButton shape="curved" class="h-11 w-full"> Cancel </BaseButton> -->
        <BaseButton
          color="primary"
          shape="curved"
          class="h-11 w-full"
          @click="sendConfirmationEmail"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          {{ $t('Confirm Email') }}
        </BaseButton>
      </div>
    </BasePlaceholderPage>
  </div>
</template>
