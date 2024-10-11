<script setup lang="ts">
import { useEcosystemCurrencyStore } from '~~/store/extensions/ecosystem/tokens/user'
import type { Wallet } from '~~/types'
definePageMeta({
  title: 'Wallet Portfolio',
})

const { getWallet, createWallet } = useEcosystem()
const route = useRoute()
const currency = route.params.currency.toUpperCase()
const isGenerating = ref(false)
const isGeneratingFailed = ref(false)

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const wallet = ref<Wallet | null>(null)

async function fetchOrcreateSpotWallet() {
  try {
    const response = await getWallet(currency)
    if (!response.data.result) {
      isGenerating.value = true
      const data = await createWallet(currency as string)
      wallet.value = data.data.result
      isGenerating.value = false
    } else {
      wallet.value = response.data.result
    }
  } catch (error) {
    isGeneratingFailed.value = true
  }
}

const ecosystemCurrencyStore = useEcosystemCurrencyStore()
const currencies = computed(() => ecosystemCurrencyStore.items)

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
  if (ecosystemCurrencyStore.currencies.length === 0) {
    await ecosystemCurrencyStore.fetchCurrencies()
  }
})

const income = computed(() => {
  if (!wallet.value) return 0
  if (!wallet.value?.transactions) return 0
  const incomeTransactions = wallet.value?.transactions?.filter(
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
  if (!wallet.value?.transactions) return 0
  const expenseTransactions = wallet.value?.transactions?.filter(
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
      <template #left>
        <BaseHeading size="xl">
          {{ currency }} {{ $t('Portfolio') }}
        </BaseHeading>
      </template>
      <template #right>
        <div>
          <BaseButton to="/user/wallets/funding" color="muted" flavor="pastel">
            <Icon name="line-md:chevron-left" class="h-4 w-4" />
            <span>{{ $t('Back') }}</span>
          </BaseButton>
        </div>
      </template>
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
          <BaseButtonAction to="/user/wallets/funding">
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div v-if="wallet?.currency" class="flex flex-col gap-6 md:pb-10">
        <div class="grid gap-5 grid-cols-12">
          <div class="col-span-12 sm:col-span-6 md:col-span-5 lg:col-span-4">
            <BaseCard
              class="overflow-hidden p-6 flex flex-col items-center justify-center w-full h-full"
            >
              <div
                class="flex justify-center items-center gap-2 w-full flex-wrap"
              >
                <BaseButton
                  v-if="settings.deposit"
                  shape="curved"
                  flavor="outline"
                  color="success"
                  shadow="hover"
                  :to="`/user/wallets/funding/deposit/${wallet?.currency.toLowerCase()}`"
                  class="w-full"
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
                  class="w-full"
                  :to="`/user/wallets/funding/withdraw/${wallet?.currency.toLowerCase()}`"
                >
                  <Icon
                    name="solar:card-send-bold-duotone"
                    class="h-6 w-6 mr-2"
                  />
                  {{ $t('Withdraw') }}
                </BaseButton>
                <!-- <BaseButton
                v-if="settings.transfer"
                  shape="curved"
                  flavor="outline"
                  color="warning"
                  shadow="hover"
                  class="w-full"
                  :to="`/user/wallets/funding/transfer/${wallet?.currency.toLowerCase()}`"
                >
                  <Icon
                    name="solar:card-send-bold-duotone"
                    class="h-6 w-6 mr-2"
                  />
                  {{ $t('Transfer') }}
                </BaseButton> -->
              </div>
              <div class="mt-4 flex justify-center text-center">
                <p
                  class="ltablet:mx-0 text-muted-400 mx-auto max-w-xs text-center font-sans lg:mx-0"
                  :class="{
                    'text-md': !settings.deposit && !settings.withdraw,
                    'text-xs': settings.deposit || settings.withdraw,
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
          </div>

          <UserWalletBalanceCard
            class="overflow-hidden p-6 col-span-12 sm:col-span-6 md:col-span-7 lg:col-span-8"
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
          viewPath="/user/wallets/trx"
        />
      </div>
    </TairoContentWrapper>
  </div>
</template>
