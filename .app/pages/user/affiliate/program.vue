<script setup lang="ts">
definePageMeta({
  title: 'Referral Program',
})

const { getReferralConditions } = useMlm()
const conditions = ref([])

const loading = ref(false)
const { toast } = useUtils()
onMounted(async () => {
  loading.value = true
  const response = await getReferralConditions()
  if (response.status === 'success') {
    conditions.value = response.data.result
  } else {
    toast.danger(response as any)
  }
  loading.value = false
})

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)

const validConditions = computed(() => {
  return conditions.value.filter((condition) => {
    switch (condition.name) {
      case 'STAKING_LOYALTY':
        return extensions.value['staking']
      case 'FOREX_INVESTMENT':
        return extensions.value['forex']
      case 'AI_INVESTMENT':
        return extensions.value['ai_trading']
      case 'P2P_TRADE':
        return extensions.value['p2p']
      case 'ECOMMERCE_PURCHASE':
        return extensions.value['ecommerce']
      case 'ICO_CONTRIBUTION':
        return extensions.value['ico']
      default:
        return true
    }
  })
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <span class="text-2xl">Referral Program Overview</span>
      </template>
      <template #right>
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          :to="'/user/affiliate/referrals'"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div class="flex justify-center">
        <img
          src="/img/background/referral-program.svg"
          alt="mlm-program"
          class="max-w-4xl w-full"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <BaseCard
          v-for="(condition, index) in validConditions"
          :key="index"
          class="p-5 flex items-center gap-5"
        >
          <div>
            <BaseAvatar
              shape="straight"
              mask="hex"
              size="lg"
              class="bg-muted-200 dark:bg-muted-600 text-muted-800 dark:text-muted-300"
            >
              <span class="text-2xl">{{ index + 1 }}</span>
            </BaseAvatar>
          </div>
          <div>
            <h2 class="text-xl text-info-500">{{ condition.title }}</h2>
            <p class="text-gray-700 dark:text-gray-300">
              {{ condition.description }}
            </p>
            <div class="text-success-500">
              <span>
                Reward: {{ condition.reward
                }}{{
                  condition.reward_type === 'PERCENTAGE'
                    ? '%'
                    : ` ${condition.reward_currency}`
                }}
              </span>
            </div>
          </div>
        </BaseCard>
      </div>
    </TairoContentWrapper>
  </div>
</template>
