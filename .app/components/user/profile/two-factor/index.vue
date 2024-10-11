<script setup lang="ts">
import type { User } from '~~/types'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const { generateOTPSecret, verifyOTP, saveOTP, toggleOtp } = useAuth()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const smsOtpStatus = ref(settings.value?.sms_otp || false)

const loading = ref(false)
const twoFaMode = ref(smsOtpStatus.value ? 'SMS' : 'APP')
const currentStep = ref(1)
const codeLength = ref(4)
const input = ref<number[]>([])
const inputElements = ref<any[]>([])
const correctPin = ref()
const onlyCheckOnLastFieldInput = ref(true)
const qrCodeUrl = ref('')
const otpSecret = ref('')

const tel = ref('')
const otpCode = ref('')
const router = useRouter()
const { toast } = useUtils()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile as User)
const email = ref(user.value?.email as string)

const changeTwoFaMode = ref(user.value?.twofactor ? false : true)

async function toggleOtpAction(status: boolean) {
  loading.value = true
  try {
    const response = await toggleOtp(status)
    toast.response(response)
    userStore.fetchProfile()
  } catch (error) {
    toast.danger(error as any)
  }
  loading.value = false
}

async function goToStep(n: number) {
  loading.value = true
  if (n === 2 && twoFaMode.value === 'APP') {
    // Make a request to the server to generate the secret
    const response = await generateOTPSecret(
      twoFaMode.value,
      user.value?.email as string,
    )

    if (response.status === 'fail') {
      toast.danger(response)
      loading.value = false
      return
    }

    qrCodeUrl.value = response.data.result.qrCode
    otpSecret.value = response.data.result.secret
    codeLength.value = 6
  } else {
    codeLength.value = 4
  }
  if (n === 3 && twoFaMode.value === 'APP') {
    // Make a request to the server to verify the OTP
    try {
      const response = await verifyOTP(otpCode.value, otpSecret.value, 'APP')
      if (response.status === 'fail') {
        toast.danger(response)
        loading.value = false
        return
      }
      toast.response(response)

      const otpResponse = await saveOTP(
        otpSecret.value as string,
        twoFaMode.value as string,
      )

      if (otpResponse.status === 'fail') {
        toast.danger(otpResponse)
        loading.value = false
        return
      }

      userStore.fetchProfile()
      setTimeout(() => {
        router.push(
          props.flutter ? '/flutter/two-factor' : '/user/profile-edit',
        )
      }, 1000)
    } catch (error) {
      loading.value = false
      toast.danger(error as any)
    }
  } else if (n === 3 && twoFaMode.value === 'SMS') {
    // Make a request to the server to send the OTP via SMS
    const response = await generateOTPSecret(
      twoFaMode.value,
      user.value?.email as string,
      tel.value as string,
    )

    if (response.status === 'fail') {
      toast.danger(response)
      loading.value = false
      return
    }
    otpSecret.value = response.data.result.secret

    // The OTP is sent via SMS, so there is no QR code or secret to set
    codeLength.value = 6
  }
  const timer = setTimeout(() => {
    loading.value = false
    if (n < 1) {
      currentStep.value = 1
    } else if (n > 3) {
      currentStep.value = 3
    } else {
      currentStep.value = n
    }
    clearTimeout(timer)
  }, 1000)
}

const resend = async () => {
  // Make a request to the server to send the OTP via SMS
  const response = await generateOTPSecret(
    twoFaMode.value,
    user.value?.email as string,
    tel.value as string,
  )

  if (response.status === 'fail') {
    toast.danger(response)
    return
  }
  otpSecret.value = response.data.result.secret
  toast.response(response)
}

