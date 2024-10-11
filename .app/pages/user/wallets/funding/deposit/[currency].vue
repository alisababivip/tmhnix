<script setup lang="ts">
import Qrcode from 'vue-qrcode'
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
import { useEcosystemCurrencyStore } from '~~/store/extensions/ecosystem/tokens/user'
import type { Wallet } from '~~/types'
definePageMeta({
  title: 'Deposit',
})

const ecosystemCurrencyStore = useEcosystemCurrencyStore()
const token = computed(() =>
  ecosystemCurrencyStore.items.find(
    (item) => item.currency === route.params.currency.toUpperCase(),
  ),
)

const route = useRoute()
const ecoSocketStore = useEcosystemSocketStore()
const currency = route.params.currency.toUpperCase()
const { getWallet, getDepositAddress, unlockDepositAddress } = useEcosystem()
const wallet = ref<Wallet | null>(null)
const dynamicDepositAddress = ref('')

const selectedChain = ref(null)
const isDepositSocketOpen = ref(false)

onMounted(async () => {
  const response = await getWallet(currency)
  if (response.data.result) {
    wallet.value = response.data.result
  }
  if (ecosystemCurrencyStore.items.length === 0) {
    await ecosystemCurrencyStore.fetchCurrencies()
  }

  window.addEventListener('beforeunload', unsubscribeAndCloseSocket)
})

const depositAddress = computed(() => {
  // Use dynamicDepositAddress for NO_PERMIT types
  if (token.value?.contractType === 'NO_PERMIT') {
    return dynamicDepositAddress.value
  }

  // Otherwise, use the address from the wallet
  return selectedChain.value
    ? wallet.value?.addresses[selectedChain.value]?.address
    : ''
})

const errorMessage = ref('')

const isUTXOChain = (chain) => {
  return ['BTC', 'LTC', 'DOGE', 'DASH'].includes(chain)
}

watch(selectedChain, async (newChain, oldChain) => {
  // Unsubscribe from the old chain and address if they exist
  if (oldChain) {
    let oldDepositAddr

    // Check if the token type for the old chain was NO_PERMIT
    if (token.value?.contractType === 'NO_PERMIT') {
      oldDepositAddr = dynamicDepositAddress.value
      unlockAddress()
    } else {
      oldDepositAddr = wallet.value?.addresses[oldChain]?.address // We use the address from the wallet
    }

    if (oldDepositAddr) {
      ecoSocketStore.unsubscribe('deposits', {
        chain: oldChain,
        address: oldDepositAddr,
        uuid: wallet.value?.uuid,
        currency: currency,
        ct: token.value?.contractType,
      })
      ecoSocketStore.depositConnected = false
    }
  }

  // Subscribe to the new chain and address
  if (newChain) {
    let newDepositAddr

    // Check if the token type for the new chain is NO_PERMIT
    if (token.value?.contractType === 'NO_PERMIT') {
      const response = await getDepositAddress(newChain)
      if (
        response.error &&
        response.error.message ===
          'Failed to fetch deposit address: No available wallets'
      ) {
        errorMessage.value =
          'Deposit not available now for this chain, try again later or try another chain'
      }
      if (response.data?.result) {
        dynamicDepositAddress.value = response.data.result
        errorMessage.value = ''
      }
      newDepositAddr = dynamicDepositAddress.value
    } else {
      newDepositAddr = wallet.value?.addresses[newChain]?.address
    }

    if (newDepositAddr) {
      if (!isDepositSocketOpen.value) {
        ecoSocketStore.createSocket('deposits')
        isDepositSocketOpen.value = true
      }
      ecoSocketStore.subscribe('deposits', {
        chain: newChain,
        address: newDepositAddr,
        uuid: wallet.value?.uuid,
        currency: currency,
        ct: token.value?.contractType,
      })
    }
  }
})

const deposit = computed(() => {
  return ecoSocketStore.deposits
})

