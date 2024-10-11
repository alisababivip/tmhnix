<script setup lang="ts">
import PayPalPayment from '~/components/gateway/PayPalPayment.vue'
import { useDepositMethodStore } from '~~/store/admin/deposit/methods'
import { useDepositGatewayStore } from '~~/store/admin/deposit/gateways'
import type { Wallet } from '~~/types'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const { toast } = useUtils()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const { getWallet, customFiatDepositMethod } = useWallet()
const route = useRoute()
const wallet = ref<Wallet | null>(null)
const config = useRuntimeConfig()

const depositMethodStore = useDepositMethodStore()
const depositGatewayStore = useDepositGatewayStore()
const selectedMethod = ref(null)

const filteredGateways = computed(() => {
  if (!wallet.value) return []

  return depositGatewayStore.gateways.filter((gateway) => {
    return (
      gateway.currencies &&
      gateway.currencies.hasOwnProperty(wallet.value?.currency) &&
      gateway.status
    )
  })
})

onMounted(async () => {
  try {
    const response = await getWallet(route.params.uuid as string)
    wallet.value = response.data.result
  } catch (error) {
    toast.danger(error as any)
  }

  // Fetch custom methods if not already loaded
  if (depositMethodStore.methods.length === 0) {
    await depositMethodStore.fetchDepositMethods()
  }

  if (depositGatewayStore.gateways.length === 0) {
    await depositGatewayStore.fetchDepositGateways()
  }

  const filtered = depositGatewayStore.gateways.filter((gateway) => {
    return (
      gateway.currencies &&
      gateway.currencies.hasOwnProperty(wallet.value?.currency)
    )
  })

  const activeGateway = filtered.find((gateway) => gateway.status)

  if (activeGateway) {
    selectedMethod.value = activeGateway
  } else if (depositMethodStore.methods.length > 0) {
    selectedMethod.value = depositMethodStore.methods[0]
  }
})

const paymentAmount = ref(0)
const fixedFeesRate = computed(() => selectedMethod.value?.fixed_fee ?? 0)
const percentageFeesRate = computed(
  () => selectedMethod.value?.percentage_fee / 100 ?? 0,
)

const feedAmount = computed(() =>
  percentageFeesRate.value > 0 || fixedFeesRate.value > 0
    ? (selectedMethod.value?.alias ? paymentAmount.value : values.amount) *
        (percentageFeesRate.value > 0 ? percentageFeesRate.value : 1) +
      fixedFeesRate.value
    : 0,
)

const totalAmount = computed(
  () =>
    (selectedMethod.value?.alias ? paymentAmount.value : values.amount) +
    feedAmount.value,
)

const amountSchema = z.object({
  amount: z
    .number()
    .min(selectedMethod.value?.min_amount, 'Amount must be greater than 0'),
})

type FormInput = z.infer<typeof amountSchema>
const validationSchema = toTypedSchema(amountSchema)
const initialValues = computed<FormInput>(() => ({
  amount: selectedMethod.value?.min_amount | 0,
}))

const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema,
  initialValues,
})

const customFields = ref({
  inputs: [] as string[],
  textareas: [] as string[],
  files: [] as File[],
  previews: [] as string[],
})

const uploadFile = async (file: File, type: string = 'custom') => {
  const body = new FormData()
  body.append('files', file)
  body.append('type', type)

  // Upload the file
  const uploadResponse = await useFetch('/api/upload', {
    method: 'POST',
    body,
  })

  // Check if the upload was successful and get the URL
  if (uploadResponse && uploadResponse.data.value !== '') {
    return uploadResponse.data.value[0]
  }

  return ''
}

watch(customFields.value.files, async (files) => {
  for (let index = 0; index < files.length; index++) {
    const fileRef = files[index]

    // Check if the fileRef is an object and contains a File object
    if (fileRef && typeof fileRef === 'object' && fileRef[0] instanceof File) {
      const file = fileRef[0] // Extract the File object
      const url = await uploadFile(file)
      customFields.value.previews[index] = url
    }
  }
})

