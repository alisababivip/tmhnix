<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import type { JSONResponse, Wallet } from '~~/types'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const walletStore = useWalletStore()
const wallets = computed(() => walletStore.getFiatWallets)

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

// Validation
const zodSchema = z.object({
  currency: z.string().nonempty('Currency is required'),
})
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({ currency: '' }))
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const { createWallet } = useWallet()
const fiatCurrencyStore = useFiatCurrencyStore()
const { toast } = useUtils()

const activeWallet = ref<Wallet | null>(null)

const income = computed(() => {
  if (!activeWallet.value) return 0
  const incomeTransactions = activeWallet.value.transactions.filter(
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
  if (!activeWallet.value) return 0
  const expenseTransactions = activeWallet.value.transactions.filter(
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

// Create
const isCreateOpen = ref(false)
const create = handleSubmit(async (values: any) => {
  try {
    const response = await createWallet(values.currency, 'FIAT')

    toast.response(response as JSONResponse)

    resetForm()
    await walletStore.fetchWalletsByType('FIAT')
    activeWallet.value = walletStore.wallets[values.currency]
  } catch (error) {
    toast.danger(error as any)
  }
  isCreateOpen.value = false
})

const router = useRouter()
onMounted(async () => {
  if (fiatCurrencyStore.currencies.length === 0) {
    await fiatCurrencyStore.fetchCurrencies()
  }
  await walletStore.fetchWalletsByType('FIAT')

  if (walletStore.getFirstFiatWallet) {
    activeWallet.value = walletStore.getFirstFiatWallet
  }

  if (!settings.value?.fiat_wallets) {
    router.push('/user')
  }
})

const currencies = computed(() => {
  return fiatCurrencyStore.currencies.filter(
    (currency) =>
      currency.status === true &&
      !wallets.value.find((wallet) => wallet.currency === currency),
  )
})
</script>

<template>
  <div>
    <div class="relative">
      <BasePlaceholderPage
        v-if="walletStore.getFiatWallets.length === 0"
        class="h-[calc(100vh-8rem)]"
        title="Looks like you are new!"
        subtitle="Create a new wallet to get started."
      >
        <template #image>
          <img
            src="/img/illustrations/placeholders/people/2.svg"
            alt="placeholder-image"
          />
        </template>

        <div class="mt-2 flex justify-center gap-2">
          <BaseButton
            color="primary"
            shape="curved"
            class="h-11 w-40"
            @click="isCreateOpen = true"
            >{{ $t('Create Wallet') }}
          </BaseButton>
        </div>
      </BasePlaceholderPage>
      <div class="flex flex-col gap-6 md:pb-20" v-else>
        <div class="grid gap-5 grid-cols-12">
          <BaseCard class="overflow-hidden p-6 col-span-12 lg:col-span-8">
            <div class="mb-12 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>{{ $t('My Wallets') }}</span>
              </BaseHeading>

              <div class="flex gap-2 flex-row">
                <BaseButton
                  v-if="settings.deposit"
                  shape="curved"
                  flavor="outline"
                  color="success"
                  shadow="hover"
                  :to="`/user/${
                    flutter ? 'flutter/' : ''
                  }wallets/fiat/deposit/${activeWallet?.uuid}`"
                >
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
                  }wallets/fiat/withdraw/${activeWallet?.uuid}`"
                >
                  {{ $t('Withdraw') }}
                </BaseButton>
              </div>
            </div>
            <div class="flex flex-col gap-y-4 sm:flex-row sm:gap-x-8">
              <div class="space-y-5">
                <BaseButtonIcon
                  shape="rounded"
                  @click="isCreateOpen = true"
                  data-nui-tooltip-position="right"
                  data-nui-tooltip="Create New Wallet"
                >
                  <Icon name="lucide:plus" class="h-4 w-4" />
                </BaseButtonIcon>
              </div>
              <div
                class="slimscroll grid pr-2 grid-cols-1 w-full xs:max-h-[2840px] md:max-h-[164px] gap-4 overflow-y-auto sm:grid-cols-2"
              >
                <UserWalletFiatCard
                  v-for="(wallet, index) in wallets"
                  :key="index"
                  :balance="Number(wallet.balance)"
                  :currency="wallet.currency"
                  :active="activeWallet?.uuid === wallet.uuid"
                  @click="activeWallet = wallet"
                />
              </div>
            </div>
            <div class="mt-4 flex justify-center text-center">
              <p
                class="ltablet:mx-0 text-muted-400 mx-auto max-w-xs text-center font-sans text-xs lg:mx-0"
              >
                {{
                  $t(
                    'Monitor your income, withdrawals, and transactions conveniently in one place',
                  )
                }}.
              </p>
            </div>
          </BaseCard>

          <UserWalletBalanceCard
            class="overflow-hidden p-6 col-span-12 lg:col-span-4"
            v-if="activeWallet"
            :key="activeWallet.uuid"
            :balance="activeWallet.balance"
            :currency="activeWallet.currency"
            :uuid="activeWallet.uuid"
            :income="income"
            :expenses="expenses"
            incomeText="Income"
            expensesText="Withdrawals"
            :uuidFormated="true"
            :currencyFormated="true"
          />
        </div>
        <UserWalletMonthlySummary
          v-if="activeWallet"
          :key="activeWallet.uuid"
          incomeText="Income"
          expensesText="Withdrawals"
          :income="income"
          :expenses="expenses"
          :wallet="activeWallet"
          :currencyFormated="true"
        />

        <UserWalletTransactions
          v-if="activeWallet"
          :key="activeWallet.uuid"
          :wallet="activeWallet"
          :viewPath="`/user/${flutter ? 'flutter/' : ''}wallets/trx`"
        />
      </div>
    </div>
    <TairoModal :open="isCreateOpen" size="sm" @close="isCreateOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create New Wallet') }}
          </h3>

          <BaseButtonClose @click="isCreateOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Please select the currency for the new wallet') }}.
          </p>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="currency"
          >
            <BaseListbox
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="currencies.map((currency) => currency.code)"
              label="Currency"
              placeholder="Select currency"
              shape="curved"
              :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isCreateOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="create"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Create') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