const { toast } = useUtils()

const copyAddress = () => {
  navigator.clipboard.writeText(depositAddress.value).then(
    () => {
      toast.info('Address copied to clipboard')
    },
    (err) => {
      toast.warning('Failed to copy address to clipboard')
    },
  )
}

const selectedChainOptions = computed(() => {
  const options = wallet.value?.addresses
    ? Object.keys(wallet.value.addresses).map((key) => key)
    : []
  return options
})

// Watch for changes in the deposit status
watch(
  () => ecoSocketStore.deposits,
  (newVal, oldVal) => {
    if (
      newVal &&
      (newVal.status === 'COMPLETED' || newVal.status === 'FAILED')
    ) {
      unsubscribeAndCloseSocket()
    }
  },
  { deep: true },
)

// Function to unsubscribe and close the socket
function unsubscribeAndCloseSocket() {
  // Call unsubscribe action
  try {
    ecoSocketStore.unsubscribe('deposits', {
      chain: selectedChain.value,
      address: depositAddress.value,
      uuid: wallet.value?.uuid,
      currency: currency,
      ct: token.value?.contractType,
    })

    // Close the socket
    ecoSocketStore.closeSocket('deposits')
    console.log('Socket closed')
  } catch (error) {
    console.log(error)
  }

  unlockAddress()
}

function unlockAddress() {
  if (dynamicDepositAddress.value) {
    unlockDepositAddress(dynamicDepositAddress.value)
  }
}

onBeforeRouteLeave((to, from, next) => {
  unsubscribeAndCloseSocket()
  ecoSocketStore.deposits = null
  isDepositSocketOpen.value = false
  next()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', unsubscribeAndCloseSocket)
  unsubscribeAndCloseSocket()
})
</script>