const formattedCustomData = computed(() => {
  const result = []
  selectedMethod.value?.custom_fields?.forEach((field, index) => {
    let value
    if (field.type === 'input') value = customFields.value.inputs[index]
    if (field.type === 'textarea') value = customFields.value.textareas[index]
    if (field.type === 'file upload') value = customFields.value.previews[index]

    result.push({
      type: field.type,
      title: field.title,
      value: value,
    })
  })
  return result
})

const cardInfo = ref({
  name: undefined,
  number: undefined,
  expiryYear: undefined,
  expiryMonth: undefined,
  cvc: undefined,
})

const termsApproval = ref(false)
const router = useRouter()

const handleMethods = handleSubmit(async (values: any) => {
  if (!selectedMethod.value) return
  if (!wallet.value) return
  if (!user.value?.uuid) return
  if (!route.params.uuid) return

  if (selectedMethod.value?.min_amount > values.amount)
    return toast.warning(
      `Minimum deposit amount is ${formatPrice(
        selectedMethod.value.min_amount,
        wallet.value.currency,
      )}`,
    )

  if (selectedMethod.value?.max_amount < values.amount)
    return toast.warning(
      `Maximum deposit amount is ${formatPrice(
        selectedMethod.value?.max_amount,
        wallet.value.currency,
      )}`,
    )

  if (selectedMethod.value?.custom_fields?.length > 0) {
    for (let i = 0; i < selectedMethod.value?.custom_fields?.length; i++) {
      const field = selectedMethod.value?.custom_fields[i]
      if (field.required) {
        if (field.type === 'input') {
          if (!customFields.value.inputs[i]) {
            return toast.warning(`Please fill in the ${field.title} field`)
          }
        }
        if (field.type === 'textarea') {
          if (!customFields.value.textareas[i]) {
            return toast.warning(`Please fill in the ${field.title} field`)
          }
        }
        if (field.type === 'file upload') {
          if (!customFields.value.files[i]) {
            return toast.warning(`Please fill in the ${field.title} field`)
          }
        }
      }
    }

    try {
      const response = await customFiatDepositMethod(
        route.params.uuid as string,
        selectedMethod.value?.id,
        values.amount,
        totalAmount.value,
        formattedCustomData.value,
      )
      toast.response(response)

      if (response.status === 'success') {
        router.push(
          props.flutter ? '/user/flutter/wallet/fiat' : '/user/wallets/fiat',
        )
      }
    } catch (error) {
      toast.danger(error as any)
    }
  }
})

const handleGateways = async () => {
  if (!selectedMethod.value) return
  if (!wallet.value) return
  if (!user.value?.uuid) return
  if (!route.params.uuid) return

  if (selectedMethod.value?.min_amount > paymentAmount.value)
    return toast.warning(
      `Minimum deposit amount is ${formatPrice(
        selectedMethod.value.min_amount,
        wallet.value.currency,
      )}`,
    )

  if (selectedMethod.value?.max_amount < paymentAmount.value)
    return toast.warning(
      `Maximum deposit amount is ${formatPrice(
        selectedMethod.value?.max_amount,
        wallet.value.currency,
      )}`,
    )

  if (selectedMethod.value?.alias === 'stripe') {
    const stripe = await useClientStripe()
    try {
      const response = await $fetch('/api/ipn/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount.value * 100,
          currency: wallet.value?.currency.toLowerCase(),
          taxAmount: feedAmount.value * 100,
          flutter: props.flutter,
        }),
      })

      const result = await stripe.redirectToCheckout({
        sessionId: response.id,
      })

      if (result.error) {
        toast.danger(result)
      }
    } catch (error) {
      toast.danger(error as any)
    }
  } else if (selectedMethod.value?.alias === 'paypal') {
    try {
      const response = await $fetch('/api/ipn/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount.value,
          currency: wallet.value?.currency.toLowerCase(),
          taxAmount: feedAmount.value,
          flutter: props.flutter,
        }),
      })

      window.location.href = response.redirect
    } catch (error) {
      toast.danger(error as any)
    }
  }

  // if (selectedMethod.value?.alias === 'paystack') {
  //   initiatePaystackPayment()
  // }
}

