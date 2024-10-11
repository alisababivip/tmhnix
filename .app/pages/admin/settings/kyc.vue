<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'KYC Settings',
  permissions: ['Access KYC Settings'],
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const restrictionFields = [
  {
    name: 'trade_restrictions',
    label: 'Trade Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'binary_restrictions',
    label: 'Binary Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'forex_restrictions',
    label: 'Forex Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'bot_restrictions',
    label: 'Bot Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'ico_restrictions',
    label: 'ICO Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'mlm_restrictions',
    label: 'MLM Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'wallet_restrictions',
    label: 'Wallet Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'deposit_restrictions',
    label: 'Deposit Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'withdrawal_restrictions',
    label: 'Withdrawal Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'ecommerce_restrictions',
    label: 'Ecommerce Restrictions',
    placeholder: 'Select an option',
  },
  {
    name: 'staking_restrictions',
    label: 'Staking Restrictions',
    placeholder: 'Select an option',
  },
]
const restrictionSchema = z.object({
  label: z.string(),
  value: z.boolean(),
})

// Define kyc_status schema
const kycStatusSchema = z.object({
  kyc_status: restrictionSchema,
})

// Define schema for other restriction fields
const restrictionsSchema = z.object(
  restrictionFields.reduce((acc, field) => {
    acc[field.name] = restrictionSchema
    return acc
  }, {}),
)

// Merge both into one schema
const zodSchema = z.object({
  ...kycStatusSchema.shape,
  ...restrictionsSchema.shape,
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
const validationSchema = toTypedSchema(zodSchema)
const createRestriction = (isEnabled: any) => ({
  label: isEnabled ? 'Enabled' : 'Disabled',
  value: isEnabled,
})

const initialValues = computed(() => {
  const initialValues = {}

  // Manually add kyc_status
  initialValues['kyc_status'] = createRestriction(
    settings.value['kyc_status'] || false,
  )

  // Automatically add other restriction fields
  restrictionFields.forEach((field) => {
    initialValues[field.name] = createRestriction(
      settings.value[field.name] || false,
    )
  })

  return initialValues
})

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
  meta,
  errors,
  resetForm,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})

const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

// This is where you would send the form data to the server
const onSubmit = handleSubmit(async (values: any) => {
  success.value = false

  try {
    const booleanValues = Object.fromEntries(
      Object.entries(values).map(([key, obj]) => [key, obj.value]),
    )
    const response = await updateSettings(booleanValues)
    if (response.status === 'success') {
      await updateSettings(booleanValues)
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      success.value = true

      settingsStore.setSettings(Object.values(response.data.result))

      setTimeout(() => {
        success.value = false
      }, 3000)
    }
  } catch (error) {
    for (const [key, value] of Object.entries(error.data.errors)) {
      setFieldError(key, value[0])
    }
  }
})

const answers = [
  {
    label: 'Enabled',
    value: true,
  },
  {
    label: 'Disabled',
    value: false,
  },
]
</script>

<template>
  <div>
    <form
      method="POST"
      action=""
      class="w-full pb-16"
      @submit.prevent="onSubmit"
    >
      <BaseCard>
        <div class="flex items-center justify-between p-4">
          <div>
            <BaseHeading
              tag="h2"
              size="sm"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider"
            >
              {{ $t('KYC Settings') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Edit your site KYC settings') }}
            </BaseText>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton
              type="submit"
              color="primary"
              class="w-24"
              :disabled="isSubmitting || !meta.dirty"
              :loading="isSubmitting"
              >{{ $t('Save') }}</BaseButton
            >
          </div>
        </div>
        <div class="px-8">
          <div class="mx-auto space-y-12 py-8">
            <BaseMessage v-if="success" @close="success = false">
              <span class="text-gray-700 dark:text-gray-300"
                >{{ $t('Your settings have been saved') }}!</span
              >
            </BaseMessage>
            <BaseMessage
              v-if="fieldsWithErrors"
              type="danger"
              @close="() => setErrors({})"
            >
              {{ $t('This form has') }} {{ fieldsWithErrors }}
              {{ $t('errors, please check them before submitting') }}
            </BaseMessage>

            <TairoFormGroup
              label="KYC Status"
              sublabel="control your KYC status in the system"
            >
              <div class="grid grid-cols-12 gap-4 pt-2">
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="kyc_status"
                  >
                    <BaseListbox
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      :items="answers"
                      :properties="{ label: 'label', value: 'value' }"
                      placeholder="Select an option"
                      label="KYC Status"
                      shape="rounded"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>
            </TairoFormGroup>
            <TairoFormGroup
              label="Restrictions"
              sublabel="control client restrictions in the system depending on their KYC status"
            >
              <div class="grid grid-cols-12 gap-4 pt-2">
                <div
                  v-for="restriction in restrictionFields"
                  :key="restriction.name"
                  class="col-span-12 sm:col-span-6"
                >
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    :name="restriction.name"
                  >
                    <BaseListbox
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      :items="answers"
                      :properties="{ label: 'label', value: 'value' }"
                      :placeholder="restriction.placeholder"
                      :label="restriction.label"
                      shape="rounded"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>
            </TairoFormGroup>
          </div>
        </div>
      </BaseCard>
      <TairoFormSave
        :disabled="isSubmitting"
        :loading="isSubmitting"
        @reset="resetForm"
      />
    </form>
  </div>
</template>
