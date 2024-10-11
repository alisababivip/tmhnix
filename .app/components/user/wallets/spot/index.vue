<script setup lang="ts">
import type { ExchangeWallet } from '~~/types'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const { createSpotWallet, getSpotWallet } = useWallet()
const route = useRoute()
const currency = route.params.currency.toUpperCase()
const isGenerating = ref(false)
const isGeneratingFailed = ref(false)

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const wallet = ref<ExchangeWallet | null>(null)

async function fetchOrcreateSpotWallet() {
  try {
    const response = await getSpotWallet(currency)
    if (!response.data.result) {
      isGenerating.value = true
      const data = await createSpotWallet(currency as string)
      wallet.value = data.data.result
      isGenerating.value = false
    } else {
      wallet.value = response.data.result
    }
  } catch (error) {
    isGeneratingFailed.value = true
  }
}

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.currencies)

const currencyData = computed(() => {
  return currencies.value.find(
    (item) => item.currency === wallet.value?.currency,
  )
})

const { countDecimals } = useUtils()
const precision = computed(() => {
  return Math.abs(
    Number(countDecimals(Number(currencyData.value?.precision))) || 8,
  )
})

onMounted(async () => {
  await fetchOrcreateSpotWallet()
  if (currencyStore.currencies.length === 0) {
    await currencyStore.fetchCurrencies()
  }
})

const income = computed(() => {
  if (!wallet.value) return 0
  const incomeTransactions = wallet.value.transactions.filter(
    (transaction) =>
      (transaction.type === 'DEPOSIT' ||
        transaction.type === 'INCOMING_TRANSFER') &&
      (transaction.status === 'COMPLETED' || transaction.status === 'PENDING'),
  )
  return incomeTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  )
})

