<script setup lang="ts">
definePageMeta({
  title: 'Transaction Details',
  permissions: ['View Forex Transactions'],
})
const transaction = ref<any>(null)
const { getForexTransaction, updateTransactionStatus } = useForex()
const route = useRoute()
const router = useRouter()
const isRejectOpen = ref(false)
const isApproveOpen = ref(false)
const { toast } = useUtils()
const { uuid } = route.params
const rejectionMessage = ref(
  'We are sorry, your transaction has been rejected. Please contact support for more information. \n\nRejection reason goes here.  \n\nThank you.',
)

onMounted(async () => {
  try {
    const response = await getForexTransaction(uuid)
    transaction.value = response.data.result
  } catch (error) {
    router.back()
    toast.danger(error as any)
  }
})

const updateTransaction = async (status: string, message?: string) => {
  if (transaction.value) {
    try {
      const response = await updateTransactionStatus(uuid, status, message)

      toast.response(response)
      if (response.status === 'success') {
        transaction.value.status = status
        if (status === 'REJECTED') {
          transaction.value.metadata.note = message
        }
      }
    } catch (error) {
      toast.danger(error as any)
    }
    if (status === 'REJECTED') {
      isRejectOpen.value = false
    }
    if (status === 'COMPLETED') {
      isApproveOpen.value = false
    }
  }
}

const status = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'PENDING':
      return 'warning'
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

const typeClass = (type: string) => {
  switch (type) {
    case 'FOREX_DEPOSIT':
      return 'success'
    case 'FOREX_WITHDRAW':
      return 'danger'
    default:
      return 'info'
  }
}

const transactionTypeMap = {
  FOREX_DEPOSIT: 'Deposit',
  FOREX_WITHDRAW: 'Withdraw',
}
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
          {{ $t('Transaction Details') }}
        </h1>
        <div class="flex items-center xs:flex-col sm:flex-row gap-2">
          <BaseTag
            shape="rounded"
            :color="status(transaction?.status)"
            flavor="pastel"
            class="dark:bg-opacity-80"
            >{{ transaction?.status }}</BaseTag
          >
          <BaseTag
            shape="rounded"
            :color="typeClass(transaction?.type)"
            class="dark:bg-opacity-80"
            >{{ transactionTypeMap[transaction?.type] }}</BaseTag
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
          {{ transaction?.amount + ' ' + transaction?.wallet?.currency }}
        </div>
        <div
          class="flex flex-col"
          v-if="transaction?.type === 'FOREX_WITHDRAW'"
        >
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Withdraw Method') }}:</label
          >
          {{ transaction?.method }}
        </div>
      </div>

      <!-- Details Section -->
      <div
        class="p-4 border rounded-md mb-6 text-gray-700 dark:border-gray-600 dark:text-gray-400"
      >
        <template v-if="transaction?.description">
          <h2
            class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
          >
            {{ $t('Description') }}:
          </h2>
          <p class="mb-4">{{ transaction?.description }}</p>
        </template>
        <div v-else>
          <h2
            class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
          >
            {{ $t('Transaction ID') }}:
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
            {{ formatDate(transaction?.created_at) }}
          </p>
        </div>
      </div>

      <!-- Rejection Note Section -->
      <div
        v-if="transaction?.metadata?.note && transaction?.status === 'REJECTED'"
        class="p-4 border rounded-md dark:border-gray-600 mb-6"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('Note') }}:
        </h2>
        <p v-html="transaction?.metadata?.note.replace(/\n/g, '<br />')"></p>
      </div>

      <!-- Approve Transaction Button -->
      <div
        v-if="transaction?.status === 'PENDING'"
        class="w-full flex gap-2 xs:flex-col sm:flex-row mb-2"
      >
        <BaseButton
          @click="isApproveOpen = true"
          color="success"
          class="w-full"
        >
          {{ $t('Approve Transaction') }}
        </BaseButton>
        <BaseButton @click="isRejectOpen = true" color="danger" class="w-full">
          {{ $t('Reject Transaction') }}
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
            {{ $t('Approve Transaction') }}
          </h3>
          <BaseButtonClose @click="isApproveOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p>
            {{
              $t(
                'Are you sure you want to approve this transaction? This action cannot be undone',
              )
            }}.
          </p>
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
              @click="updateTransaction('COMPLETED')"
            >
              {{ $t('Approve') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal
      :open="isRejectOpen"
      size="lg"
      @close="() => (isRejectOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Reject Transaction') }}
          </h3>
          <BaseButtonClose @click="isRejectOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <BaseTextarea
            v-model="rejectionMessage"
            type="text"
            rows="10"
            label="Please provide a reason for rejection."
            placeholder="Enter rejection reason"
            shape="curved"
            :classes="{ input: 'h-12' }"
          />
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isRejectOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="updateTransaction('REJECTED', rejectionMessage)"
            >
              {{ $t('Reject') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </TairoContentWrapper>
</template>
