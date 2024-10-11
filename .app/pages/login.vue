<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  title: 'Login',
})

import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const { login, loginOtp, resendOtp } = useAuth()
const router = useRouter()
const userStore = useUserStore()
const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)

onMounted(async () => {
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }
})

const showTwoFactorForm = ref(false)
const twoFactorType = ref(null)
const otp = ref('')
const uuid = ref(null)
const secret = ref(null)
const isVerifying = ref(false)

const { toast } = useUtils()

const VALIDATION_TEXT = {
  EMAIL_REQUIRED: 'A valid email is required',
  PASSWORD_REQUIRED: 'A password is required',
}

const zodSchema = z.object({
  email: z.string().email(VALIDATION_TEXT.EMAIL_REQUIRED),
  password: z.string().min(1, VALIDATION_TEXT.PASSWORD_REQUIRED),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  email: '',
  password: '',
}))

const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues,
})

const onSubmit = handleSubmit(async (values: any) => {
  try {
    const response = await login(values)
    toast.response(response)
    if (response.status === 'success') {
      if (response.data?.result?.twofactor?.enabled) {
        showTwoFactorForm.value = true
        twoFactorType.value = response.data.result.twofactor.type
        uuid.value = response.data.result.uuid
        secret.value = response.data.result.twofactor.secret
      } else {
        await userStore.fetchProfile()
        router.push('/user')
      }
    }
  } catch (error) {
    toast.danger(error)
  }
})

const resend = async () => {
  isVerifying.value = true
  try {
    otp.value = ''
    const response = await resendOtp(uuid.value, secret.value)
    toast.response(response)
  } catch (error) {
    toast.danger(error)
  }
  isVerifying.value = false
}

watch(
  () => otp.value,
  async (newOtp) => {
    if (newOtp.length === 6) {
      isVerifying.value = true
      try {
        const response = await loginOtp(uuid.value, newOtp)
        toast.response(response)
        if (response.status === 'success') {
          await userStore.fetchProfile()
          router.push('/user')
        }
      } catch (error) {
        toast.danger(error)
      }
      isVerifying.value = false
    }
  },
)
</script>

<template>
  <div class="dark:bg-muted-800 flex min-h-screen bg-white">
    <div
      class="bg-muted-100 dark:bg-muted-900 relative hidden w-0 flex-1 items-center justify-center lg:flex lg:w-3/5"
    >
      <div
        class="mx-auto w-full h-full flex items-center justify-center max-w-4xl"
      >
        <LottieMining classes="max-w-3xl mx-auto" />
      </div>
    </div>
    <div
      class="relative flex flex-1 flex-col justify-center px-6 py-12 lg:w-2/5 lg:flex-none"
    >
      <div class="dark:bg-muted-800 relative mx-auto w-full max-w-sm bg-white">
        <!--Nav-->
        <div class="flex w-full items-center justify-between">
          <NuxtLink
            to="/"
            class="text-muted-400 hover:text-primary-500 flex items-center gap-2 font-sans font-medium transition-colors duration-300"
          >
            <Icon name="gg:arrow-long-left" class="h-5 w-5" />
            <span>{{ $t('Back to Home') }}</span>
          </NuxtLink>
          <!--Theme button-->
          <BaseThemeToggle />
        </div>
        <div>
          <BaseHeading
            as="h2"
            :size="showTwoFactorForm ? 'xl' : '3xl'"
            lead="relaxed"
            weight="medium"
            class="mt-6"
          >
            {{
              showTwoFactorForm
                ? $t('Two Factor Authentication')
                : $t('Welcome Back')
            }}
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 mb-6">
            {{
              showTwoFactorForm
                ? twoFactorType === 'SMS'
                  ? $t('Please enter the OTP sent to your phone number')
                  : $t('Please enter the OTP from your authenticator app')
                : $t('Please sign in to your account')
            }}
          </BaseParagraph>

          <!-- MetaMask Connection Section -->
          <template v-if="!showTwoFactorForm && extensions['wallet_connect']">
            <WalletLogin />
            <div class="flex-100 mt-8 flex items-center">
              <hr
                class="border-muted-200 dark:border-muted-700 flex-auto border-t-2"
              />
              <span class="text-muted-400 px-4 font-sans font-light"> OR </span>
              <hr
                class="border-muted-200 dark:border-muted-700 flex-auto border-t-2"
              />
            </div>
          </template>
        </div>

        <!--Form section-->
        <div class="mt-6">
          <div class="mt-5" v-if="!showTwoFactorForm">
            <!--Form-->

            <div class="space-y-4">
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="email"
              >
                <BaseInput
                  :model-value="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="email"
                  label="Email address"
                  placeholder="Email address"
                  shape="curved"
                  :classes="{
                    input: 'h-12',
                  }"
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
                  label="Password"
                  placeholder="Password"
                  shape="curved"
                  :classes="{
                    input: 'h-12',
                  }"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </div>

            <!--Remember-->
            <div class="mt-6 flex items-center justify-between">
              <Field
                v-slot="{ field, handleChange, handleBlur }"
                name="trustDevice"
              >
                <BaseCheckbox
                  :model-value="field.value"
                  :disabled="isSubmitting"
                  shape="curved"
                  label="Trust for 14 days"
                  color="primary"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>

              <div class="text-xs leading-5">
                <NuxtLink
                  to="/forgot-password"
                  class="text-primary-600 hover:text-primary-500 font-sans font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline"
                >
                  Forgot your password?
                </NuxtLink>
              </div>
            </div>

            <!--Submit-->
            <div class="mt-6">
              <div class="block w-full rounded-md shadow-sm">
                <BaseButton
                  :disabled="isSubmitting"
                  :loading="isSubmitting"
                  type="button"
                  @click="onSubmit"
                  color="primary"
                  shape="curved"
                  class="!h-11 w-full"
                >
                  <Icon
                    name="material-symbols:alternate-email-rounded"
                    class="w-4 h-4 mr-2"
                  />
                  {{ $t('Sign in With Email') }}
                </BaseButton>
              </div>
            </div>

            <!--No account link-->
            <p
              class="text-muted-400 mt-4 flex justify-between font-sans text-xs leading-5"
            >
              <span>{{ $t("Don't have an account") }}?</span>
              <NuxtLink
                to="/register"
                class="text-primary-600 hover:text-primary-500 font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline"
              >
                {{ $t('Register new account') }}!
              </NuxtLink>
            </p>
          </div>
          <div class="mt-5" v-else>
            <BaseInput
              v-model="otp"
              label="Enter OTP"
              placeholder="Enter OTP"
              shape="curved"
              maxlength="6"
              :disabled="isVerifying"
              :classes="{ input: 'h-12' }"
            />
            <div
              class="mt-8 flex items-center justify-between"
              v-if="twoFactorType === 'SMS'"
            >
              <BaseText size="sm" class="text-muted-400"
                >{{ $t("Didn't receive the code") }}?</BaseText
              >
              <button
                type="button"
                :disabled="isVerifying"
                @click="resend"
                class="font-sans text-sm underline-offset-4 hover:underline"
                :class="{
                  'cursor-not-allowed text-muted-500': isVerifying,
                  'text-primary-500 hover:text-primary-600': !isVerifying,
                }"
              >
                {{ $t('Send it again') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