const expenses = computed(() => {
  if (!wallet.value) return 0
  const expenseTransactions = wallet.value.transactions.filter(
    (transaction) =>
      (transaction.type === 'WITHDRAW' ||
        transaction.type === 'OUTGOING_TRANSFER') &&
      (transaction.status === 'COMPLETED' || transaction.status === 'PENDING'),
  )
  return expenseTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  )
})
</script>
<template>
  <div>
    <TairoContentWrapper>
      <div class="flex justify-between items-center mb-5">
        <BaseHeading size="lg">{{ currency + ' ' + $t('Wallet') }}</BaseHeading>
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          :to="`/user/${flutter ? 'flutter/' : ''}wallets/spot`"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </div>
      <div
        v-if="isGenerating && !isGeneratingFailed"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="info">
            <Icon name="svg-spinners:blocks-shuffle-3" class="h-12 w-12" />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">{{ $t('Generating Wallet') }}</h1>
          <p>{{ $t('Please wait while we generate your wallet') }}.</p>
        </div>
      </div>
      <div
        v-if="isGeneratingFailed"
        class="h-[calc(86vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="danger">
            <Icon
              name="line-md:sunny-filled-loop-to-moon-alt-filled-loop-transition"
              class="h-12 w-12"
            />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">
            {{ $t('Failed to Generate Wallet') }}
          </h1>
          <p>
            {{
              $t(
                'We were unable to generate your wallet. Please try again later or contact support',
              )
            }}.
          </p>
          <BaseButtonAction
            :to="`/user/${flutter ? 'flutter/' : ''}wallets/spot`"
          >
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div v-if="wallet?.currency" class="flex flex-col gap-6 md:pb-10">
        <div class="grid gap-5 grid-cols-12">
          <BaseCard
            class="overflow-hidden p-6 col-span-12 lg:col-span-7"
            v-if="$viewport.isGreaterOrEquals('sm')"
          >
            <div class="mb-12 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>{{ $t('Portfolio') }}</span>
              </BaseHeading>
            </div>

            <div
              class="flex xs:flex-col sm:flex-row justify-center items-center gap-2"
            >
              <BaseButton
                v-if="settings.deposit"
                shape="curved"
                flavor="outline"
                color="success"
                shadow="hover"
                :to="`/user/${
                  flutter ? 'flutter/' : ''
                }wallets/spot/deposit/${wallet?.currency.toLowerCase()}`"
              >
                <Icon
                  name="solar:card-recive-bold-duotone"
                  class="h-6 w-6 mr-2"
                />
                {{ $t('Deposit') }}
              </BaseButton>
              <BaseButton
                v-if="settings.withdraw"
                shape="curved"
                flavor="outline"
                color="danger"
                shadow="hover"
                :to="`/user/${
                  flutter ? 'flutter/' : ''
                }wallets/spot/withdraw/${wallet?.currency.toLowerCase()}`"
              >
                <Icon
                  name="solar:card-send-bold-duotone"
                  class="h-6 w-6 mr-2"
                />
                {{ $t('Withdraw') }}
              </BaseButton>
              <BaseButton
                v-if="settings.transfer"
                shape="curved"
                flavor="outline"
                color="warning"
                shadow="hover"
                :to="`/user/${
                  flutter ? 'flutter/' : ''
                }wallets/spot/transfer/${wallet?.currency.toLowerCase()}`"
              >
                <Icon
                  name="solar:card-send-bold-duotone"
                  class="h-6 w-6 mr-2"
                />
                {{ $t('Transfer') }}
              </BaseButton>
            </div>
            <div class="mt-4 flex justify-center text-center">
              <p
                class="ltablet:mx-0 text-muted-400 mx-auto max-w-xs text-center font-sans lg:mx-0"
                :class="{
                  'text-md':
                    !settings.deposit &&
                    !settings.withdraw &&
                    !settings.transfer,
                  'text-xs':
                    settings.deposit || settings.withdraw || settings.transfer,
                }"
              >
                {{
                  $t(
                    'Monitor your deposits, withdrawals, and transactions conveniently in one place',
                  )
                }}.
              </p>
            </div>
          </BaseCard>

          <div
            v-else
            class="flex flex-col justify-center items-center gap-2 w-full col-span-12"
          >
            <BaseButton
              v-if="settings.deposit"
              class="w-full"
              shape="curved"
              flavor="outline"
              color="success"
              shadow="hover"
              :to="`/user/${
                flutter ? 'flutter/' : ''
              }wallets/spot/deposit/${wallet?.currency.toLowerCase()}`"
            >
              <Icon
                name="solar:card-recive-bold-duotone"
                class="h-6 w-6 mr-2"
              />
              {{ $t('Deposit') }}
            </BaseButton>
            <BaseButton
              v-if="settings.withdraw"
              shape="curved"
              class="w-full"
              flavor="outline"
              color="danger"
              shadow="hover"
              :to="`/user/${
                flutter ? 'flutter/' : ''
              }wallets/spot/withdraw/${wallet?.currency.toLowerCase()}`"
            >
              <Icon name="solar:card-send-bold-duotone" class="h-6 w-6 mr-2" />
              {{ $t('Withdraw') }}
            </BaseButton>
            <BaseButton
              v-if="settings.transfer"
              shape="curved"
              class="w-full"
              flavor="outline"
              color="warning"
              shadow="hover"
              :to="`/user/${
                flutter ? 'flutter/' : ''
              }wallets/spot/transfer/${wallet?.currency.toLowerCase()}`"
            >
              <Icon name="solar:card-send-bold-duotone" class="h-6 w-6 mr-2" />
              {{ $t('Transfer') }}
            </BaseButton>
          </div>

          <UserWalletBalanceCard
            class="overflow-hidden p-6 col-span-12 lg:col-span-5"
            v-if="wallet"
            :key="Number(precision)"
            :balance="Number(wallet.balance).toFixed(Number(precision))"
            :currency="wallet.currency"
            :uuid="wallet.uuid"
            :income="Number(income).toFixed(Number(precision))"
            :expenses="Number(expenses).toFixed(Number(precision))"
            incomeText="Deposits"
            expensesText="Withdrawals"
            :uuidFormated="true"
            :currencyFormated="false"
          />
        </div>
        <UserWalletMonthlySummary
          v-if="wallet"
          incomeText="Deposits"
          expensesText="Withdrawals"
          :income="Number(income).toFixed(Number(precision))"
          :expenses="Number(expenses).toFixed(Number(precision))"
          :wallet="wallet"
          :currencyFormated="false"
        />

        <UserWalletTransactions
          v-if="wallet"
          :wallet="wallet"
          :precision="precision"
          :viewPath="`/user/${flutter ? 'flutter/' : ''}wallets/trx`"
        />
      </div>
    </TairoContentWrapper>
  </div>
</template>
