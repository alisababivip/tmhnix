<script setup lang="ts">
definePageMeta({
  title: 'Transaction Details',
  permissions: ['Access Transaction Details'],
})
const transaction = ref<any>(null)
const {
  getTransaction,
  updateTransactionStatus,
  approveSpotWalletWithdrawal,
  rejectSpotWalletWithdrawal,
} = useWallet()
const route = useRoute()
const router = useRouter()
const isRejectOpen = ref(false)
const isApproveOpen = ref(false)
const { toast } = useUtils()
const transactionId = computed(() => route.params.uuid)
const rejectionMessage = ref(
  'We are sorry, your transaction has been rejected. Please contact support for more information. \n\nRejection reason goes here.  \n\nThank you.',
)

onMounted(async () => {
  try {
    const response = await getTransaction(transactionId.value)
    transaction.value = response.data.result
  } catch (error) {
    router.back()
    toast.danger(error as any)
  }
})

const updateTransaction = async (status: string, message?: string) => {
  if (transaction.value) {
    if (transaction.value?.wallet?.type === 'SPOT') {
      if (status === 'COMPLETED') {
        try {
          const response = await approveSpotWalletWithdrawal(
            transactionId.value,
          )

          toast.response(response)
          if (response.status === 'success') {
            transaction.value.status = status
          }
        } catch (error) {
          toast.danger(error as any)
        }
        isApproveOpen.value = false
      } else {
        try {
          const response = await rejectSpotWalletWithdrawal(
            transactionId.value,
            message,
          )

          toast.response(response)
          if (response.status === 'success') {
            transaction.value.status = status
            transaction.value.metadata.note = message
          }
        } catch (error) {
          toast.danger(error as any)
        }
        isRejectOpen.value = false
      }
    } else {
      try {
        const response = await updateTransactionStatus(
          transactionId.value,
          status,
          message,
        )

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
    case 'DEPOSIT':
      return 'success'
    case 'WITHDRAW':
      return 'danger'
    case 'TRANSFER':
      return 'warning'
    default:
      return 'info'
  }
}

const transactionChainLink = computed(() => {
  if (!transaction.value?.metadata?.chain) return null

  const chain = transaction.value.metadata.chain
  switch (chain) {
    case 'ETH':
      return `https://etherscan.io/tx/${transaction.value.reference_id}`
    case 'BTC':
      return `https://www.blockchain.com/btc/tx/${transaction.value.reference_id}`
    case 'LTC':
      return `https://blockchair.com/litecoin/transaction/${transaction.value.reference_id}`
    case 'BCH':
      return `https://blockchair.com/bitcoin-cash/transaction/${transaction.value.reference_id}`
    case 'XRP':
      return `https://xrpscan.com/tx/${transaction.value.reference_id}`
    case 'XLM':
      return `https://stellarscan.io/transaction/${transaction.value.reference_id}`
    case 'TRX':
      return `https://tronscan.org/#/transaction/${transaction.value.reference_id}`
    case 'DOGE':
      return `https://dogechain.info/tx/${transaction.value.reference_id}`
    case 'DASH':
      return `https://chainz.cryptoid.info/dash/tx.dws?${transaction.value.reference_id}.htm`
    case 'ZEC':
      return `https://chainz.cryptoid.info/zec/tx.dws?${transaction.value.reference_id}.htm`
    case 'XMR':
      return `https://xmrchain.net/tx/${transaction.value.reference_id}`
    case 'BSC':
      return `https://bscscan.com/tx/${transaction.value.reference_id}`
    case 'BNB':
      return `https://bscscan.com/tx/${transaction.value.reference_id}`
    case 'SOL':
      return `https://explorer.solana.com/tx/${transaction.value.reference_id}`
    case 'ADA':
      return `https://explorer.cardano.org/en/transaction?id=${transaction.value.reference_id}`
    case 'DOT':
      return `https://polkascan.io/polkadot/transaction/${transaction.value.reference_id}`
    case 'KSM':
      return `https://polkascan.io/kusama/transaction/${transaction.value.reference_id}`

    default:
      return null
  }
})
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
            >{{ transaction?.type }}</BaseTag
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
          {{
            transaction?.wallet?.type === 'FIAT'
              ? formatPrice(transaction?.amount, transaction?.wallet?.currency)
              : transaction?.amount + ' ' + transaction?.wallet?.currency
          }}
        </div>
        <div class="flex flex-col">
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Total Fee') }}:</label
          >
          {{
            transaction?.wallet?.type === 'FIAT'
              ? formatPrice(
                  transaction?.fee ?? 0,
                  transaction?.wallet?.currency,
                )
              : (transaction?.fee ?? 0) + ' ' + transaction?.wallet?.currency
          }}
        </div>
        <div
          class="flex flex-col"
          v-if="
            transaction?.type === 'WITHDRAW' &&
            transaction?.wallet?.type === 'FIAT'
          "
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
        <div v-if="transactionChainLink && transaction?.reference_id">
          <h2
            class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
          >
            {{ $t('Blockchain Transaction') }}:
          </h2>
          <a
            :href="transactionChainLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-500 hover:underline"
          >
            {{ transaction?.reference_id }}
          </a>
        </div>
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

      <!-- Custom Data Section -->
      <div
        v-if="transaction?.metadata?.custom_data"
        class="p-4 border rounded-md dark:border-gray-600 mb-6"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('Withdraw Details') }}:
        </h2>
        <div class="grid gap-5 grid-cols-3">
          <template
            v-for="(item, index) in transaction?.metadata?.custom_data"
            :key="index"
          >
            <div>
              <label
                class="text-sm font-semibold text-gray-600 dark:text-gray-200"
              >
                {{ item.title }}:
              </label>
              <template
                v-if="item.type === 'input' || item.type === 'textarea'"
              >
                <p>{{ item.value }}</p>
              </template>
              <template v-else-if="item.type === 'file upload'">
                <img loading="lazy" :src="item.value" height="180" />
              </template>
            </div>
          </template>
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
