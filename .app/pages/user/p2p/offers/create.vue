<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

import { useEcosystemAdminTokenStore } from '~~/store/extensions/ecosystem/tokens/admin'
import { useUserP2POffersStore } from '~~/store/extensions/p2p/user/offers'
import { useUserPaymentMethodsStore } from '~~/store/extensions/p2p/user/payment-methods'
import type { Wallet } from '~~/types'
definePageMeta({
  title: 'Create P2P Offer',
})
const { toast } = useUtils()
const router = useRouter()

const p2pOfferStore = useUserP2POffersStore()
const { createUserP2POffer } = useP2P()
const { fetchWallet } = useWallet()
const p2pPaymentMethodStore = useUserPaymentMethodsStore()
const methods = computed(() => p2pPaymentMethodStore.methods)

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensions)
const ecosystemExtension = computed(
  () => extensions.value?.find((extension) => extension.name === 'ecosystem'),
)
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.currencies)
const fiatCurrencyStore = useFiatCurrencyStore()
const fiatCurrencies = computed(() => fiatCurrencyStore.currencies)

const ecosystemAdminTokenStore = useEcosystemAdminTokenStore()
const ecoCurrencies = computed(() => ecosystemAdminTokenStore.tokens)

const validWalletTypes: string[] = ['FIAT']

onMounted(async () => {
  if (p2pPaymentMethodStore.methods.length === 0) {
    await p2pPaymentMethodStore.fetchPaymentMethods()
  }
  if (p2pPaymentMethodStore.methods.length === 0) {
    router.push('/user/p2p/payment-methods/create')
    toast.dangerText('You need to create a payment method first')
  }
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensions()
  }
  if (settings.value?.spot_exchange) {
    validWalletTypes.push('SPOT')
    if (currencyStore.currencies.length === 0) {
      await currencyStore.fetchCurrencies()
    }
  }
  if (ecosystemExtension.value?.status) {
    validWalletTypes.push('ECO')
    if (ecosystemAdminTokenStore.tokens.length === 0) {
      await ecosystemAdminTokenStore.fetchTokensAll()
    }
  }
  if (fiatCurrencyStore.currencies.length === 0) {
    await fiatCurrencyStore.fetchCurrencies()
  }
  resetForm()
})

const availablePurchaseCurrencies = computed(() => {
  let allCurrencies: string[] = []
  if (values.wallet_type === 'SPOT') {
    allCurrencies = currencies.value.map((item) => item.currency)
  } else if (values.wallet_type === 'ECO') {
    allCurrencies = ecoCurrencies.value.map((item) => item.currency)
  } else if (values.wallet_type === 'FIAT') {
    allCurrencies = fiatCurrencies.value.map((item) => item.code)
  }

  // Use a Set to remove duplicates and then spread it into an array
  const uniqueCurrencies = [...new Set(allCurrencies)]
  return uniqueCurrencies
})

// Validation
const zodSchema = z.object({
  wallet_type: z.enum(validWalletTypes),
  currency: z.string().nonempty('Currency is required'),
  chain: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  price: z.number().positive('Price must be positive'),
  payment_method: z.object({
    label: z.string(),
    value: z.number(),
  }),
  min_amount: z.number().positive('Minimum amount must be positive'),
  max_amount: z.number().positive('Maximum amount must be positive'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  wallet_type: '',
  currency: '',
  amount: 0,
  price: 0,
  payment_method: {
    label: 'Select a payment method',
    value: 0,
  },
  min_amount: 0,
  max_amount: 0,
}))