const formattedInstructions = (instructions: string | null | undefined) => {
  if (!instructions) return ''
  return instructions.replace(/\n/g, '<br>')
}

// const isPaystackEnabled = ref(false)
// watch(selectedMethod, (newMethod) => {
//   isPaystackEnabled.value = newMethod?.alias === 'paystack'
//   if (isPaystackEnabled.value) {
//     loadPaystackScript()
//   }
// })

// // Function to load Paystack script
// function loadPaystackScript() {
//   if (window.PaystackPop) {
//     console.log('Paystack script already loaded')
//     return
//   }

//   const script = document.createElement('script')
//   script.src = 'https://js.paystack.co/v1/inline.js'
//   script.onload = () => console.log('Paystack script loaded')
//   document.head.appendChild(script)
// }

// async function handlePaystackResponse(response) {
//   try {
//     const result = await $fetch('/api/ipn/paystack', {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'client-platform': 'browser',
//       },
//       body: {
//         reference: response.reference,
//       },
//     })
//     toast.response(result)

//     if (result.status === 'success') {
//       router.push(
//         props.flutter ? '/user/flutter/wallet/fiat' : '/user/wallets/fiat',
//       )
//     }
//   } catch (error) {
//     toast.danger(error as any)
//   }
// }

// function initiatePaystackPayment() {
//   try {
//     console.log(config.public?.paystackKey)

//     const handler = PaystackPop.setup({
//       key: config.public?.paystackKey,
//       email: user.value?.email,
//       amount: paymentAmount.value * 100,
//       ref: '' + Math.floor(Math.random() * 1000000000 + 1),
//       currency: wallet.value?.currency.toUpperCase(),
//       onClose: function () {
//         toast.dangerText('Payment cancelled')
//       },
//       callback: function (response) {
//         handlePaystackResponse(response)
//       },
//     })
//     handler.openIframe()
//   } catch (error) {
//     toast.danger(error as any)
//   }
// }
</script>

