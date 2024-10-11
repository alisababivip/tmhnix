<script setup lang="ts">
import { useEcosystemCurrencyStore } from '~~/store/extensions/ecosystem/tokens/user'
import type { Wallet } from '~~/types'
definePageMeta({
  title: 'Withdraw',
})

const route = useRoute()
const router = useRouter()
const { getWallet, withdraw } = useEcosystem()
const { toast } = useUtils()

const currency = route.params.currency.toUpperCase()

const ecosystemCurrencyStore = useEcosystemCurrencyStore()
const selectedCurrency = computed(() => {
  return ecosystemCurrencyStore.currencies.find((c) => c.currency === currency)
})

const wallet = ref<Wallet | null>(null)
const withdrawAddress = ref('')
const withdrawAmount = ref(0)
const isWithdrawing = ref(false)

const selectedChain = ref()

const selectedChainOptions = computed(() => {
  if (!wallet.value || !wallet.value.addresses) {
    return []
  }
  return Object.keys(wallet.value.addresses)
})

onMounted(async () => {
  await fetchWalletAndCurrencies()
})

async function fetchWalletAndCurrencies() {
  try {
    const response = await getWallet(currency)
    wallet.value = response.data.result
    selectedChain.value = Object.keys(wallet.value?.addresses)[0]
  } catch (error) {
    router.push('/user/wallets/funding')
  }

  if (ecosystemCurrencyStore.currencies.length === 0) {
    await ecosystemCurrencyStore.fetchCurrencies()
  }
}

async function withdrawAction() {
  if (!withdrawAddress.value) {
    toast.dangerText('Please enter a valid address')
    return
  }

  isWithdrawing.value = true

  try {
    const response = await withdraw(
      wallet.value?.uuid,
      selectedChain.value,
      withdrawAmount.value,
      withdrawAddress.value,
    )

    toast.response(response)
    if (response.status === 'success') {
      router.push(`/user/wallets/funding/${currency.toLowerCase()}`)
    }
  } catch (e) {
    toast.danger(e as any)
  }
  isWithdrawing.value = false
}

const withdrawFee = computed(() => {
  if (
    !selectedChain.value ||
    !selectedCurrency.value ||
    !withdrawAmount.value ||
    withdrawAmount.value <= 0
  ) {
    return 0
  }

  const currencyWithdrawalFee = selectedCurrency.value.fees.withdrawal ?? 0
  const minimumWithdrawalFee = selectedCurrency.value.fees.min_withdrawal ?? 0

  const calculatedFee = withdrawAmount.value * currencyWithdrawalFee

  return Math.max(calculatedFee, minimumWithdrawalFee)
})
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
            :to="`/user/wallets/funding/${currency.toLowerCase()}`"
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
            class="text-muted-800 dark:text-white flex items-center gap-2"
          >
            <Icon
              name="line-md:loading-alt-loop"
              class="h-6 w-6"
              v-if="!selectedChain"
            />
            <Icon name="line-md:confirm-circle" class="h-6 w-6" v-else />
            {{ $t('Select Chain') }}
          </BaseHeading>
          <BaseListbox
            class="max-w-sm mt-5 pl-8"
            v-model="selectedChain"
            :items="selectedChainOptions"
            placeholder="Select a chain"
            shape="rounded"
          />
        </div>
        <template v-if="selectedChain">
          <hr class="border-gray-200 dark:border-gray-700" />
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white flex items-center gap-2"
          >
            <Icon name="line-md:downloading-loop" class="h-6 w-6" />
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
              />
            </div>
            <div class="w-full">
              <BaseInput
                v-model="withdrawAmount"
                :key="selectedChain"
                shape="rounded"
                type="number"
                label="Withdraw amount"
                placeholder="Enter your withdraw amount..."
                autocomplete="off"
              />
            </div>
            <div class="text-sm">
              <div v-if="selectedCurrency?.limits?.withdrawal?.min">
                <span class="text-muted-500"> Minimum Withdraw:</span>
                {{ selectedCurrency?.limits?.withdrawal?.min }}
                {{ currency }}
              </div>
              <div v-if="selectedCurrency?.limits?.withdrawal?.max">
                <span class="text-muted-500"> Maximum Withdraw:</span>
                {{ selectedCurrency?.limits?.withdrawal?.max }}
                {{ currency }}
              </div>
              <div v-if="selectedCurrency?.fees?.withdrawal">
                <span class="text-muted-500"> Withdraw Fee:</span>
                {{ withdrawFee }}
                {{ currency }}
              </div>
            </div>
          </div>

          <hr class="border-gray-200 dark:border-gray-700" />
          <div>
            <BaseButton
              class="w-full"
              color="success"
              @click="withdrawAction"
              :disabled="!withdrawAddress || !withdrawAmount || isWithdrawing"
              :loading="isWithdrawing"
              >{{ $t('Withdraw') }}</BaseButton
            >
          </div>
        </template>
      </div>
    </TairoContentWrapper>
  </div>
</template>
