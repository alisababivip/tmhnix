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
const { createAdminToken } = useEcosystem()

const isCreateOpen = ref(false)

const { toast } = useUtils()

const zodSchema = z
  .object({
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
    initialSupply: z
      .number()
      .int()
      .positive('Initial supply must be a positive number'),
    cap: z.number().int().positive('Cap must be a positive number'),
    initialHolder: z.string().nonempty('Initial holder is required'),
    decimals: z.number().int().positive('Decimals must be a positive number'),
  })
  .refine((data) => data.cap >= data.initialSupply, {
    message: 'Cap must be larger than or equal to initial supply',
  })

// Validation
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  currency: '',
  initialSupply: 100000000,
  cap: 100000000,
  initialHolder: '',
  decimals: 18,
}))

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const router = useRouter()
const submit = handleSubmit(async (values) => {
  isSubmitting.value = true
  const { name, currency, initialSupply, initialHolder, decimals, cap } = values

  try {
    const response = await createAdminToken(
      chain,
      name,
      currency,
      initialSupply,
      cap,
      initialHolder,
      decimals,
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
          Deploying New {{ chain }} Tokens
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

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="initialSupply"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Token Supply"
                placeholder="Enter token supply amount"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="cap"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Token Cap (Max Supply)"
                placeholder="Enter token max cap amount"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="initialHolder"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Token Holder Address"
                placeholder="Enter address where tokens will be sent"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

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
          {{ $t('Deploy Token') }}
        </BaseButton>
      </div>
    </TairoContentWrapper>
  </div>
</template>
