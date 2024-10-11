<script setup lang="ts">
import { useEcosystemAdminTokenStore } from '~~/store/extensions/ecosystem/tokens/admin'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  permissions: ['View Ecosystem Tokens'],
  title: 'Ecosystem Tokens',
})

const route = useRoute()
const { chain } = route.params

const ecosystemAdminTokenStore = useEcosystemAdminTokenStore()
const { importAdminToken } = useEcosystem()

const isCreateOpen = ref(false)

const { toast } = useUtils()

const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  currency: z
    .string()
    .nonempty('Currency is required')
    .refine((value) => value.length <= 11, {
      message: "Currency can't be longer than 11 characters",
    })
    .refine((value) => /^[A-Z0-9]+$/.test(value), {
      message:
        'Currency must be all uppercase and contain only alphabets and numbers, no spaces',
    }),
  decimals: z.number().int().positive('Decimals must be a positive number'),
  contract: z.string().nonempty('Contract is required'),
  contractType: z.object({
    label: z.string().nonempty('Contract type label is required'),
    value: z.string().nonempty('Contract type value is required'),
  }),
  network: z.string().nonempty('Network is required'),
  type: z.string().nonempty('Type is required'),
})

// Validation
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  currency: '',
  decimals: 18,
  contract: '',
  contractType: {
    label: 'Permit',
    value: 'PERMIT',
  },
  network: '',
  type: '',
}))

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const router = useRouter()
const submit = handleSubmit(async (values) => {
  isSubmitting.value = true
  const { name, currency, network, type, contract, decimals, contractType } =
    values

  try {
    const response = await importAdminToken(
      name,
      currency,
      chain,
      network,
      type,
      contract,
      decimals,
      contractType.value,
    )
    toast.response(response)

    if (response.status === 'success') {
      await ecosystemAdminTokenStore.fetchTokensAll()
      isCreateOpen.value = false
      resetForm()
      router.push(`/admin/extensions/ecosystem/tokens/${chain}`)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isSubmitting.value = false
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <div class="text-lg font-semibold">
          Importing New {{ chain }} Tokens
        </div>
      </template>
      <template #right>
        <BaseButton
          :to="`/admin/extensions/ecosystem/tokens/${chain}`"
          color="muted"
          flavor="pastel"
        >
          <Icon name="line-md:chevron-left" class="me-2 h-4 w-4" />
          Back
        </BaseButton>
      </template>

      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <div class="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="name"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Token Name"
                placeholder="Enter token name"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="currency"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Token Symbol"
                placeholder="Enter token symbol"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <div>
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="contract"
              >
                <BaseInput
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="text"
                  label="Token Contract Address"
                  placeholder="Enter token contract address"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
                <small>
                  <span class="text-warning-500 text-xs">
                    * Please make sure the smart contract address is correct
                  </span>
                </small>
              </Field>
            </div>

            <div>
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="network"
              >
                <BaseInput
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="text"
                  label="Token Network"
                  placeholder="Enter token network"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
                <small>
                  <span class="text-warning-500 text-xs">
                    * Please make sure the token network is correct, e.g.
                    mainnet, ropsten, rinkeby, kovan, goerli
                  </span>
                </small>
              </Field>
            </div>

            <div>
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="type"
              >
                <BaseInput
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="text"
                  label="Token Type"
                  placeholder="Enter token type"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
                <small>
                  <span class="text-warning-500 text-xs">
                    * Please make sure the token type is correct, e.g. ERC20,
                    BEP20, TRC20
                  </span>
                </small>
              </Field>
            </div>

            <div>
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="contractType"
              >
                <BaseListbox
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  label="Token Contract Type"
                  :items="[
                    { label: 'Permit', value: 'PERMIT' },
                    { label: 'No Permit', value: 'NO_PERMIT' },
                  ]"
                  :properties="{ label: 'label', value: 'value' }"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
                <small>
                  <span class="text-warning-500 text-xs">
                    * Please make sure the token contract type is correct, its
                    either PERMIT or NO_PERMIT, you can check the token contract
                    type on the token contract source code
                  </span>
                </small>
              </Field>
            </div>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="decimals"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Token Decimals"
                placeholder="Enter token decimals"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>
        </div>
      </div>

      <div class="p-4 md:p-6">
        <BaseButton
          color="primary"
          flavor="solid"
          @click="submit()"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          {{ $t('Import Token') }}
        </BaseButton>
      </div>
    </TairoContentWrapper>
  </div>
</template>