const { handleSubmit, isSubmitting, resetForm, values, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Watch for changes in wallet type to reset purchase currency
watch(
  () => values.wallet_type,
  (newWalletType) => {
    if (newWalletType) {
      setFieldValue('currency', '')
    }
  },
)

const wallet = ref<Wallet | null>(null)
watch(
  () => values.currency,
  async (newCurrency) => {
    if (newCurrency && values.wallet_type) {
      const response = (await fetchWallet(
        newCurrency,
        values.wallet_type,
      )) as any
      wallet.value = response.data.result
    }
  },
)

const chains = computed(() => {
  if (wallet.value?.addresses) {
    return Object.keys(wallet.value.addresses)
  }
  return []
})

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  if (!wallet.value) {
    toast.dangerText('Wallet not found')
    return
  }
  if (values.amount > wallet.value?.balance) {
    toast.dangerText('Insufficient balance')
    return
  }
  if (values.min_amount > values.max_amount) {
    toast.dangerText(
      'Minimum trade amount cannot be greater than maximum trade amount',
    )
    return
  }
  if (values.min_amount > values.amount) {
    toast.dangerText('Minimum trade amount cannot be greater than offer amount')
    return
  }
  if (values.max_amount > values.amount) {
    toast.dangerText('Maximum trade amount cannot be greater than offer amount')
    return
  }
  if (values.price <= 0) {
    toast.dangerText('Price must be greater than 0')
    return
  }
  if (values.wallet_type !== 'FIAT' && values.chain === '') {
    toast.dangerText('Chain is required')
    return
  }

  try {
    const response = await createUserP2POffer(
      values.wallet_type as any,
      values.currency,
      values.amount,
      values.price,
      values.payment_method.value,
      values.min_amount,
      values.max_amount,
      values.chain,
    )
    toast.response(response)
    if (response.status === 'success') {
      await p2pOfferStore.fetchP2POffers()
      await p2pOfferStore.fetchUserP2POffers()
      router.push('/user/p2p/offers')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Create P2P Offer') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/user/p2p/offers"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="w-full"
        @click="create"
      >
        {{ $t('Create') }}
      </BaseButton>
    </template>
    <form @submit="create" class="space-y-8">
      <BaseCard class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- PaymentMethod -->
          <div>
            <Field
              name="payment_method"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :items="
                  methods?.map((method) => ({
                    label: method.name,
                    value: method.id,
                  }))
                "
                :properties="{ label: 'label', value: 'value' }"
                placeholder="Select a payment method"
                label="Payment Method"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Select a payment method to receive the payment
                </span>
              </small>
            </Field>
          </div>

          <div>
            <Field
              name="wallet_type"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :items="validWalletTypes"
                label="Purchase Wallet Type"
                placeholder="Select wallet type"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Select a wallet type to receive the payment
                </span>
              </small>
            </Field>
          </div>
          <!-- purchase currency -->
          <div>
            <Field
              name="currency"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :items="availablePurchaseCurrencies"
                label="Purchase Currency"
                placeholder="Select purchase currency"
                :disabled="!values?.wallet_type || values?.wallet_type === ''"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Select a currency of the wallet type
                </span>
              </small>
            </Field>
          </div>

          <!-- Chain -->
          <div v-if="values.wallet_type && values.wallet_type !== 'FIAT'">
            <Field
              name="chain"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :items="chains"
                label="Chain"
                placeholder="Select chain"
                :disabled="!values?.wallet_type || values?.wallet_type === ''"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Select a chain of the wallet type
                </span>
              </small>
            </Field>
          </div>

          <div>
            <BaseInput
              :model-value="`${wallet?.balance ?? 0} ${values?.currency ?? ''}`"
              label="Balance"
              shape="rounded"
              placeholder="Please select a currency"
              readonly
              disabled
            />
            <small>
              <span class="text-xs text-warning-500">
                Balance of the selected currency
              </span>
            </small>
          </div>
          <!-- Amount -->
          <div>
            <Field
              name="amount"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                label="Amount"
                shape="rounded"
                placeholder="Enter amount"
                type="number"
                min="0"
                :max="wallet?.balance ?? 0"
                step="0.00000001"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Enter the amount you want to sell, it will be deducted from
                  your wallet
                </span>
              </small>
            </Field>
          </div>

          <!-- Price -->
          <div>
            <Field
              name="price"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                label="Price"
                shape="rounded"
                placeholder="Enter price"
                type="number"
                min="0"
                step="0.00000001"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Enter the price you want to sell at
                </span>
              </small>
            </Field>
          </div>

          <!-- Min Amount -->
          <div>
            <Field
              name="min_amount"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                label="Minimum Amount"
                shape="rounded"
                placeholder="Enter minimum amount"
                type="number"
                min="0"
                step="0.00000001"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Enter the minimum amount you want to sell
                </span>
              </small>
            </Field>
          </div>

          <!-- Max Amount -->
          <div>
            <Field
              name="max_amount"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                label="Maximum Amount"
                shape="rounded"
                placeholder="Enter maximum amount"
                type="number"
                min="0"
                step="0.00000001"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Enter the maximum amount you want to sell
                </span>
              </small>
            </Field>
          </div>
        </div>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Create Offer') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
