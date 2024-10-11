<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'General Settings',
  permissions: ['Access General Settings'],
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  site_name: z.string().min(1, 'Please enter a site name'),
  site_email: z.string().email('Please enter a valid email'),
  site_description: z.string(),
  site_maintenance: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  frontend: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  spot_exchange: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  binary_trading: z.object({
    label: z.string(),
    value: z.boolean(),
  }),
  email_verification: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  two_factor: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  sms_otp: z.object({
    label: z.string(),
    value: z.boolean(),
  }),
  frontend_type: z.string(),
  blog: z
    .object({
      label: z.string(),
      value: z.boolean(),
    })
    .nullable(),
  social_links: z.object({
    facebook: z.string().url().or(z.literal('')),
    twitter: z.string().url().or(z.literal('')),
    instagram: z.string().url().or(z.literal('')),
    linkedin: z.string().url().or(z.literal('')),
    youtube: z.string().url().or(z.literal('')),
  }),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => {
  let site_maintenance = {
    label: settings.value.site_maintenance ? 'Enabled' : 'Disabled',
    value: settings.value.site_maintenance ? true : false,
  }

  let spot_exchange = {
    label: settings.value.spot_exchange ? 'Enabled' : 'Disabled',
    value: settings.value.spot_exchange ? true : false,
  }

  let frontend = {
    label: settings.value.frontend ? 'Enabled' : 'Disabled',
    value: settings.value.frontend ? true : false,
  }

  let binary_trading = {
    label: settings.value.binary_trading ? 'Enabled' : 'Disabled',
    value: settings.value.binary_trading ? true : false,
  }

  let email_verification = {
    label: settings.value.email_verification ? 'Enabled' : 'Disabled',
    value: settings.value.email_verification ? true : false,
  }

  let sms_otp = {
    label: settings.value.sms_otp ? 'Enabled' : 'Disabled',
    value: settings.value.sms_otp ? true : false,
  }

  let two_factor = {
    label: settings.value.two_factor ? 'Enabled' : 'Disabled',
    value: settings.value.two_factor ? true : false,
  }
  let blog = {
    label: settings.value.blog ? 'Enabled' : 'Disabled',
    value: settings.value.blog ? true : false,
  }
  return {
    site_name: settings.value.site_name || '',
    site_email: settings.value.site_email || '',
    site_description: settings.value.site_description || '',
    site_maintenance,
    spot_exchange,
    frontend,
    frontend_type: settings.value.frontend_type || 'Basic',
    binary_trading,
    email_verification,
    sms_otp,
    two_factor,
    blog,
    social_links: {
      facebook: settings.value.social_links?.facebook || '',
      twitter: settings.value.social_links?.twitter || '',
      instagram: settings.value.social_links?.instagram || '',
      linkedin: settings.value.social_links?.linkedin || '',
      youtube: settings.value.social_links?.youtube || '',
    },
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
  if (values.site_maintenance) {
    values.site_maintenance = values.site_maintenance.value
  }
  if (values.spot_exchange) {
    values.spot_exchange = values.spot_exchange.value
  }
  if (values.frontend) {
    values.frontend = values.frontend.value
  }

  if (values.binary_trading) {
    values.binary_trading = values.binary_trading.value
  }

  if (values.email_verification) {
    values.email_verification = values.email_verification.value
  }

  if (values.sms_otp) {
    values.sms_otp = values.sms_otp.value
  }

  if (values.two_factor) {
    values.two_factor = values.two_factor.value
  }

  if (values.blog) {
    values.blog = values.blog.value
  }
  values.social_links = JSON.stringify(values.social_links)
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
            label="Basic Info"
            sublabel="This is how others will recognize you"
          >
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="site_name"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="dashicons:admin-site-alt2"
                    placeholder="Site name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    label="Site name"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="site_email"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="material-symbols:alternate-email"
                    placeholder="Site Email"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    label="Site Email"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="site_description"
                >
                  <BaseTextarea
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    rows="4"
                    placeholder="It's considered a standard SEO best practice to keep site description at around 160-165 characters maximum"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    label="Site Description"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <TairoFormGroup
            label="Social Links"
            sublabel="Please enter your social links, leave empty if you don't want to show them, they will be shown in the footer, make sure to add the full url"
          >
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="social_links.facebook"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="dashicons:facebook-alt"
                    placeholder="Facebook"
                    label="Facebook"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="social_links.twitter"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="dashicons:twitter"
                    placeholder="Twitter"
                    label="Twitter"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="social_links.instagram"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="dashicons:instagram"
                    placeholder="Instagram"
                    label="Instagram"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="social_links.linkedin"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="dashicons:linkedin"
                    placeholder="Linkedin"
                    label="Linkedin"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="social_links.youtube"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="dashicons:youtube"
                    placeholder="Youtube"
                    label="Youtube"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <TairoFormGroup label="Access" sublabel="Your access settings">
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="site_maintenance"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Site Maintenance"
                    label="Site Maintenance"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="blog"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Blog"
                    label="Blog"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="frontend"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Frontend"
                    label="Frontend"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="frontend_type"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="['Basic', 'Advanced']"
                    placeholder="Frontend Type"
                    label="Frontend Type"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <TairoFormGroup label="Trading" sublabel="Your trading settings">
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="spot_exchange"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Spot Exchange"
                    label="Spot Exchange"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t(
                        'Disable this option if you want to disable spot trading, binary trading, spot wallets',
                      )
                    }}</span></small
                  >
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
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
                    placeholder="Binary Trading"
                    label="Binary Trading"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t(
                        'Disable this option if you want to disable binary trading, binary wallets',
                      )
                    }}</span></small
                  >
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <TairoFormGroup
            label="Authentication"
            sublabel="Your authentication settings"
          >
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="email_verification"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Email Verification"
                    label="Email Verification"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="two_factor"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="Two Factor"
                    label="Two Factor"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t(
                        'Disable this option if you want to disable two factor authentication',
                      )
                    }}</span></small
                  >
                </Field>
              </div>

              <div
                class="col-span-12 sm:col-span-6"
                v-if="settings?.two_factor"
              >
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="sms_otp"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    placeholder="SMS OTP"
                    label="SMS OTP"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <small
                    ><span class="text-xs text-warning-500">{{
                      $t(
                        'Disable this option if you want to disable sms otp in two factor authentication',
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
