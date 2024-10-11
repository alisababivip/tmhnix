<script setup lang="ts">
definePageMeta({
  permissions: ['Access P2P Management'],
  title: 'P2P Management',
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const userPermissions = computed(() => userStore.getPermissions)
const userRole = computed(() => userStore.getRole)
const settings = computed(() => settingsStore.settings)
const { getAdminP2pAnalytics } = useP2P()
const analytics = ref<any>({})

async function fetchMetrics() {
  const response = (await getAdminP2pAnalytics()) as any
  if (response.status === 'success') {
    analytics.value = response.data.result
  }
}

onMounted(async () => {
  await fetchMetrics()
})

const { toast } = useUtils()

const p2p_trade_commission = ref(settings.value?.p2p_trade_commission || 0)
const updateSetting = async () => {
  if (
    !userPermissions.value.some((permission) =>
      permission.includes('Access Settings'),
    ) &&
    userRole.value !== 'Super Admin'
  ) {
    toast.dangerText('You do not have permission to edit the default layout.')
    return
  }
  try {
    const response = await updateSettings({
      p2p_trade_commission: p2p_trade_commission.value,
    })
    toast.response(response)
    if (response.status === 'success') {
      await updateSettings(p2p_trade_commission.value)
      await settingsStore.invalidateCacheAndFetch()
    }
  } catch (error) {
    toast.danger(error as any)
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid gap-2 grid-cols-1 md:grid-cols-2">
      <div class="grid gap-2 grid-cols-2">
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
      <LottieTransfer height="400px" />
    </div>
    <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
      <div>
        <img src="/img/banner/passive_income.svg" />
      </div>
      <div>
        <BaseCard
          class="p-5"
          :class="{
            'bg-success-50 dark:bg-success-900': analytics?.profit?.value > 0,
            'bg-danger-50 dark:bg-danger-900': analytics?.profit?.value < 0,
          }"
        >
          <BaseInput
            v-model="p2p_trade_commission"
            label="P2P Trade Commission"
            placeholder="This is the commission charged on every P2P trade"
            type="number"
            icon="%"
            @update:model-value="updateSetting"
          />
          <small>
            <span class="text-xs text-muted-500 dark:text-muted-400">
              Please note that this commission is charged on every P2P trade
            </span>
          </small>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