<template>
  <div>
    <form class="grid gap-5 grid-cols-1 lg:grid-cols-12 mb-20">
      <BaseCard
        class="col-span-1"
        :class="selectedMethod?.alias ? 'lg:col-span-8' : 'lg:col-span-12'"
      >
        <div
          class="border-muted-200 dark:border-muted-700 flex items-center justify-between gap-4 border-b px-5 py-5"
        >
          <div>
            <BaseHeading as="h3" size="sm" weight="medium">
              {{ $t('Payment method') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">{{
              $t('Select a payment method')
            }}</BaseText>
          </div>
          <div class="ms-auto">
            <BaseButtonAction @click.prevent="$router.back()">
              <Icon name="lucide:arrow-left" class="h-3 w-3" />
              <span>{{ $t('Cancel') }}</span>
            </BaseButtonAction>
          </div>
        </div>
        <div
          v-if="
            filteredGateways.find((gateway) => gateway.alias === 'paypal')
              ?.status
          "
        >
          <div
            role="button"
            class="flex cursor-pointer items-center px-5 py-5"
            :class="
              selectedMethod?.alias === 'paypal'
                ? 'bg-muted-50 dark:bg-muted-900/60'
                : ''
            "
            @click="
              selectedMethod = filteredGateways.find(
                (gateway) => gateway.alias === 'paypal',
              )
            "
          >
            <div
              class="dark:border-muted-800 h-4 w-4 rounded-full border-2 border-white ring-2 transition-colors"
              :class="
                selectedMethod?.alias === 'paypal'
                  ? 'bg-primary-600 ring-primary-600'
                  : 'ring-muted-400'
              "
            ></div>
            <label class="ms-4 text-sm font-medium">PayPal</label>
          </div>
          <div
            v-if="selectedMethod?.alias === 'paypal'"
            class="items-center justify-between gap-4 p-5 pt-4 grid grid-cols-1 md:grid-cols-2"
          >
            <div class="max-w-xs">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-2">
                {{ $t('Deposit with') }} PayPal
              </BaseHeading>
              <BaseParagraph size="sm" class="text-muted-400">
                {{
                  $t(
                    'After clicking on "Deposit", you will be redirected to PayPal website to complete your purchase securely',
                  )
                }}.
              </BaseParagraph>
            </div>
            <div class="grow">
              <BaseCard
                shape="curved"
                elevated
                class="mx-auto flex max-w-[280px] items-center justify-center px-5 py-16"
              >
                <Icon name="logos:paypal" class="h-12 w-12" />
              </BaseCard>
            </div>
          </div>
        </div>
        <div class="border-muted-200 dark:border-muted-700 border-t">
          <div
            v-if="
              filteredGateways.find((gateway) => gateway.alias === 'stripe')
                ?.status
            "
            role="button"
            class="flex cursor-pointer items-center px-5 py-5"
            :class="
              selectedMethod?.alias === 'stripe'
                ? 'bg-muted-50 dark:bg-muted-900/60'
                : ''
            "
            @click="
              selectedMethod = filteredGateways.find(
                (gateway) => gateway.alias === 'stripe',
              )
            "
          >
            <div
              class="dark:border-muted-800 h-4 w-4 rounded-full border-2 border-white ring-2"
              :class="
                selectedMethod?.alias === 'stripe'
                  ? 'bg-primary-600 ring-primary-600'
                  : 'ring-muted-400'
              "
            ></div>
            <label class="ms-4 text-sm font-medium">{{
              $t('Credit Card')
            }}</label>
          </div>
          <div
            v-if="selectedMethod?.alias === 'stripe'"
            class="items-center justify-between gap-4 p-5 pt-4 grid grid-cols-1 md:grid-cols-2"
          >
            <div class="max-w-xs">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-2">
                {{ $t('Deposit with MasterCard') }}
              </BaseHeading>
              <BaseParagraph size="sm" class="text-muted-400">
                {{
                  $t(
                    'After clicking on "Deposit", you will be redirected to Stripe website to complete your purchase securely',
                  )
                }}.
              </BaseParagraph>
            </div>
            <div class="grow">
              <CreditCardReal
                :name="cardInfo.name"
                :number="cardInfo.number"
                :expiry-month="cardInfo.expiryMonth"
                :expiry-year="cardInfo.expiryYear"
                :cvc="cardInfo.cvc"
              />
            </div>
          </div>
        </div>
        <!-- <div class="border-muted-200 dark:border-muted-700 border-t">
          <div
            v-if="
              filteredGateways.find((gateway) => gateway.alias === 'paystack')
                ?.status
            "
            role="button"
            class="flex cursor-pointer items-center px-5 py-5"
            :class="
              selectedMethod?.alias === 'paystack'
                ? 'bg-muted-50 dark:bg-muted-900/60'
                : ''
            "
            @click="
              selectedMethod = filteredGateways.find(
                (gateway) => gateway.alias === 'paystack',
              )
            "
          >
            <div
              class="dark:border-muted-800 h-4 w-4 rounded-full border-2 border-white ring-2"
              :class="
                selectedMethod?.alias === 'paystack'
                  ? 'bg-primary-600 ring-primary-600'
                  : 'ring-muted-400'
              "
            ></div>
            <label class="ms-4 text-sm font-medium">{{ $t('Paystack') }}</label>
          </div>
          <div
            v-if="selectedMethod?.alias === 'paystack'"
            class="items-center justify-between gap-4 p-5 pt-4 grid grid-cols-1 md:grid-cols-2"
          >
            <div class="max-w-xs">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-2">
                {{ $t('Deposit with Paystack') }}
              </BaseHeading>
              <BaseParagraph size="sm" class="text-muted-400">
                {{
                  $t(
                    'After clicking on "Deposit", you will be redirected to Paystack website to complete your purchase securely',
                  )
                }}.
              </BaseParagraph>
            </div>
            <div class="grow">
              <img
                src="/img/gateways/paystack.png"
                alt="Paystack"
                height="40"
                class="rounded-xl"
              />
            </div>
          </div>
        </div> -->
        <!-- Custom Methods Selection -->
        <template
          v-if="depositMethodStore.methods.length > 0"
          v-for="(method, index) in depositMethodStore.methods"
          :key="index"
        >
          <div class="border-muted-200 dark:border-muted-700 border-t">
            <div
              role="button"
              class="flex cursor-pointer items-center px-5 py-5"
              :class="
                selectedMethod === method
                  ? 'bg-muted-50 dark:bg-muted-900/60'
                  : ''
              "
              @click="selectedMethod = method"
            >
              <div
                class="dark:border-muted-800 h-4 w-4 rounded-full border-2 border-white ring-2"
                :class="
                  selectedMethod === method
                    ? 'bg-primary-600 ring-primary-600'
                    : 'ring-muted-400'
                "
              ></div>
              <label class="ms-4 text-sm font-medium">{{ method.title }}</label>
            </div>
            <div
              v-if="selectedMethod === method"
              class="items-center justify-between gap-4 p-5 pt-4 grid grid-cols-1 md:grid-cols-2"
            >
              <div class="max-w-xs">
                <BaseHeading as="h3" size="md" weight="medium" class="mb-2">
                  {{ $t('Deposit with') }} {{ method.title }}
                </BaseHeading>
                <BaseParagraph size="sm" class="text-muted-400">
                  {{
                    $t(
                      'After clicking on "Deposit", your deposit will be sent to our team for verification. You will receive an email notification once your deposit has been approved',
                    )
                  }}.
                </BaseParagraph>
                <ul
                  class="list-disc pl-5 text-muted-700 dark:text-muted-200 text-sm mt-4"
                >
                  <li>
                    {{ $t('Minimum Deposit') }}:
                    {{
                      formatPrice(selectedMethod?.min_amount, wallet?.currency)
                    }}
                  </li>
                  <li>
                    {{ $t('Maximum Deposit') }}:
                    {{
                      formatPrice(selectedMethod?.max_amount, wallet?.currency)
                    }}
                  </li>
                </ul>
              </div>
              <div class="grow">
                <img :src="method.image" height="180" />
              </div>
            </div>
          </div>
        </template>
      </BaseCard>
      <BaseCard
        class="pb-6 col-span-1 lg:col-span-4"
        v-if="selectedMethod?.alias"
      >
        <div class="px-5 pt-5">
          <div class="mb-6">
            <BaseInput
              v-model.number="paymentAmount"
              type="number"
              label="Deposit Amount"
              placeholder="Enter amount"
            />
          </div>
          <div
            class="flex items-center"
            v-if="
              selectedMethod?.alias === 'stripe' &&
              Number(selectedMethod?.fixed_fee) > 0
            "
          >
            <BaseHeading as="h3" size="sm" weight="medium" lead="none">
              {{ $t('Flat Fee') }}
            </BaseHeading>
            <div class="ms-auto">
              <BaseText size="sm" class="text-muted-800 dark:text-muted-100">
                <span class="font-semibold">{{
                  formatPrice(
                    Number(selectedMethod?.fixed_fee),
                    wallet?.currency,
                  )
                }}</span>
              </BaseText>
            </div>
          </div>
          <div
            class="flex items-center mt-2"
            v-if="
              selectedMethod?.alias === 'stripe' &&
              Number(selectedMethod?.percentage_fee) > 0
            "
          >
            <BaseHeading as="h3" size="sm" weight="medium" lead="none">
              {{ $t('Percentage Fee') }}
            </BaseHeading>
            <div class="ms-auto">
              <BaseText size="sm" class="text-muted-800 dark:text-muted-100">
                <span class="font-semibold"
                  >{{ Number(selectedMethod?.percentage_fee) }}%</span
                >
              </BaseText>
            </div>
          </div>
        </div>
        <div
          class="border-muted-200 dark:border-muted-700 mt-4 border-t px-5 pt-5"
        >
          <div class="flex items-center justify-between">
            <BaseHeading as="h3" size="sm" weight="medium" lead="none">
              {{ $t('To pay today') }}
            </BaseHeading>
            <BaseText size="md" class="text-muted-800 dark:text-muted-100">
              <span class="font-semibold">{{
                formatPrice(totalAmount, wallet?.currency)
              }}</span>
            </BaseText>
          </div>
          <BaseText
            class="text-muted-500 dark:text-muted-400 mt-2 text-xs"
            v-if="
              Number(selectedMethod?.percentage_fee) > 0 ||
              Number(selectedMethod?.fixed_fee) > 0
            "
          >
            {{
              Number(selectedMethod?.percentage_fee) > 0
                ? `Fees are calculated at a flat rate of ${Number(
                    selectedMethod?.percentage_fee,
                  )}%`
                : ''
            }}
            {{
              Number(selectedMethod?.percentage_fee) > 0 &&
              Number(selectedMethod?.fixed_fee) > 0
                ? `,plus a fixed fee of ${formatPrice(
                    Number(selectedMethod?.fixed_fee),
                    wallet?.currency,
                  )}.`
                : Number(selectedMethod?.fixed_fee) > 0
                  ? `A fixed fee of ${formatPrice(
                      Number(selectedMethod?.fixed_fee),
                      wallet?.currency,
                    )} will be applied.`
                  : ''
            }}
            {{ $t('This amount has been included in your total') }}.
          </BaseText>
        </div>
        <div class="my-4 flex items-center px-5">
          <BaseCheckbox
            v-model="termsApproval"
            color="primary"
            shape="full"
            label="I agree to the Terms Of Service"
            :classes="{
              label: 'relative top-0.5 text-xs',
            }"
          />
        </div>
        <div class="flex flex-col px-5 pt-4">
          <div v-if="selectedMethod?.alias === 'paypal'">
            <PayPalPayment />
          </div>
          <BaseButton
            v-else
            color="primary"
            class="!h-12 w-full"
            @click="handleGateways"
            :disabled="!termsApproval || isSubmitting"
            :loading="isSubmitting"
          >
            {{ $t('Deposit') }}</BaseButton
          >
        </div>
      </BaseCard>

      <template v-else>
        <BaseCard class="col-span-1 lg:col-span-7 p-5" v-if="selectedMethod">
          <BaseHeading as="h3" size="sm" weight="medium" class="mb-2">
            {{ $t('Deposit Instructions') }}
          </BaseHeading>
          <div class="space-y-5">
            <BaseText
              v-html="formattedInstructions(selectedMethod?.instructions)"
            ></BaseText>
            <template
              v-for="(item, index) in selectedMethod?.custom_fields"
              :key="index"
            >
              <template v-if="item.type === 'input'">
                <BaseInput
                  v-model="customFields.inputs[index]"
                  :label="item.title"
                  :placeholder="item.title"
                  :type="item.type"
                  :required="item.required"
                  :classes="{
                    input: 'mt-2',
                    label: 'text-xs',
                  }"
                />
              </template>
              <template v-else-if="item.type === 'textarea'">
                <BaseTextarea
                  v-model="customFields.textareas[index]"
                  :label="item.title"
                  :placeholder="item.title"
                  :required="item.required"
                  :classes="{
                    input: 'mt-2',
                    label: 'text-xs',
                  }"
                />
              </template>
              <template v-else-if="item.type === 'file upload'">
                <BaseInputFile
                  v-model="customFields.files[index]"
                  :label="item.title"
                  :required="item.required"
                  :classes="{
                    input: 'mt-2',
                    label: 'text-xs',
                  }"
                />
                <div v-if="customFields.previews[index]">
                  <img
                    :src="customFields.previews[index]"
                    alt="File preview"
                    height="180"
                  />
                </div>
              </template>
            </template>
          </div>
        </BaseCard>
        <div class="col-span-1 lg:col-span-5" v-if="selectedMethod">
          <BaseCard class="pb-6">
            <div class="px-5 pt-5">
              <div class="mb-6">
                <label class="nui-label pb-3 text-[0.825rem]">{{
                  $t('Deposit amount')
                }}</label
                ><Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="amount"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    label="Amount"
                    type="number"
                    placeholder="Enter amount"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div
                class="flex items-center"
                v-if="selectedMethod?.fixed_fee > 0"
              >
                <BaseHeading as="h3" size="sm" weight="medium" lead="none">
                  {{ $t('Flat Fee') }}
                </BaseHeading>
                <div class="ms-auto">
                  <BaseText
                    size="sm"
                    class="text-muted-800 dark:text-muted-100"
                  >
                    <span class="font-semibold">{{
                      formatPrice(fixedFeesRate, wallet?.currency)
                    }}</span>
                  </BaseText>
                </div>
              </div>
              <div
                class="flex items-center mt-2"
                v-if="selectedMethod?.percentage_fee > 0"
              >
                <BaseHeading as="h3" size="sm" weight="medium" lead="none">
                  {{ $t('Percentage Fee') }}
                </BaseHeading>
                <div class="ms-auto">
                  <BaseText
                    size="sm"
                    class="text-muted-800 dark:text-muted-100"
                  >
                    <span class="font-semibold"
                      >{{ Number(selectedMethod?.percentage_fee) }}%</span
                    >
                  </BaseText>
                </div>
              </div>
            </div>
            <div
              class="border-muted-200 dark:border-muted-700 mt-4 border-t px-5 pt-5"
            >
              <div class="flex items-end justify-between">
                <BaseHeading as="h3" size="sm" weight="medium" lead="none">
                  {{ $t('To pay today') }} ({{ wallet?.currency }})
                </BaseHeading>
                <BaseText size="md" class="text-muted-800 dark:text-muted-100">
                  <span class="font-semibold">{{
                    formatPrice(totalAmount, wallet?.currency)
                  }}</span>
                </BaseText>
              </div>
              <BaseText
                class="text-muted-500 dark:text-muted-400 mt-2 text-xs"
                v-if="
                  selectedMethod?.percentage_fee > 0 ||
                  selectedMethod?.fixed_fee > 0
                "
              >
                {{
                  selectedMethod?.percentage_fee > 0
                    ? `Fees are calculated at a flat rate of ${selectedMethod?.percentage_fee}%`
                    : ''
                }}
                {{
                  selectedMethod?.percentage_fee > 0 &&
                  selectedMethod?.fixed_fee > 0
                    ? `,plus a fixed fee of ${formatPrice(
                        selectedMethod?.fixed_fee,
                        wallet?.currency,
                      )}.`
                    : selectedMethod?.fixed_fee > 0
                      ? `A fixed fee of ${formatPrice(
                          selectedMethod?.fixed_fee,
                          wallet?.currency,
                        )} will be applied.`
                      : ''
                }}
                {{ $t('This amount has been included in your total') }}.
              </BaseText>
            </div>
            <div class="my-4 flex items-center px-5">
              <BaseCheckbox
                v-model="termsApproval"
                color="primary"
                shape="full"
                label="I agree to the Terms Of Service"
                :classes="{
                  label: 'relative top-0.5 text-xs',
                }"
              />
            </div>
            <div class="flex flex-col px-5 pt-4">
              <BaseButton
                color="primary"
                class="!h-12 w-full"
                @click="handleMethods"
                :disabled="!termsApproval || isSubmitting"
                :loading="isSubmitting"
              >
                {{ $t('Deposit') }}</BaseButton
              >
            </div>
          </BaseCard>
        </div>
      </template>
    </form>
    <template
      v-if="
        !selectedMethod &&
        depositMethodStore.methods.length === 0 &&
        filteredGateways.length === 0
      "
    >
      <BasePlaceholderPage
        title="No Deposit Methods Available"
        subtitle="Please contact support for more information"
      >
        <template #image>
          <img
            class="block dark:hidden"
            src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
            alt="Placeholder image"
          />
          <img
            class="hidden dark:block"
            src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
            alt="Placeholder image"
          />
        </template>
      </BasePlaceholderPage>
    </template>
  </div>
</template>
