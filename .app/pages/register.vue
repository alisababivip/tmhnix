<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  title: 'Register',
})
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import type { User } from '~~/types'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

onMounted(async () => {
  if (settingsStore.settings?.length === 0) {
    await settingsStore.fetchSettings()
  }
})

const { register } = useAuth()
const { toast } = useUtils()
const route = useRoute()
const { ref } = route.query

const VALIDATION_TEXT = {
  EMAIL_REQUIRED: 'A valid email is required',
  USERNAME_LENGTH: 'Username must be at least 3 characters',
  FIRSTNAME_REQUIRED: 'First name is required',
  LASTNAME_REQUIRED: 'Last name is required',
  FIRSTNAME_LENGTH: 'First name must be at least 3 characters',
  LASTNAME_LENGTH: 'Last name must be at least 3 characters',
  PASSWORD_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_CONTAINS_EMAIL: 'Password cannot contain your email',
  PASSWORD_MATCH: 'Passwords do not match',
  ACCEPT_TERMS: 'You must accept the terms and conditions',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    first_name: z.string().min(3, VALIDATION_TEXT.FIRSTNAME_LENGTH),
    last_name: z.string().min(3, VALIDATION_TEXT.LASTNAME_LENGTH),
    email: z.string().email(VALIDATION_TEXT.EMAIL_REQUIRED),
    password: z.string().min(8, VALIDATION_TEXT.PASSWORD_LENGTH),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val, {
      message: VALIDATION_TEXT.ACCEPT_TERMS,
    }),
  })
  .superRefine((data, ctx) => {
    // This is a custom validation function that will be called
    // before the form is submitted
    if (data.password.includes(data.email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.PASSWORD_CONTAINS_EMAIL,
        path: ['password'],
      })
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.PASSWORD_MATCH,
        path: ['confirmPassword'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}))

const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema,
  initialValues,
})

// This is where you would send the form data to the server
const onSubmit = handleSubmit(async (values) => {
  const { first_name, last_name, email, password } = values

  try {
    const response = await register(first_name, last_name, email, password, ref)

    if (response.status === 'success') {
      toast.successText('Your account has been created successfully')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      toast.danger(response)
    }
  } catch (error) {
    toast.danger(error as any)
  }

  // If successful, show success message, wait, then navigate to login page
})
</script>

<template>
  <div class="h-screen md:flex">
    <div
      class="from-primary-900 to-primary-500 i group relative hidden w-1/2 items-center justify-around overflow-hidden bg-gradient-to-tr md:flex"
    >
      <div class="mx-auto max-w-xs text-center">
        <BaseHeading as="h2" size="3xl" weight="medium" class="text-white">
          {{ $t('Have an Account') }}?
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-200 mb-3">
          {{
            $t(
              "No need to waste time on this page, let's take you back to your account",
            )
          }}
        </BaseParagraph>
        <BaseButton to="/login" shape="curved" class="w-full">{{
          $t('Login to Account')
        }}</BaseButton>
      </div>
      <div
        class="bg-muted-200/20 absolute -start-6 -top-6 h-14 w-0 origin-top-left rotate-45 rounded-full transition-all delay-[25ms] duration-300 group-hover:w-72"
      ></div>
      <div
        class="bg-muted-200/20 absolute -top-12 start-20 h-14 w-0 origin-top-left rotate-45 rounded-full transition-all delay-75 duration-300 group-hover:w-48"
      ></div>
      <div
        class="bg-muted-200/20 absolute -start-7 top-24 h-14 w-0 origin-top-left rotate-45 rounded-full transition-all delay-150 duration-300 group-hover:w-40"
      ></div>

      <div
        class="bg-muted-200/20 absolute -bottom-6 -end-6 h-14 w-0 origin-bottom-right rotate-45 rounded-full transition-all delay-150 duration-300 group-hover:w-72"
      ></div>
      <div
        class="bg-muted-200/20 absolute -bottom-12 end-20 h-14 w-0 origin-bottom-right rotate-45 rounded-full transition-all delay-75 duration-300 group-hover:w-48"
      ></div>
      <div
        class="bg-muted-200/20 absolute -end-7 bottom-24 h-14 w-0 origin-bottom-right rotate-45 rounded-full transition-all delay-[25ms] duration-300 group-hover:w-40"
      ></div>
    </div>
    <div
      class="dark:bg-muted-900 flex flex-col items-center justify-between bg-white py-10 md:w-1/2"
    >
      <div class="mx-auto flex w-full max-w-xs items-center justify-between">
        <NuxtLink
          to="/user"
          class="text-muted-400 hover:text-primary-500 dark:text-muted-700 dark:hover:text-primary-500 transition-colors duration-300"
        >
          <Logo class="h-10 w-10" />
        </NuxtLink>
        <div>
          <BaseThemeToggle />
        </div>
      </div>
      <form
        method="POST"
        action=""
        @submit.prevent="onSubmit"
        class="mx-auto w-full max-w-xs"
        novalidate
      >
        <BaseHeading as="h2" size="3xl" weight="medium">
          {{ $t('Welcome to') }} {{ settings?.site_name }}
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400 mb-6">
          {{ $t("Let's start by creating you account") }}
        </BaseParagraph>

        <div class="mb-4 space-y-3">
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="first_name"
          >
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              shape="curved"
              placeholder="First name"
              icon="ph:fingerprint-duotone"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="last_name"
          >
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              shape="curved"
              placeholder="Last name"
              icon="ph:fingerprint-duotone"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="email"
          >
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="email"
              shape="curved"
              placeholder="Email Address"
              icon="ph:at-duotone"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="password"
          >
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="password"
              shape="curved"
              placeholder="Password"
              icon="ph:lock-duotone"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />

            <PasswordStrength
              v-if="field.value != ''"
              class="mt-1"
              :value="field.value"
              :min-length="8"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="confirmPassword"
          >
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="password"
              shape="curved"
              placeholder="Confirm password"
              icon="ph:check"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="acceptTerms"
          >
            <BaseCheckbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              shape="curved"
              @update:model-value="handleChange"
              @blur="handleBlur"
            >
              <span class="text-muted-400">
                {{ $t('I accept the') }}
                <NuxtLink
                  to="/page/terms"
                  class="text-primary-600 hover:text-primary-500 font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline focus:underline focus:outline-none"
                >
                  {{ $t('Terms and Conditions') }}
                </NuxtLink>
              </span>
            </BaseCheckbox>
          </Field>
        </div>
        <BaseButton
          :disabled="isSubmitting"
          :loading="isSubmitting"
          type="submit"
          shape="curved"
          color="primary"
          class="!h-11 w-full"
        >
          {{ $t('Create Account') }}
        </BaseButton>
        <!--No account link-->
        <p
          class="text-muted-400 mt-4 flex justify-between font-sans text-sm leading-5"
        >
          <span>{{ $t('Have an account') }}?</span>
          <NuxtLink
            to="/login"
            class="text-primary-600 hover:text-primary-500 font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline focus:underline focus:outline-none"
          >
            {{ $t('Login here') }}
          </NuxtLink>
        </p>
      </form>
      <div class="text-center">
        <BaseText size="sm" class="text-muted-400">
          © {{ new Date().getFullYear() }} {{ settings?.site_name }}.
          {{ $t('All rights reserved') }}.
        </BaseText>
      </div>
    </div>
  </div>
</template>
