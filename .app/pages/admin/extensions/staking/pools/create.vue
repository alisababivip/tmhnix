<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useEcosystemAdminTokenStore } from '~~/store/extensions/ecosystem/tokens/admin'
import { useAdminStakingPoolsStore } from '~~/store/extensions/staking/admin/pools'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create Staking Pool',
  permissions: ['Create Staking Pools'],
})
const { toast } = useUtils()
const router = useRouter()

const stakingPoolStore = useAdminStakingPoolsStore()
const { createAdminStakingPool } = useStaking()

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensions)
const ecosystemExtension = computed(
  () => extensions.value?.find((extension) => extension.name === 'ecosystem'),
)
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.currencies)

const ecosystemAdminTokenStore = useEcosystemAdminTokenStore()
const ecoCurrencies = computed(() => ecosystemAdminTokenStore.tokens)

const validWalletTypes: string[] = []

onMounted(async () => {
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
  resetForm()
})

const availablePurchaseCurrencies = computed(() => {
  let allCurrencies: string[] = []
  if (values.type === 'SPOT') {
    allCurrencies = currencies.value.map((item) => item.currency)
  } else if (values.type === 'ECO') {
    allCurrencies = ecoCurrencies.value.map((item) => item.currency)
  }

  // Use a Set to remove duplicates and then spread it into an array
  const uniqueCurrencies = [...new Set(allCurrencies)]
  return uniqueCurrencies
})

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().nullable(),
  currency: z.string().nonempty('Currency is required'),
  chain: z.string().nonempty('Chain is required'),
  type: z.enum(validWalletTypes),
  min_stake: z.number().min(0, 'Min stake must be greater than 0'),
  max_stake: z.number().min(0, 'Max stake must be greater than 0'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED']),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  description: '',
  currency: '',
  chain: '',
  type: '',
  min_stake: 0,
  max_stake: 0,
  status: 'ACTIVE',
}))

const { handleSubmit, isSubmitting, resetForm, values, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Watch for changes in wallet type to reset purchase currency
watch(
  () => values.type,
  (newWalletType) => {
    if (newWalletType) {
      setFieldValue('currency', '')
    }
  },
)

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  try {
    const response = (await createAdminStakingPool(
      values.name,
      values.description,
      values.currency,
      values.chain,
      values.type,
      values.min_stake,
      values.max_stake,
      values.status,
    )) as any
    toast.response(response)
    if (response.status === 'success') {
      await stakingPoolStore.fetchStakingPools()
      router.push('/admin/extensions/staking/pools')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Create Staking Pool') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/admin/extensions/staking/pools"
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
        {{ $t('Create Pool') }}
      </BaseButton>
    </template>
    <form @submit="create" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <div class="grid gap-5 grid-cols-1 sm:grid-cols-2">
          <Field
            name="type"
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
          </Field>

          <!-- currency -->
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
              :disabled="!values?.type || values?.type === ''"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <!-- Name -->
          <Field
            name="name"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Name"
              placeholder="Enter name"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <!-- Chain -->
          <div>
            <Field
              name="chain"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Pool Chain"
                placeholder="Enter chain"
                shape="rounded"
                class="w-full"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-warning-500 text-xs"
                  >Capital letters only, e.g. BSC, ETH, etc.
                </span>
              </small>
            </Field>
          </div>

          <Field
            name="status"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="['ACTIVE', 'INACTIVE', 'COMPLETED']"
              placeholder="Select a status"
              label="Status"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            name="min_stake"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Min Stake"
              placeholder="Enter min stake"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            name="max_stake"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Max Stake"
              placeholder="Enter max stake"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
        <Field
          name="description"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseTextarea
            v-model="field.value"
            :error="errorMessage"
            label="Description"
            shape="rounded"
            placeholder="Write a description"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Create Pool') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
