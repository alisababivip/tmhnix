<script setup lang="ts">
definePageMeta({
  permissions: ['Access Forex Management'],
  title: 'Forex Management',
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const { getForexAnalytics } = useForex()
const analytics = ref<any>({})

async function fetchMetrics() {
  const response = await getForexAnalytics()
  if (response.status === 'success') {
    analytics.value = response.data.result
  }
}
onMounted(async () => {
  await fetchMetrics()
})
const { toast } = useUtils()

const forexInvestment = ref(settings.value?.forex_investment || false)
const forexDepositWalletType = ref(
  settings.value?.forex_deposit_wallet_type || 'FIAT',
)
const updateSetting = async () => {
  try {
    const response = await updateSettings({
      forex_investment: forexInvestment.value,
      forex_deposit_wallet_type: forexDepositWalletType.value,
    })
    toast.response(response)
    if (response.status === 'success') {
      await updateSettings(forexInvestment.value)
      await settingsStore.invalidateCacheAndFetch()
    }
  } catch (error) {
    toast.danger(error as any)
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
      <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
        <div
          class="relative"
          v-for="(item, index) in analytics.metrics"
          :key="index"
        >
          <BaseCard class="space-y-1 p-5">
            <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
              {{ item.metric }}
            </BaseParagraph>
            <BaseHeading
              size="lg"
              weight="semibold"
              class="text-muted-800 dark:text-white"
            >
              <span>{{ item.value }}</span>
            </BaseHeading>
          </BaseCard>
        </div>
      </div>
      <div>
        <img src="/img/background/forex-cog.svg" />
      </div>
    </div>
    <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
      <div>
        <img src="/img/background/forex-cog2.svg" />
      </div>
      <div>
        <BaseCard
          class="p-5 space-y-5"
          :class="{
            'bg-success-50 dark:bg-success-900': analytics?.profit?.value > 0,
            'bg-danger-50 dark:bg-danger-900': analytics?.profit?.value < 0,
          }"
        >
          <BaseSwitchBall
            v-model="forexInvestment"
            label="Forex Investments"
            sublabel="Enable or disable forex investments"
            color="primary"
            @update:model-value="updateSetting"
          />
          <BaseListbox
            v-model="forexDepositWalletType"
            label="Forex Deposit Wallet Type"
            placeholder="Select the wallet type for forex deposits"
            :items="['FIAT', 'SPOT', 'FUNDING']"
            shape="rounded"
            @update:model-value="updateSetting"
          />
        </BaseCard>
      </div>
    </div>
  </div>
</template>
