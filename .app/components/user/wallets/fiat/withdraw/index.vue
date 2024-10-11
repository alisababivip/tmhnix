<script setup lang="ts">
import type { User, Wallet } from '~~/types'
import { useWithdrawMethodStore } from '~~/store/admin/withdraw/methods'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const withdrawMethodStore = useWithdrawMethodStore()
const walletStore = useWalletStore()
const { withdrawFiat } = useWallet()
const { toast } = useUtils()
const userStore = useUserStore()
const user = userStore.getProfile as User
const { getWallet } = useWallet()
const route = useRoute()
const wallet = ref<Wallet | null>(null)

const selectedMethod = ref(withdrawMethodStore.methods[0] ?? null)

onMounted(async () => {
  try {
    const response = await getWallet(route.params.uuid as string)
    wallet.value = response.data.result
  } catch (error) {
    toast.danger(error as any)
  }
  if (withdrawMethodStore.methods.length === 0) {
    await withdrawMethodStore.fetchWithdrawMethods()
  }
  selectedMethod.value = withdrawMethodStore.methods[0]
})

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

const fixedTaxesRate = computed(() => selectedMethod.value?.fixed_fee ?? 0)
const percentageTaxesRate = computed(
  () => selectedMethod.value?.percentage_fee ?? 0,
)
const taxedAmount = computed(
  () =>
    values.amount * (percentageTaxesRate.value / 100) + fixedTaxesRate.value,
)
const totalAmount = computed(() => values.amount + taxedAmount.value)

