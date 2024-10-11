<script setup lang="ts">
const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const currencyStore = useCurrencyStore()
const { toast } = useUtils()
const { createSpotWithdrawTransaction } = useWallet()

const currency = route.params.currency.toUpperCase()

const currencies = computed(() => currencyStore.currencies)
const wallet = computed(() => walletStore.wallet)
const selectedChain = ref(null)
const withdrawAddress = ref('')
const withdrawAmount = ref(0)
const withdrawMemo = ref(null)
const isWithdrawing = ref(false)

const selectedChainOptions = computed(() => {
  return wallet.value?.addresses ? Object.keys(wallet.value.addresses) : []
})
const currencyData = computed(() => {
  return currencies.value.find(
    (item) => item.currency === wallet.value?.currency,
  )
})
const currencyChainData = computed(() => {
  return currencyData.value.chains.find(
    (chain) => chain.network === selectedChain.value,
  )
})
const hasMemo = computed(() => {
  return (
    currencyChainData.value?.memoRegex &&
    currencyChainData.value?.memoRegex !== ''
  )
})
const withdrawFee = computed(() => currencyChainData.value?.withdrawFee)

onMounted(async () => {
  await fetchWalletAndCurrencies()
})

async function fetchWalletAndCurrencies() {
  try {
    await walletStore.fetchWallet(currency, 'SPOT')
  } catch (error) {
    router.push(`/user/${props.flutter ? 'flutter/' : ''}wallets/spot`)
  }

  if (currencyStore.currencies.length === 0) {
    await currencyStore.fetchCurrencies()
  }

  if (selectedChainOptions.value.length > 0) {
    selectedChain.value = selectedChainOptions.value[0]
  }
}

async function withdraw() {
  if (!withdrawAddress.value) {
    toast.dangerText('Please enter a valid address')
    return
  }
  isWithdrawing.value = true

  try {
    const response = await createSpotWithdrawTransaction(
      wallet.value?.currency,
      selectedChain.value,
      withdrawAmount.value,
      withdrawAddress.value,
      withdrawMemo.value,
    )

    toast.response(response)
    if (response.status === 'success') {
      router.push(
        `/user/${
          props.flutter ? 'flutter/' : ''
        }wallets/spot/${currency.toLowerCase()}`,
      )
    }
  } catch (e) {
    toast.danger(e)
  }
  isWithdrawing.value = false
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading size="xl">
          {{ currency }} {{ $t('Withdraw') }}
        </BaseHeading>
      </template>
      <template #right>
        <div>
          <BaseButton
            :to="`/user/${
              flutter ? 'flutter/' : ''
            }wallets/spot/${currency.toLowerCase()}`"
            color="muted"
            flavor="pastel"
          >
            <Icon name="line-md:chevron-left" class="h-4 w-4" />
            <span>{{ $t('Cancel') }}</span>
          </BaseButton>
        </div>
      </template>

      <div class="space-y-5 min-h-screen pb-20">
        <div>
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white items-center flex"
          >
            <Icon
              name="line-md:loading-alt-loop"
              class="h-6 w-6 mr-2"
              v-if="!selectedChain"
            />
            <Icon name="line-md:confirm-circle" class="h-6 w-6 mr-2" v-else />
            {{ $t('Select Chain') }}
          </BaseHeading>
          <BaseListbox
            class="max-w-sm mt-5 pl-8 z-40"
            v-model="selectedChain"
            :items="selectedChainOptions"
            placeholder="Select a chain"
            shape="rounded"
          />
        </div>
        <template v-if="selectedChain">
          <hr class="border-gray-300 dark:border-gray-700" />
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white"
          >
            <Icon name="line-md:downloading-loop" class="h-6 w-6 mr-2" />
            {{ $t('Withdrawal Details') }}
          </BaseHeading>
          <div class="space-y-5 pl-8">
            <div class="w-full">
              <BaseInput
                v-model="withdrawAddress"
                shape="rounded"
                type="text"
                label="Withdraw address"
                placeholder="Enter your withdraw address..."
                icon="logos:ethereum"
              />
            </div>
            <div class="w-full">
              <BaseInput
                v-model="withdrawAmount"
                :key="selectedChain"
                :min="Number(currencyChainData?.minWithdraw)"
                :max="Number(currencyChainData?.maxWithdraw)"
                shape="rounded"
                type="number"
                label="Withdraw amount"
                placeholder="Enter your withdraw amount..."
                icon="streamline:money-atm-card-2-deposit-money-payment-finance-atm-withdraw"
                :error="
                  currencyChainData?.minWithdraw &&
                  withdrawAmount < Number(currencyChainData?.minWithdraw)
                    ? `Minimum withdraw amount is ${currencyChainData?.minWithdraw} ${currency}`
                    : false ||
                      (currencyChainData?.maxWithdraw &&
                        withdrawAmount > Number(currencyChainData?.maxWithdraw))
                    ? `Maximum withdraw amount is ${currencyChainData?.maxWithdraw} ${currency}`
                    : false
                "
              />
            </div>
            <div class="w-full" v-if="hasMemo">
              <BaseInput
                v-model="withdrawMemo"
                :key="selectedChain"
                shape="rounded"
                type="text"
                label="Withdraw memo"
                placeholder="Enter your withdraw memo..."
                icon="ph:copy-fill"
              />
            </div>
            <div class="w-full">
              <BaseInput
                v-model="withdrawFee"
                shape="rounded"
                type="number"
                label="Withdraw fee"
                icon="heroicons-outline:receipt-tax"
                readonly
              />
            </div>
          </div>

          <hr class="border-gray-300 dark:border-gray-700" />
          <div>
            <BaseButton
              class="w-full"
              color="success"
              @click="withdraw"
              :disabled="
                !withdrawAddress ||
                !withdrawAmount ||
                (currencyChainData?.minWithdraw &&
                  withdrawAmount < Number(currencyChainData?.minWithdraw)) ||
                (currencyChainData?.maxWithdraw &&
                  withdrawAmount > Number(currencyChainData?.maxWithdraw)) ||
                isWithdrawing
              "
              :loading="isWithdrawing"
              >{{ $t('Withdraw') }}</BaseButton
            >
          </div>
        </template>
      </div>
    </TairoContentWrapper>
  </div>
</template>
