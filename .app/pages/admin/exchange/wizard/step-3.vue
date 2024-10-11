<script setup lang="ts">
definePageMeta({
  title: 'Exchange Wizard — Step 3',
})
const router = useRouter()

const { data: project } = useMultiStepForm()
if (!project.value.exchange) {
  router.push('/admin/exchange/wizard')
}
const alertMessage = ref<string | null>(null)
const apiPath = useRuntimeConfig().public.apiPath
const checkConnection = async () => {
  try {
    const response = await $fetch(
      `${apiPath}/api/exchange/settings/check/connection`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        query: {
          exchange: project.value.exchange,
        },
      },
    )

    if (response.status === 'success') {
      alertMessage.value = response.data.result
        ? 'Connection successful!'
        : 'Connection failed!'
      project.value.connection = response.data.result
    } else {
      alertMessage.value = response.error.message
    }
  } catch (error) {
    project.value.connection = false
    alertMessage.value = error.data.message
  }
}
</script>

<template>
  <div>
    <WizardStepTitle />
    <div class="mx-auto w-full max-w-5xl flex-col px-4 text-center">
      <p class="text-muted-500 text-lg mb-4">
        {{ $t('Please add the following credentials to your') }}
        <code>.env</code> {{ $t('file') }}:
      </p>
      <div
        v-if="project.exchange === 'kucoin'"
        class="bg-muted-200 dark:bg-muted-800 p-4 rounded-lg max-w-md mx-auto"
        :class="
          project.connection
            ? 'bg-success-100 dark:bg-success-600'
            : 'bg-muted-200 dark:bg-muted-800'
        "
      >
        <code>APP_ACTIVE_EXCHANGE="kucoin"</code><br />
        <code>APP_KUCOIN_API_KEY</code><br />
        <code>APP_KUCOIN_API_SECRET</code><br />
        <code>APP_KUCOIN_API_PASSPHRASE</code>
      </div>
      <div
        v-if="project.exchange === 'binance'"
        class="bg-muted-200 dark:bg-muted-800 p-4 rounded-lg max-w-md mx-auto"
        :class="
          project.connection
            ? 'bg-success-100 dark:bg-success-600'
            : 'bg-muted-200 dark:bg-muted-800'
        "
      >
        <code>APP_ACTIVE_EXCHANGE="binance"</code><br />
        <code>APP_BINANCE_API_KEY</code><br />
        <code>APP_BINANCE_API_SECRET</code>
      </div>
      <div class="mt-8">
        <BaseButton color="primary" shape="curved" @click="checkConnection">
          <span>{{ $t('Check Connection') }}</span>
        </BaseButton>
      </div>
      <div v-if="alertMessage" class="mt-4 flex justify-center">
        <BaseMessage :type="project.connection ? 'success' : 'danger'">
          <span class="text-gray-800 dark:text-gray-200">{{
            alertMessage
          }}</span>
        </BaseMessage>
      </div>
    </div>
  </div>
</template>