const termsApproval = ref(false)
const router = useRouter()

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
  selectedMethod.value?.custom_fields.forEach((field, index) => {
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

const handleWithdraw = handleSubmit(async (values: any) => {
  if (!selectedMethod.value) return
  if (!wallet.value) return
  if (!user.uuid) return
  if (!route.params.uuid) return
  if (!termsApproval.value) return
  if (selectedMethod.value.min_amount > values.amount)
    return toast.warning(
      `Minimum withdraw amount is ${formatPrice(
        selectedMethod.value.min_amount,
        wallet.value.currency,
      )}`,
    )

  if (selectedMethod.value.max_amount < values.amount)
    return toast.warning(
      `Maximum withdraw amount is ${formatPrice(
        selectedMethod.value.max_amount,
        wallet.value.currency,
      )}`,
    )
  if (totalAmount.value > wallet.value.balance)
    return toast.warning(
      `You don't have enough balance to withdraw this amount`,
    )

  if (selectedMethod.value.custom_fields.length > 0) {
    for (let i = 0; i < selectedMethod.value.custom_fields.length; i++) {
      const field = selectedMethod.value.custom_fields[i]
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
  }
  isSubmitting.value = true
  try {
    const response = await withdrawFiat(
      route.params.uuid as string,
      selectedMethod.value.id,
      values.amount,
      totalAmount.value,
      formattedCustomData.value,
    )
    toast.response(response)
    if (response.status === 'success') {
      isSubmitting.value = false
      await walletStore.fetchWallets()
      router.push(`/user/${props.flutter ? 'flutter/' : ''}wallets/fiat`)
    }
  } catch (error) {
    toast.danger(error as any)
    isSubmitting.value = false
  }
})
</script>

<template>
  <form class="grid gap-8 grid-cols-1 lg:grid-cols-12 mb-20">
    <BaseCard class="col-span-1 lg:col-span-12">
      <div
        class="border-muted-200 dark:border-muted-700 flex items-center justify-between gap-4 border-b px-8 py-5"
      >
        <div>
          <BaseHeading as="h3" size="sm" weight="medium">
            {{ $t('Withdraw method') }}
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">{{
            $t('Select a withdraw method')
          }}</BaseText>
        </div>
        <div class="ms-auto">
          <BaseButtonAction
            :to="`/user/${flutter ? 'flutter/' : ''}wallets/fiat`"
          >
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Cancel') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <template
        v-if="withdrawMethodStore.methods.length > 0"
        v-for="(method, index) in withdrawMethodStore.methods"
        :key="index"
      >
        <div
          class="border-muted-200 dark:border-muted-700 border-t"
          @click="selectedMethod = method"
        >
          <div
            role="button"
            class="flex cursor-pointer items-center px-8 py-5"
            :class="
              selectedMethod?.id === method.id
                ? 'bg-muted-50 dark:bg-muted-900/60'
                : ''
            "
            @click="selectedMethod?.id === method.id"
          >
            <div
              class="dark:border-muted-800 h-4 w-4 rounded-full border-2 border-white ring-2"
              :class="
                selectedMethod?.id === method.id
                  ? 'bg-primary-600 ring-primary-600'
                  : 'ring-muted-400'
              "
            ></div>
            <label class="ms-4 text-sm font-medium">{{ method.title }}</label>
          </div>
          <div
            v-if="selectedMethod?.id === method.id"
            class="items-center justify-between gap-4 p-8 pt-4 grid grid-cols-1 md:grid-cols-2"
          >
            <div class="max-w-xs">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-2">
                {{ $t('Withdraw with') }} {{ method.title }}
              </BaseHeading>
              <BaseParagraph size="sm" class="text-muted-400">
                {{
                  $t(
                    'After clicking on "Withdraw", your request will be sent to our team for approval. You will receive an email notification once your request has been approved',
                  )
                }}.
              </BaseParagraph>
              <ul
                class="list-disc pl-5 text-muted-700 dark:text-muted-200 text-sm mt-4"
              >
                <li>
                  {{ $t('Minimum Withdraw') }}:
                  {{
                    formatPrice(selectedMethod?.min_amount, wallet?.currency)
                  }}
                </li>
                <li>
                  {{ $t('Maximum Withdraw') }}:
                  {{
                    formatPrice(selectedMethod?.max_amount, wallet?.currency)
                  }}
                </li>
                <li>
                  {{ $t('Processing Time') }}:
                  {{ selectedMethod?.processing_time }}
                </li>
              </ul>
            </div>
            <div class="grow">
              <img :src="method.image" height="180" />
            </div>
          </div></div
      ></template>
      <template v-else>
        <div class="flex items-center justify-center p-8">
          <BaseText size="sm" class="text-muted-400">
            {{ $t('No withdraw methods available') }}
          </BaseText>
        </div>
      </template>
    </BaseCard>
    <BaseCard class="col-span-1 lg:col-span-7 p-5" v-if="selectedMethod">
      <BaseHeading as="h3" size="sm" weight="medium" class="mb-2">
        {{ $t('Withdrawal Instructions') }}
      </BaseHeading>
      <div class="space-y-5">
        <BaseText>
          {{ selectedMethod?.instructions }}
        </BaseText>
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
        <div class="px-8 pt-5">
          <div class="mb-6">
            <label class="nui-label pb-3 text-[0.825rem]">{{
              $t('Withdraw amount')
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
          <div class="flex items-center" v-if="selectedMethod?.fixed_fee > 0">
            <BaseHeading as="h3" size="sm" weight="medium" lead="none">
              {{ $t('Flat Tax') }}
            </BaseHeading>
            <div class="ms-auto">
              <BaseText size="sm" class="text-muted-800 dark:text-muted-100">
                <span class="font-semibold">{{
                  formatPrice(fixedTaxesRate, wallet?.currency)
                }}</span>
              </BaseText>
            </div>
          </div>
          <div
            class="flex items-center mt-2"
            v-if="selectedMethod?.percentage_fee > 0"
          >
            <BaseHeading as="h3" size="sm" weight="medium" lead="none">
              {{ $t('Percentage Tax') }}
            </BaseHeading>
            <div class="ms-auto">
              <BaseText size="sm" class="text-muted-800 dark:text-muted-100">
                <span class="font-semibold">{{ percentageTaxesRate }}%</span>
              </BaseText>
            </div>
          </div>
        </div>
        <div
          class="border-muted-200 dark:border-muted-700 mt-4 border-t px-8 pt-5"
        >
          <div class="flex items-end justify-between">
            <BaseHeading as="h3" size="sm" weight="medium" lead="none">
              {{ $t('To withdraw today') }} ({{ wallet?.currency }})
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
                ? `Taxes are calculated at a flat rate of ${selectedMethod?.percentage_fee}%`
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
        <div class="my-4 flex items-center px-8">
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
        <div class="flex flex-col px-8 pt-4">
          <BaseButton
            color="primary"
            class="!h-12 w-full"
            @click="handleWithdraw"
            :disabled="!termsApproval || isSubmitting"
            :loading="isSubmitting"
          >
            {{ $t('Withdraw') }}</BaseButton
          >
        </div>
      </BaseCard>
    </div>
  </form>
</template>
