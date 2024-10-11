<script setup lang="ts">
import type { User } from '~~/types'
definePageMeta({
  title: 'Dashboard',
  layout: 'default',
})
const userStore = useUserStore()
const user = computed(() => userStore.getProfile as User)
const router = useRouter()

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

onMounted(() => {
  if (
    user.value?.email &&
    user.value?.email_verified === false &&
    settings.value?.email_verification
  ) {
    router.push('/confirm/email')
  }
})
</script>

<template>
  <div class="relative">
    <BasePlaceholderPage
      v-if="!user?.email"
      class="h-[calc(80vh)]"
      title="Looks like you are new!"
      subtitle="Complete your profile get access to your dashboard, and more."
    >
      <template #image>
        <img src="/img/illustrations/magician.svg" alt="placeholder-image" />
      </template>

      <div class="mt-2 flex justify-center gap-2">
        <BaseButton
          color="primary"
          shape="curved"
          class="h-11 w-32"
          to="/user/profile-edit"
          >{{ $t('Edit Profile') }}</BaseButton
        >
      </div>
    </BasePlaceholderPage>
    <template v-else>
      <div class="grid grid-cols-12 gap-6">
        <div class="ltablet:col-span-8 col-span-12 lg:col-span-9">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
              <UserDashboardWelcome :user="user" />
            </div>
          </div>
        </div>
        <div class="ltablet:col-span-4 col-span-12 lg:col-span-3">
          <UserDashboardProfileProgress :user="user" />
        </div>
      </div>
      <MarketAnalysis />
      <News />
    </template>
  </div>
</template>