function paste(event: any) {
  // raw pasted input
  let pasted = event.clipboardData.getData('text')
  // only get numbers
  pasted = pasted.replace(/\D/g, '')
  // don't get more than the PIN codeLength
  pasted = pasted.substring(0, codeLength.value)
  // if after all that sanitazation the string is not empty
  if (pasted) {
    // split the pasted string into an array and load it
    input.value = pasted.split('')
    // check if the PIN is correct
    return validatePin.value
  }
}
function type(event: any, index: any) {
  if (event.ctrlKey && event.key == 'v') {
    console.log('ctrl-v')
  } else if (event.keyCode == 8) {
    event.stopPropagation()
    event.preventDefault()
    input.value[index - 1] = 0
  } else {
    // only allow numbers
    let key = event.key.replace(/\D/g, '')
    if (key != '') {
      console.log(key)
      input.value.splice(index - 1, 1, key)
    }
  }
  // check if the PIN is correct
  if (
    (onlyCheckOnLastFieldInput.value && index == codeLength.value) ||
    !onlyCheckOnLastFieldInput.value
  ) {
    return validatePin.value
  }
  // go to the next field
  // must happen on nextTick cause the field can be disabled.
  nextTick(() => {
    goto(index + 1)
  })
}

function goto(n: any) {
  if (!n || n > codeLength.value) {
    n = 1
  }
  inputElements.value[n].focus()
}

const validatePin = computed(() => {
  return input.value.join('') == correctPin.value
})

watch(input.value, (newVal) => {
  if (newVal.length === codeLength.value) {
    // call the function you want to trigger here
    checkOTP()
  }
})

async function checkOTP() {
  const fullOTPCode = input.value.join('')
  if (twoFaMode.value === 'SMS') {
    // Make a request to the server to verify the OTP
    try {
      const response = await verifyOTP(fullOTPCode, otpSecret.value, 'SMS')
      if (response.status === 'fail') {
        toast.danger(response)
        return
      }
      toast.response(response)

      userStore.fetchProfile()

      setTimeout(() => {
        router.push(
          props.flutter ? '/flutter/two-factor' : '/user/profile-edit',
        )
      }, 1000)
    } catch (error) {
      toast.danger(error as any)
    }
  }
}

function changeMethod() {
  changeTwoFaMode.value = true
  currentStep.value = 1
}
</script>

