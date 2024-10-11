<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Binary Trading',
  permissions: ['Access Binary Trading Settings'],
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  // binary_trading: z
  //   .object({
  //     label: z.string(),
  //     value: z.boolean(),
  //   })
  //   .nullable(),
  binary_trading_practice: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  binary_trading_profit_percentage: z
    .number()
    .min(0, 'Please enter a valid profit percentage'),
  binary_trading_fee: z.number().min(0, 'Please enter a valid fee percentage'),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => {
  // let binary_trading = {
  //   label: settings.value.binary_trading ? 'Enabled' : 'Disabled',
  //   value: settings.value.binary_trading ? true : false,
  // }
  let binary_trading_practice = {
    label: settings.value.binary_trading_practice ? 'Enabled' : 'Disabled',
    value: settings.value.binary_trading_practice ? true : false,
  }

  return {
    // binary_trading: binary_trading,
    binary_trading_practice: binary_trading_practice,
    binary_trading_profit_percentage: settings.value
      .binary_trading_profit_percentage
      ? parseFloat(settings.value.binary_trading_profit_percentage)
      : 0,
    binary_trading_fee: settings.value.binary_trading_fee
      ? parseFloat(settings.value.binary_trading_fee)
      : 0,
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
const { toast } = useUtils()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(async (values: any) => {
  if (values.binary_trading_practice) {
    values.binary_trading_practice = values.binary_trading_practice.value
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
      await settingsStore.invalidateCacheAndFetch()

      success.value = true
      setTimeout(() => {
        success.value = false
      }, 3000)
    }
  } catch (error) {
    toast.danger(error)
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
            {{ $t('Binary Trading') }}
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            {{ $t('General settings for your site binary trading') }}
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
            label="Feature Status"
            sublabel="Enable or disable features"
          >
            <div class="grid grid-cols-12 gap-4 pt-2">
              <!-- <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="binary_trading"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Please select an option"
                    label="Binary Trading"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div> -->
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="binary_trading_practice"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Please select an option"
                    label="Practice"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="Percentage" sublabel="Set the percentage">
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="binary_trading_profit_percentage"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="number"
                    icon="mdi:percent-outline"
                    placeholder="Profit Percentage"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    label="Profit Percentage"
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
</template>
