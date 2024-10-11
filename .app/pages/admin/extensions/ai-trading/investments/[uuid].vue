<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
definePageMeta({
  title: 'Investment Details',
  permissions: ['View AI Trading Investments'],
})
const zodSchema = z.object({
  result: z.string().nonempty('Please select an option'),
  profitType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
  profitValue: z.number().min(0, 'Please enter a valid value'),
})
const validationSchema = toTypedSchema(zodSchema)
const initialValues = {
  result: 'DRAW',
  profitType: null,
  profitValue: 0,
}

const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema,
  initialValues,
})

const transaction = ref<any>(null)
const { getAdminAITrading, updateAITrading } = useAiTrading()
const route = useRoute()
const router = useRouter()
const isApproveOpen = ref(false)
const { toast } = useUtils()
const transactionId = computed(() => route.params.uuid)

const results = ['WIN', 'LOSS', 'DRAW']
onMounted(async () => {
  try {
    const response = await getAdminAITrading(transactionId.value)
    transaction.value = response.data.result
  } catch (error) {
    router.back()
    toast.danger(error as any)
  }
})

// This is where you would send the form data to the server
const updateInvestment = handleSubmit(async (values: any) => {
  if (transaction.value) {
    let finalProfit = values.profitValue

    if (values.profitType === 'PERCENTAGE') {
      finalProfit = (values.profitValue / 100) * transaction.value.amount
    }
    try {
      const response = await updateAITrading(
        transactionId.value,
        values.result,
        finalProfit,
      )

      toast.response(response)
      if (response.status === 'success') {
        transaction.value.result = values.result
        transaction.value.profit = finalProfit
      }
    } catch (error) {
      toast.danger(error as any)
    }
    isApproveOpen.value = false
  }
})

const statusClass = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'FAILED':
      return 'danger'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    case 'EXPIRED':
      return 'danger'
    default:
      return 'info'
  }
}

const resultStatus = (status: string) => {
  switch (status) {
    case 'WIN':
      return 'success'
    case 'LOSS':
      return 'danger'
    case 'DRAW':
      return 'warning'
    default:
      return 'info'
  }
}
const { formatedDate } = useUtils()
</script>

<template>
  <TairoContentWrapper class="mb-20">
    <template #right>
      <BaseButton @click="router.back()" color="muted">
        <Icon name="line-md:chevron-left" class="mr-2" /> {{ $t('Back') }}
      </BaseButton>
    </template>
    <BaseCard class="px-8 pt-8 pb-4 mx-auto">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {{ $t('Investment Details') }}
        </h1>
        <div class="flex items-center xs:flex-col sm:flex-row gap-2">
          <BaseTag
            shape="rounded"
            :color="statusClass(transaction?.status)"
            flavor="pastel"
            class="dark:bg-opacity-80"
            >{{ transaction?.status }}</BaseTag
          >
          <BaseTag
            shape="rounded"
            :color="
              transaction?.result !== null
                ? resultStatus(transaction?.result)
                : 'warning'
            "
            flavor="pastel"
            class="dark:bg-opacity-80"
            >{{
              transaction?.result !== null
                ? transaction?.result
                : 'Result not set'
            }}</BaseTag
          >
        </div>
      </div>

      <!-- Summary Section -->
      <div
        class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-gray-700 dark:text-gray-400"
      >
        <div class="flex flex-col">
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Total Amount') }}:</label
          >
          {{ transaction?.amount + ' ' + transaction?.market?.split('/')[1] }}
        </div>
        <div class="flex flex-col">
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Profit') }}:</label
          >
          <span
            :class="{
              'text-green-500':
                transaction?.profit !== null && transaction?.result === 'WIN',
              'text-red-500':
                transaction?.profit !== null && transaction?.result === 'LOSS',
              'text-gray-500':
                transaction?.profit !== null && transaction?.result === 'DRAW',
              'text-warning-500': transaction?.profit === null,
            }"
          >
            {{
              transaction?.profit !== null
                ? (transaction?.result === 'WIN'
                    ? '+'
                    : transaction?.result === 'LOSS'
                      ? '-'
                      : '') +
                  transaction?.profit +
                  ' ' +
                  transaction?.market?.split('/')[1]
                : 'Not set'
            }}</span
          >
        </div>
        <div class="flex flex-col">
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Duration') }}:</label
          >
          {{ transaction?.duration.duration }}
          {{ transaction?.duration.timeframe }}
        </div>
      </div>

      <!-- Details Section -->
      <div
        class="p-4 border rounded-md mb-6 text-gray-700 dark:border-gray-600 dark:text-gray-400"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('Plan') }} {{ transaction?.plan?.title }}:
        </h2>
        <p class="mb-4">{{ transaction?.plan?.description }}</p>

        <div>
          <h2
            class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
          >
            {{ $t('Investment ID') }}:
          </h2>
          <p>{{ transaction?.uuid }}</p>
        </div>
      </div>

      <!-- User & Date Information -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700 dark:text-gray-400"
      >
        <div class="p-4 border rounded-md dark:border-gray-600">
          <div class="flex jsutify-start items-center">
            <img
              loading="lazy"
              :src="
                transaction?.user?.avatar || '/img/avatars/placeholder-file.png'
              "
              class="mr-2 h-16 w-16 rounded-full"
            />
            <div>
              <div class="font-bold">
                {{ transaction?.user.first_name }}
                {{ transaction?.user.last_name }}
              </div>
              <div>
                {{ transaction?.user.uuid }}
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border rounded-md dark:border-gray-600">
          <h2
            class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
          >
            {{ $t('Date') }}:
          </h2>
          <p>
            {{ formatedDate(transaction?.created_at, true) }}
          </p>
        </div>
      </div>

      <!-- Approve Investment Button -->
      <div
        v-if="transaction?.status === 'ACTIVE'"
        class="w-full flex gap-2 xs:flex-col sm:flex-row mb-2"
      >
        <BaseButton
          @click="isApproveOpen = true"
          color="success"
          class="w-full"
        >
          {{ $t('Set Result') }}
        </BaseButton>
      </div>
    </BaseCard>
    <TairoModal
      :open="isApproveOpen"
      size="lg"
      @close="() => (isApproveOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Set Investment Result') }}
          </h3>
          <BaseButtonClose @click="isApproveOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start space-y-3">
          <div>
            {{
              $t(
                'Are you sure you want to set this result for this investment?',
              )
            }}
          </div>
          <div>
            {{
              $t(
                'Please note that this action will set the end result for this investment and the profit will be calculated based on the result you set.',
              )
            }}
          </div>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="result"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="results"
              placeholder="Please select a result"
              label="Result"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-if="values.result !== 'DRAW'"
            name="profitType"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="['FIXED', 'PERCENTAGE']"
              placeholder="Select Profit Type"
              label="Profit Type"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-if="values.profitType"
            name="profitValue"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              placeholder="Enter Value"
              label="Profit Value"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isApproveOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="updateInvestment()"
            >
              {{ $t('Submit') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </TairoContentWrapper>
</template>
