<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Wallets',
  permissions: ['Access General Settings'],
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  deposit_expiration: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  fiat_wallets: z.object({
    label: z.string(),
    value: z.boolean(),
  }),
  deposit: z.object({
    label: z.string(),
    value: z.boolean(),
  }),
  withdraw: z.object({
    label: z.string(),
    value: z.boolean(),
  }),
  transfer: z.object({
    label: z.string(),
    value: z.boolean(),
  }),
  spot_wallet_withdrawal: z.string().nullable(),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => {
  let deposit_expiration = {
    label: settings.value.deposit_expiration ? 'Enabled' : 'Disabled',
    value: settings.value.deposit_expiration ? true : false,
  }

  let fiat_wallets = {
    label: settings.value.fiat_wallets ? 'Enabled' : 'Disabled',
    value: settings.value.fiat_wallets ? true : false,
  }

  let deposit = {
    label: settings.value.deposit ? 'Enabled' : 'Disabled',
    value: settings.value.deposit ? true : false,
  }

  let withdraw = {
    label: settings.value.withdraw ? 'Enabled' : 'Disabled',
    value: settings.value.withdraw ? true : false,
  }

  let transfer = {
    label: settings.value.transfer ? 'Enabled' : 'Disabled',
    value: settings.value.transfer ? true : false,
  }

  return {
    deposit_expiration,
    fiat_wallets,
    deposit,
    withdraw,
    transfer,
    spot_wallet_withdrawal:
      settings.value.spot_wallet_withdrawal || 'Automatic',
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
  if (values.deposit_expiration) {
    values.deposit_expiration = values.deposit_expiration.value
  }

  if (values.fiat_wallets) {
    values.fiat_wallets = values.fiat_wallets.value
  }

  if (values.deposit) {
    values.deposit = values.deposit.value
  }

  if (values.withdraw) {
    values.withdraw = values.withdraw.value
  }

  if (values.transfer) {
    values.transfer = values.transfer.value
  }
  success.value = false
  try {
    const response = await updateSettings(values)
    if (response.status === 'success') {
      await updateSettings(values)
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
    if (error.data && error.data.errors) {
      for (const [key, value] of Object.entries(error.data.errors)) {
        setFieldError(key, value[0])
      }
    } else {
      // Fallback: Handle the case where error.data or error.data.errors is undefined.
      console.error('An unknown error occurred:', error)
    }
  }
})
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
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
            {{ $t('General Settings') }}
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            {{ $t('Edit your site settings') }}
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
            label="Global Settings"
            sublabel="Global settings for the all wallets"
          >
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="deposit_expiration"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Deposit Expiration"
                    label="Deposit Expiration"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />

                  <!-- TODO: better text -->
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t(
                        'Spot wallet deposit expiration limit to prevent lookups from use random transactions that sent to the spot wallet address',
                      )
                    }}</span></small
                  >
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="fiat_wallets"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Fiat Wallets"
                    label="Fiat Wallets"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t(
                        'Disable this option if you want to disable fiat wallets and everything related to it',
                      )
                    }}</span></small
                  >
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="deposit"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Deposit"
                    label="Deposit"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t('Disable this option if you want to disable deposits')
                    }}</span></small
                  >
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="transfer"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Transfer"
                    label="Transfer"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t('Disable this option if you want to disable transfers')
                    }}</span></small
                  >
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <TairoFormGroup label="Withdraw" sublabel="Withdraw settings">
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="withdraw"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Withdraw"
                    label="Withdraw"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t('Disable this option if you want to disable withdraws')
                    }}</span></small
                  >
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="spot_wallet_withdrawal"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="['Automatic', 'Manual']"
                    placeholder="Spot Wallet Withdrawal"
                    label="Spot Wallet Withdrawal"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t(
                        'Spot wallet withdrawal limit to prevent lookups from use random transactions that sent to the spot wallet address',
                      )
                    }}</span></small
                  >
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
</template>