<template>
  <div>
    <div v-if="deposit && !deposit.status">
      <div class="my-auto text-center flex-col justify-center space-y-5">
        <BaseIconBox size="2xl" shape="full" color="info">
          <Icon name="svg-spinners:blocks-shuffle-3" class="h-12 w-12" />
        </BaseIconBox>
        <h1 class="text-2xl font-bold">
          {{ $t('Processing Transaction') }}...
        </h1>
        <p>
          {{
            $t(
              'Transaction received. Please wait while we process it, it may take a few minutes.',
            )
          }}.
        </p>
      </div>
    </div>
    <div v-if="deposit && deposit.status === 'COMPLETED'">
      <div class="my-auto text-center flex-col justify-center space-y-5">
        <BaseIconBox size="2xl" shape="full" color="success">
          <TairoCheckAnimated color="success" size="lg" />
        </BaseIconBox>
        <h1 class="text-2xl font-bold">{{ $t('Payment Successful') }}!</h1>
        <p>
          {{
            $t(
              'Your transaction has been processed successfully. Here are the details',
            )
          }}:
        </p>
        <UserWalletUtxoTransactionDetailsCard
          v-if="isUTXOChain(selectedChain)"
          :transaction="deposit"
          :currency="currency"
          :chain="selectedChain"
        ></UserWalletUtxoTransactionDetailsCard>
        <UserWalletEvmTransactionDetailsCard
          v-else
          :transaction="deposit"
          :currency="currency"
          :chain="selectedChain"
        ></UserWalletEvmTransactionDetailsCard>
        <BaseButton
          :to="`/user/wallets/funding/${currency.toLowerCase()}`"
          color="primary"
          flaver="pastel"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4" />
          <span>{{ $t('Go Back') }}</span>
        </BaseButton>
      </div>
    </div>
    <div v-else-if="deposit && deposit.status === 'FAILED'">
      <div class="my-auto text-center flex-col justify-center space-y-5">
        <BaseIconBox size="2xl" shape="full" color="danger">
          <Icon name="line-md:close" class="h-16 w-16" />
        </BaseIconBox>
        <h1 class="text-2xl font-bold">{{ $t('Payment Failed') }}!</h1>
        <p>
          {{
            $t(
              'There was an issue processing your payment. You can check the details below',
            )
          }}.
        </p>
        <UserWalletUtxoTransactionDetailsCard
          v-if="isUTXOChain(selectedChain)"
          :transaction="deposit"
          :currency="currency"
          :chain="selectedChain"
        ></UserWalletUtxoTransactionDetailsCard>
        <UserWalletEvmTransactionDetailsCard
          v-else
          :transaction="deposit"
          :currency="currency"
          :chain="selectedChain"
        ></UserWalletEvmTransactionDetailsCard>
        <BaseButton
          :to="`/user/wallets/funding/${currency.toLowerCase()}`"
          color="primary"
          flaver="pastel"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4" />
          <span>{{ $t('Go Back') }}</span>
        </BaseButton>
      </div>
    </div>
    <TairoContentWrapper v-if="!deposit?.hash">
      <template #left>
        <BaseHeading size="xl">
          {{ currency }} {{ $t('Deposit') }}
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
            <span>{{ $t('Back') }}</span>
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
            class="max-w-sm mt-5 pl-8"
            v-model="selectedChain"
            :items="selectedChainOptions"
            placeholder="Select a chain"
            shape="rounded"
          />
        </div>
        <template v-if="selectedChain && ecoSocketStore.depositConnected">
          <hr class="border-gray-200 dark:border-gray-700" />
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white"
          >
            <Icon name="line-md:uploading-loop" class="h-6 w-6 mr-2" />
            {{ $t('Send Transaction') }}
          </BaseHeading>
          <div class="grid gap-5 grid-cols-1 sm:grid-cols-12 pl-8">
            <BaseCard
              class="p-5 col-span-1 sm:col-span-8 md:col-span-9 lg:col-span-10"
            >
              <div class="flex items-end gap-5">
                <div class="w-full">
                  <BaseInput
                    v-model="depositAddress"
                    shape="rounded"
                    type="text"
                    :label="`Deposit (${currency}) to the address:`"
                    icon="ph:copy-fill"
                    disabled
                  />
                </div>
                <BaseButton
                  color="info"
                  flavor="outline"
                  @click="copyAddress"
                  >{{ $t('Copy') }}</BaseButton
                >
              </div>
            </BaseCard>
            <qrcode
              class="col-span-1 sm:col-span-4 md:col-span-3 lg:col-span-2"
              type="image/webp"
              :color="{ dark: '#000000ff', light: '#ffffffff' }"
              :value="depositAddress"
              :options="{ width: 100 }"
            ></qrcode>
          </div>
          <div
            class="pl-8 text-danger-600 dark:text-danger-500 text-sm mt-2"
            v-if="token?.contractType === 'NO_PERMIT'"
          >
            <ul>
              <li class="list-disc">
                {{
                  $t(
                    'Please do not send any other currency to the above address. Doing so may result in permanent loss of funds.',
                  )
                }}
              </li>
              <li class="list-disc">
                {{
                  $t(
                    'Please do not close this page until the transaction is confirmed. Otherwise, your deposit may not be credited.',
                  )
                }}
              </li>
            </ul>
          </div>
        </template>
        <template v-else-if="selectedChain && !ecoSocketStore.depositConnected">
          <template v-if="errorMessage">
            <div class="flex items-center justify-center h-80">
              <div class="text-center space-y-5">
                <Icon name="line-md:close" class="h-12 w-12 text-danger-500" />
                <p class="text-lg font-bold">{{ errorMessage }}</p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center justify-center h-80">
              <div class="text-center space-y-5">
                <Icon
                  name="svg-spinners:blocks-shuffle-3"
                  class="h-12 w-12 text-info-500"
                />
                <p class="text-lg font-bold">Connecting...</p>
              </div>
            </div></template
          >
        </template>
      </div>
    </TairoContentWrapper>
  </div>
</template>