<template>
  <div class="bg-muted-100 dark:bg-muted-900 min-h-screen">
    <form
      action=""
      method="POST"
      @submit.prevent
      class="mx-auto max-w-7xl px-4"
    >
      <template v-if="user?.twofactor?.type && !changeTwoFaMode">
        <div class="pt-8 text-center">
          <BaseHeading tag="h2" size="3xl" weight="medium" class="mb-2">
            {{ $t('Congratulations') }} 🎉
          </BaseHeading>
          <BaseParagraph class="text-muted-500 dark:text-muted-400 mb-8">
            {{
              $t('Your account is now secured with 2 factor authentication')
            }}!
          </BaseParagraph>
        </div>
        <div class="mx-auto mb-8 grid max-w-[250px]">
          <!-- <UserProfileTwoFactorOTPMethodCard
            v-if="user?.twofactor?.type === 'EMAIL'"
            class="!border-primary-500 relative border-2 p-8 grayscale-0 !opacity-100 [&_.child]:!opacity-100"
            image="/img/illustrations/onboarding/2fa-web.svg"
            alt="2 factor authentication with email"
            title="With Email"
            description="You will receive a verification code on your email address when you login"
          >
            <div class="child absolute end-2 top-3 opacity-0">
              <Icon
                name="ph:check-circle-duotone"
                class="text-primary-500 h-7 w-7"
              />
            </div>
          </UserProfileTwoFactorOTPMethodCard> -->
          <UserProfileTwoFactorOTPMethodCard
            class="group relative border-2 p-8 !opacity-100 [&_.child]:!opacity-100 cursor-pointer"
            :image="user?.twofactor?.type?.toLowerCase()"
            :alt="`2 factor authentication with ${user?.twofactor?.type}`"
            :title="
              user?.twofactor?.type === 'SMS'
                ? 'With SMS'
                : 'Authentication App'
            "
            description="You will receive a verification code on your mobile phone when you login"
            @click="toggleOtpAction(user?.twofactor?.enabled ? false : true)"
            :class="{
              '!border-success-500 hover:!border-danger-500 grayscale-0':
                user?.twofactor?.enabled,
              '!border-danger-500 hover:!border-success-500 grayscale':
                !user?.twofactor?.enabled,
            }"
          >
            <div class="child absolute end-2 top-3 opacity-0">
              <Icon
                :name="
                  user?.twofactor?.enabled
                    ? 'ph:check-circle-duotone'
                    : 'ph:x-circle-duotone'
                "
                class="h-7 w-7"
                :class="{
                  'text-success-500 group-hover:text-danger-500':
                    user?.twofactor?.enabled,
                  'text-danger-500 group-hover:text-success-500':
                    !user?.twofactor?.enabled,
                }"
              />
            </div>
          </UserProfileTwoFactorOTPMethodCard>
        </div>
        <div class="mx-auto flex flex-col items-center mt-5">
          <BaseButton
            v-if="smsOtpStatus"
            type="button"
            shape="curved"
            class="!h-12 w-48"
            color="muted"
            @click="changeMethod()"
            >{{ $t('Change Method') }}</BaseButton
          >
        </div>
      </template>
      <template v-else>
        <div v-if="currentStep === 1">
          <div class="pt-8 text-center">
            <BaseHeading tag="h2" size="3xl" weight="medium" class="mb-2">
              {{ $t('Well done') }} 👋
            </BaseHeading>
            <BaseParagraph class="text-muted-500 dark:text-muted-400 mb-8">
              {{ $t('You are one step away from securing your account') }}!
            </BaseParagraph>
          </div>

          <div>
            <div class="w-full">
              <div class="mx-auto w-full">
                <div class="w-full">
                  <div
                    class="mx-auto mb-8 grid gap-6 xs:grid-cols-1 md:grid-cols-2 max-w-2xl"
                    :class="{
                      'lg:grid-cols-3': !changeTwoFaMode,
                      'max-w-lg': changeTwoFaMode,
                    }"
                  >
                    <!-- <UserProfileTwoFactorOTPMethodRadio
                      :modelValue="twoFaMode"
                      @update:modelValue="(val) => (twoFaMode = val)"
                      v-if="
                        (user?.twofactor?.enabled &&
                          user?.twofactor?.type !== 'EMAIL') ||
                        !user?.twofactor
                      "
                      name="radio_custom"
                      value="Email_Address"
                    >
                      <UserProfileTwoFactorOTPMethodCard
                        image="/img/illustrations/onboarding/2fa-web.svg"
                        alt="2 factor authentication with email"
                        title="With Email"
                        description="We will send you a confirmation code to your email address"
                      />
                    </UserProfileTwoFactorOTPMethodRadio> -->

                    <UserProfileTwoFactorOTPMethodRadio
                      v-if="
                        (user?.twofactor?.type !== 'SMS' || !user?.twofactor) &&
                        smsOtpStatus
                      "
                      :modelValue="twoFaMode"
                      @update:modelValue="(val) => (twoFaMode = val)"
                      name="radio_custom"
                      value="SMS"
                    >
                      <UserProfileTwoFactorOTPMethodCard
                        image="sms"
                        alt="2 factor authentication with SMS"
                        title="With SMS"
                        description="We will send you an SMS with the code on your mobile phone"
                      />
                    </UserProfileTwoFactorOTPMethodRadio>

                    <UserProfileTwoFactorOTPMethodRadio
                      v-if="user?.twofactor?.type !== 'APP' || !user?.twofactor"
                      :modelValue="twoFaMode"
                      @update:modelValue="(val) => (twoFaMode = val)"
                      name="radio_custom"
                      value="APP"
                    >
                      <UserProfileTwoFactorOTPMethodCard
                        image="app"
                        alt="2 factor authentication with app"
                        title="With an App"
                        description="We will send you the code on your authenticator app"
                      />
                    </UserProfileTwoFactorOTPMethodRadio>
                  </div>
                  <div class="mx-auto flex flex-col items-center">
                    <BaseButton
                      type="button"
                      shape="curved"
                      class="!h-12 w-48"
                      color="primary"
                      :loading="loading"
                      @click="goToStep(2)"
                      >Continue</BaseButton
                    >
                    <NuxtLink
                      v-if="!changeTwoFaMode"
                      :to="
                        props.flutter
                          ? '/flutter/two-factor'
                          : '/user/profile-edit'
                      "
                      class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
                      >{{ $t('No thanks, I want to skip') }}</NuxtLink
                    >
                    <button
                      type="button"
                      v-else-if="changeTwoFaMode && user?.twofactor"
                      @click="changeTwoFaMode = false"
                      class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
                    >
                      {{ $t('No thanks, I dont want to change') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="currentStep === 2" class="w-full">
          <div class="flex h-full w-full flex-col">
            <div
              class="pointer-events-none flex w-full items-center justify-center pt-8"
            >
              <BaseIconBox
                color="primary"
                size="lg"
                shape="full"
                class="mx-auto"
              >
                <Icon
                  v-if="twoFaMode === 'Email_Address'"
                  name="ph:envelope-duotone"
                  class="text-primary-500 mx-auto h-8 w-8"
                />
                <Icon
                  v-else-if="twoFaMode === 'SMS'"
                  name="ph:device-mobile-speaker-duotone"
                  class="text-primary-500 mx-auto h-8 w-8"
                />
                <Icon
                  v-else-if="twoFaMode === 'APP'"
                  name="ph:fingerprint-duotone"
                  class="text-primary-500 mx-auto h-8 w-8"
                />
              </BaseIconBox>
            </div>
            <div class="pt-4 text-center">
              <BaseHeading tag="h2" size="3xl" weight="medium" class="mb-1">
                {{ $t('Enter your') }}
                {{
                  twoFaMode !== 'SMS'
                    ? twoFaMode.split('_').join(' ')
                    : 'Phone Number'
                }}
              </BaseHeading>
              <BaseParagraph class="text-muted-500 dark:text-muted-400">
                {{ $t('Enter the required information to continue') }}
              </BaseParagraph>
            </div>

            <div class="mx-auto w-full max-w-sm py-6">
              <BaseInput
                v-if="twoFaMode === 'Email_Address'"
                v-model="email"
                icon="ph:envelope-duotone"
                shape="curved"
                type="email"
                disabled
                autocomplete="email"
                placeholder="Ex: johndoe@gmail.com"
                :classes="{
                  wrapper: 'w-full',
                  input: '!h-12 !ps-12',
                  icon: '!h-12 !w-12',
                }"
              />
              <BaseInput
                v-else-if="twoFaMode === 'SMS'"
                v-model="tel"
                icon="ph:device-mobile-speaker-duotone"
                shape="curved"
                placeholder="Ex: +15554815659"
                type="tel"
                autocomplete="tel"
                :classes="{
                  wrapper: 'w-full',
                  input: '!h-12 !ps-12',
                  icon: '!h-12 !w-12',
                }"
              />
              <div
                v-else-if="twoFaMode === 'APP' && qrCodeUrl"
                class="space-y-4"
              >
                <div class="flex items-center gap-2">
                  <img
                    :src="qrCodeUrl"
                    alt="Scan this QR code with your Authentication app"
                  />
                  <div>
                    <BaseText
                      size="sm"
                      class="text-muted-500 dark:text-muted-400"
                      >{{
                        $t(
                          'Scan the QR code with your Authentication app and enter the OTP below',
                        )
                      }}</BaseText
                    >
                  </div>
                </div>
                <BaseInput
                  v-model="otpCode"
                  icon="ph:fingerprint-duotone"
                  shape="curved"
                  placeholder="Enter OTP"
                  :classes="{
                    wrapper: 'w-full',
                    input: '!h-12 !ps-12',
                    icon: '!h-12 !w-12',
                  }"
                />
              </div>
            </div>
            <div class="mx-auto flex flex-col items-center">
              <BaseButton
                type="button"
                shape="curved"
                class="!h-12 w-48"
                color="primary"
                :loading="loading"
                @click="goToStep(3)"
                >{{ $t('Continue') }}</BaseButton
              >
              <button
                type="button"
                class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
                @click="goToStep(1)"
              >
                {{ $t('I want to change, take me back') }}
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="currentStep === 3 && twoFaMode !== 'APP'">
          <div class="mx-auto max-w-4xl">
            <div class="flex h-full w-full flex-col">
              <div
                class="pointer-events-none flex w-full items-center justify-center pt-8"
              >
                <div class="flex h-16 items-center justify-center">
                  <TairoCheckAnimated v-if="validatePin" size="sm" />
                  <BaseIconBox
                    v-else
                    color="primary"
                    size="lg"
                    shape="full"
                    class="mx-auto"
                  >
                    <Icon
                      name="ph:lock-duotone"
                      class="text-primary-500 mx-auto h-8 w-8"
                    />
                  </BaseIconBox>
                </div>
              </div>
              <div class="pt-4 text-center">
                <BaseHeading tag="h2" size="3xl" weight="medium" class="mb-1">
                  {{ $t('Enter your code') }}
                </BaseHeading>
                <BaseParagraph class="text-muted-500 dark:text-muted-400 mb-2">
                  {{ $t("Enter the pin code we've just sent you") }}
                </BaseParagraph>
                <BaseText
                  size="xs"
                  lead="snug"
                  class="text-muted-500 dark:text-muted-400 mb-8"
                >
                  <span class="block">
                    <span class="font-bold">1234</span> {{ $t('is the demo') }}
                    PIN.
                  </span>
                </BaseText>
              </div>
              <div
                class="text-muted-800 dark:text-muted-100 mx-auto flex h-60 w-72 flex-col rounded text-center"
              >
                <div
                  class="flex w-full justify-center gap-3"
                  :class="validatePin && 'pointer-events-none'"
                >
                  <input
                    type="text"
                    :name="'pin' + i"
                    v-for="i in codeLength"
                    :key="'pin' + i"
                    maxlength="1"
                    class="dark:bg-muted-800 unselectable nui-focus inline w-16 select-none rounded-lg bg-white py-5 text-center text-4xl font-bold transition-all"
                    @paste.prevent="paste($event)"
                    @keydown.exact="type($event, i)"
                    @keydown.ctrl.a.prevent
                    @mousemove.prevent.stop
                    @keydown.arrow-right.prevent="goto(i + 1)"
                    @keydown.arrow-left.prevent="goto(i - 1)"
                    :value="input[i - 1] != null ? input[i - 1] : 0"
                    :ref="
                      (el) => {
                        inputElements[i] = el
                      }
                    "
                    placeholder="0"
                    :disabled="input.length < i - 1 || validatePin"
                    :autofocus="i == 1"
                  />
                </div>

                <div class="mt-10">
                  <NuxtLink to="/user">
                    <BaseButton
                      shape="curved"
                      class="!h-12"
                      :color="validatePin ? 'primary' : 'default'"
                      :disabled="!validatePin"
                      >{{ $t('Verify') }}</BaseButton
                    >
                  </NuxtLink>
                  <div class="mt-8 flex items-center justify-between">
                    <BaseText size="sm" class="text-muted-400"
                      >{{ $t("Didn't receive the code") }}?</BaseText
                    >
                    <button
                      type="button"
                      @click="resend"
                      class="text-primary-500 font-sans text-sm underline-offset-4 hover:underline"
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
    </form>
  </div>
</template>
