<script setup lang="ts">
import type { Wallet } from '~~/types'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Wallet Details',
  permissions: ['Access Wallet Details'],
})

const amountSchema = z.object({
  amount: z.number().min(0.00000001, 'Amount must be greater than 0'),
})

type FormInput = z.infer<typeof amountSchema>
const validationSchema = toTypedSchema(amountSchema)
const initialValues = computed<FormInput>(() => ({
  amount: 0,
}))

const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues,
})

const { adminGetWallet, updateBalance } = useWallet()

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

const wallet = ref<Wallet | null>(null)

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

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  try {
    const response = await adminGetWallet(route.params.uuid as string)
    if (response.status === 'success') {
      wallet.value = response.data.result
    } else {
      toast.danger(response as any)
      router.back()
    }
  } catch (error) {
    console.log(error)
  }
})

const { toast } = useUtils()

const addBalance = handleSubmit(async (values: any) => {
  if (!wallet.value) return
  try {
    const response = await updateBalance(
      wallet.value.uuid,
      'ADD',
      values.amount,
    )

    toast.response(response)
    if (response.status === 'success') {
      wallet.value = response.data.result
    }
  } catch (error) {
    console.log(error.message)
    toast.danger(error as any)
  }
  isModifyBalanceModalOpen.value = false
})

const subtractBalance = handleSubmit(async (values: any) => {
  if (!wallet.value) return
  try {
    const response = await updateBalance(
      wallet.value.uuid,
      'SUBTRACT',
      values.amount,
    )
    wallet.value = response.data.result

    toast.response(response)
  } catch (error) {
    console.log(error.message)

    toast.danger(error as any)
  }
  isModifyBalanceModalOpen.value = false
})

const isModifyBalanceModalOpen = ref(false)
const openBalanceModal = () => {
  isModifyBalanceModalOpen.value = true
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading
          as="h3"
          size="md"
          weight="semibold"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>{{ wallet?.currency }} {{ $t('Wallet') }}</span>
        </BaseHeading>
      </template>
      <template #right>
        <BaseButton color="muted" @click="router.back()">
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div class="relative">
        <div class="flex flex-col gap-6 md:pb-20">
          <div class="grid gap-5 grid-cols-12">
            <BaseCard
              class="overflow-hidden p-6 col-span-12 lg:col-span-7"
              shape="curved"
            >
              <div class="mb-4 flex items-center justify-between">
                <BaseHeading
                  as="h4"
                  size="md"
                  weight="semibold"
                  lead="tight"
                  class="text-muted-800 dark:text-white"
                >
                  <span>{{
                    wallet?.type !== 'ECO' ? $t('Details') : $t('Chain Details')
                  }}</span>
                </BaseHeading>
                <BaseButton color="primary" @click="openBalanceModal" size="sm">
                  {{ $t('Modify Balance') }}
                </BaseButton>
              </div>
              <div>
                <template v-if="wallet?.type === 'ECO'">
                  <div v-for="(chain, key, index) in wallet?.addresses">
                    <div class="text-xs flex gap-5 justify-between">
                      <span
                        ><span class="text-info-500">{{ key }}</span
                        >: {{ chain.address }}</span
                      >
                      <span>{{ chain.balance }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </BaseCard>
            <UserWalletBalanceCard
              class="overflow-hidden p-6 col-span-12 lg:col-span-5"
              v-if="wallet"
              :key="wallet.transactions.length"
              :balance="Number(wallet.balance).toFixed(Number(precision))"
              :currency="wallet.currency"
              :uuid="wallet.uuid"
              :income="Number(income).toFixed(Number(precision))"
              :expenses="Number(expenses).toFixed(Number(precision))"
              incomeText="Income"
              expensesText="Expenses"
              :uuidFormated="false"
            />
          </div>
          <UserWalletMonthlySummary
            v-if="wallet"
            :key="wallet.transactions.length"
            incomeText="Income"
            expensesText="Expenses"
            :income="Number(income).toFixed(Number(precision))"
            :expenses="Number(expenses).toFixed(Number(precision))"
            :wallet="wallet"
          />

          <UserWalletTransactions
            v-if="wallet"
            :key="wallet.transactions.length"
            :precision="precision"
            :wallet="wallet"
            viewPath="/admin/finance/log"
          />
        </div>
      </div>
    </TairoContentWrapper>
    <TairoModal
      :open="isModifyBalanceModalOpen"
      size="sm"
      @close="isModifyBalanceModalOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Modify Wallet Balance') }}
          </h3>
          <BaseButtonClose @click="isModifyBalanceModalOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Enter Amount') }}
          </h3>

          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{
              $t(
                'Please enter the amount you want to add or subtract from the wallet balance',
              )
            }}.
          </p>

          <div class="flex flex-col gap-3">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="amount"
            >
              <BaseInput
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                label="Amount"
                type="number"
                placeholder="Enter amount"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <BaseButton color="primary" @click="addBalance()">
              {{ $t('Add Balance') }}
            </BaseButton>
            <BaseButton color="danger" @click="subtractBalance()">
              {{ $t('Subtract Balance') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
