<script setup lang="ts">
import type { User } from '~~/types'

definePageMeta({
  title: 'Email settings',
  permissions: ['Access Notification Email Test'],
})

const userStore = useUserStore()
const user = computed(() => userStore.getProfile as User)

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const config = useRuntimeConfig()

const alertMessage = ref<string | null>(null)
const connectionStatus = ref<boolean>(false)
const { testMailer } = useNotification()
const checkConnection = async () => {
  try {
    const response = await testMailer(user.value?.first_name, user.value?.email)

    alertMessage.value = 'Connection successful!'
    connectionStatus.value = true
  } catch (error) {
    connectionStatus.value = false
    alertMessage.value = error.data.message
  }
}
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between p-4">
      <div>
        <BaseHeading
          tag="h2"
          size="sm"
          weight="medium"
          lead="normal"
          class="uppercase tracking-wider"
        >
          {{ $t('Email Credentials') }}
        </BaseHeading>
        <BaseText size="xs" class="text-muted-400">
          {{ $t('Configure your email credentials') }}
        </BaseText>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton class="w-24" to="/admin/settings/notification">
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-1" />
          {{ $t('Back') }}</BaseButton
        >
      </div>
    </div>
    <div class="p-4">
      <div
        class="mx-auto w-full max-w-5xl flex-col px-4 text-center space-y-5 pb-10"
      >
        <BaseHeading tag="h3" weight="medium">
          {{ $t('Your current mailer is') }}
          <code class="p-2 bg-gray-900 rounded text-white">{{
            config.public.appEmailer
          }}</code>
        </BaseHeading>
        <p class="text-muted-500 dark:text-muted-400 text-lg mb-4">
          {{ $t('Please fill the following credentials in your') }}
          <code>.env</code> {{ $t('file') }}:
        </p>
        <div
          v-if="config.public.appEmailer === 'nodemailer-smtp'"
          class="p-4 rounded-lg max-w-md mx-auto text-left"
          :class="
            connectionStatus
              ? 'bg-success-100 dark:bg-success-800'
              : 'bg-muted-200 dark:bg-muted-700'
          "
        >
          <code>APP_NODEMAILER_SMTP_HOST</code><br />
          <code>APP_NODEMAILER_SMTP_PORT</code><br />
          <code>APP_NODEMAILER_SMTP_SENDER</code><br />
          <code>APP_NODEMAILER_SMTP_PASSWORD</code>
        </div>
        <div
          v-if="config.public.appEmailer === 'nodemailer-service'"
          class="p-4 rounded-lg max-w-md mx-auto text-left"
          :class="
            connectionStatus
              ? 'bg-success-100 dark:bg-success-800'
              : 'bg-muted-200 dark:bg-muted-700'
          "
        >
          <code>APP_NODEMAILER_SERVICE</code><br />
          <code>APP_NODEMAILER_SERVICE_SENDER</code><br />
          <code>APP_NODEMAILER_SERVICE_PASSWORD</code>
        </div>
        <div class="mt-8">
          <BaseButton color="primary" shape="curved" @click="checkConnection">
            <span>{{ $t('Check Connection') }}</span>
          </BaseButton>
        </div>
        <div v-if="alertMessage" class="mt-4 flex justify-center">
          <BaseMessage :type="connectionStatus ? 'success' : 'danger'">
            {{ alertMessage }}
          </BaseMessage>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
