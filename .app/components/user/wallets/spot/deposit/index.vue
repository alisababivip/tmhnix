<script setup lang="ts">
import Qrcode from 'vue-qrcode'
import type { ExchangeTransaction } from '~~/types'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()
const currency = route.params.currency.toUpperCase()
const walletStore = useWalletStore()
const {
  getSpotTransaction,
  cancelSpotDepositTransaction,
  createSpotDepositTransaction,
} = useWallet()

const selectedChain = ref(null)
const transactionHash = ref('')
const step = ref(1)

onMounted(async () => {
  await walletStore.fetchWallet(currency, 'SPOT')
  if (!walletStore.wallet) {
    router.push(
      `/user/${
        props.flutter ? 'flutter/' : ''
      }wallets/spot/${currency.toLowerCase()}`,
    )
  }
})

const wallet = computed(() => walletStore.wallet)
const depositAddress = computed(() =>
  selectedChain.value
    ? wallet.value.addresses[selectedChain.value].address
    : '',
)
const depositTag = computed(() =>
  selectedChain.value ? wallet.value.addresses[selectedChain.value].tag : '',
)

// Accept the deposit rules and move to the next step
const acceptRules = () => {
  step.value = 2
}

const submitTransaction = async () => {
  if (transactionHash.value) {
    try {
      const response = await createSpotDepositTransaction(
        wallet.value?.id,
        transactionHash.value,
        selectedChain.value,
      )

      if (response.status === 'success') {
        startCountdown()
      } else if (response.status === 'fail') {
        if (response.error.message === 'Transaction already exists') {
          depositStatus.value = 'USED'
        } else {
          depositStatus.value = 'INVALID'
        }
      }
    } catch (e) {
      if (e.error.message === 'Transaction already exists') {
        depositStatus.value = 'USED'
      } else {
        depositStatus.value = 'INVALID'
      }
    }
    step.value = 3
  }
}

const remainingSeconds = ref(1800)

const startCountdown = () => {
  remainingSeconds.value = 1800 // 30 minutes in seconds
  countdownWorker.postMessage(remainingSeconds.value)

  countdownWorker.onmessage = (event) => {
    if (event.data === 'CHECK_TRANSACTION') {
      getTransactionStatus()
      return
    }

    if (event.data === 'EXPIRED') {
      depositStatus.value = 'EXPIRED'
      return
    }

    remainingSeconds.value = event.data
  }
}

onUnmounted(() => {
  countdownWorker.terminate()
})

const remainingTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const { toast } = useUtils()

const copyAddress = () => {
  navigator.clipboard.writeText(depositAddress.value).then(
    () => {
      toast.info('Address copied to clipboard')
    },
    (err) => {
      toast.warning('Failed to copy address to clipboard')
    },
  )
}

const transaction = ref<ExchangeTransaction>(null)
const depositStatus = ref('PENDING')

async function getTransactionStatus() {
  try {
    const response = await getSpotTransaction(transactionHash.value)

    if (response.status === 'fail') {
      depositStatus.value = 'FAILED'
      return
    }
    if (response.data.result) {
      transaction.value = response.data.result
      depositStatus.value = response.data.result.status
    }
  } catch (error) {
    depositStatus.value = 'FAILED'
  }
}

const countdownWorker = new Worker(
  URL.createObjectURL(
    new Blob(
      [
        `
self.addEventListener('message', function (e) {
  let remainingSeconds = e.data
  const intervalId = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(intervalId)
      postMessage('EXPIRED')
      return
    }

    remainingSeconds--

    // Check transaction every 30 seconds
    if (remainingSeconds % 20 === 0) {
      postMessage('CHECK_TRANSACTION')
    }

    postMessage(remainingSeconds)
  }, 1000)
}, false)
    `,
      ],
      { type: 'text/javascript' },
    ),
  ),
)

async function cancelDeposit() {
  const response = await cancelSpotDepositTransaction(transactionHash.value)
  toast.response(response)
  if (response.status === 'success') {
    countdownWorker.terminate() // Terminate the worker
    depositStatus.value = 'CANCELLED'
    router.push(
      `/user/${
        props.flutter ? 'flutter/' : ''
      }wallets/spot/${currency.toLowerCase()}`,
    )
  }
}

const selectedChainOptions = computed(() => {
  const options = wallet.value?.addresses
    ? Object.keys(wallet.value.addresses).map((key) => key)
    : []
  return options
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="xl"> {{ currency }} {{ $t('Deposit') }} </BaseHeading>
    </template>
    <template #right>
      <div>
        <BaseButton
          :to="`/user/${
            flutter ? 'flutter/' : ''
          }wallets/spot/${currency.toLowerCase()}`"
          color="muted"
          flavor="pastel"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4" />
          <span>{{ $t('Cancel') }}</span>
        </BaseButton>
      </div>
    </template>
    <!-- Step 1: Show Deposit Rules -->
    <div v-if="step === 1" class="space-y-5">
      <BaseHeading
        as="h3"
        size="2xl"
        weight="bold"
        class="text-muted-800 dark:text-white"
      >
        {{ $t('Deposit Instructions') }}
      </BaseHeading>
      <ul class="list-disc pl-8">
        <li>
          <strong>{{ $t('Time Limit') }}:</strong>
          {{
            $t(
              'You have 30 minutes to complete the deposit after selecting a chain',
            )
          }}.
        </li>
        <li>
          <strong>{{ $t('Select Chain') }}:</strong>
          {{ $t('Choose the desired blockchain network for your deposit') }}.
        </li>
        <li>
          <strong>{{ $t('Send Funds') }}:</strong>
          {{
            $t(
              'You will receive a deposit address and a QR code. Send your funds to this address',
            )
          }}.
        </li>
        <li>
          <strong>{{ $t('Enter Transaction Hash') }}:</strong>
          {{
            $t(
              'After sending the funds, enter the transaction hash for verification',
            )
          }}.
        </li>
        <li>
          <strong>{{ $t('Verification') }}:</strong>
          {{
            $t(
              'The transaction will be verified within 30 minutes. Please do not refresh or leave the page',
            )
          }}.
        </li>
      </ul>
      <BaseButton color="primary" @click="acceptRules">
        {{ $t('Next') }}
        <Icon name="ph:arrow-right-bold" class="h-4 w-4 ml-2" />
      </BaseButton>
    </div>

    <!-- Step 2: Select Chain and Show Address -->
    <div v-if="step === 2" class="space-y-5 min-h-screen pb-20">
      <div>
        <BaseHeading
          as="h3"
          size="2xl"
          weight="bold"
          class="text-muted-800 dark:text-white items-center flex"
        >
          <Icon
            name="line-md:loading-alt-loop"
            class="h-6 w-6 mr-2"
            v-if="!selectedChain"
          />
          <Icon name="line-md:confirm-circle" class="h-6 w-6 mr-2" v-else />
          {{ $t('Select Chain') }}
        </BaseHeading>
        <BaseListbox
          class="max-w-sm mt-5 pl-8 z-50"
          v-model="selectedChain"
          :items="selectedChainOptions"
          placeholder="Select a chain"
          shape="rounded"
        />
      </div>
      <template v-if="selectedChain">
         <hr class="border-gray-200 dark:border-gray-700" />
        <BaseHeading
          as="h3"
          size="2xl"
          weight="bold"
          class="text-muted-800 dark:text-white"
        >
          <Icon name="line-md:uploading-loop" class="h-6 w-6 mr-2" />
          {{ $t('Send Transaction') }}
        </BaseHeading>
        <div class="grid gap-5 grid-cols-1 sm:grid-cols-12 pl-8">
          <BaseCard
            class="p-5 col-span-1 sm:col-span-8 md:col-span-9 lg:col-span-10"
          >
            <div class="flex items-end gap-5">
              <div class="w-full flex gap-5">
                <div class="w-full">
                  <BaseInput
                    v-model="depositAddress"
                    shape="rounded"
                    type="text"
                    icon="ph:copy-fill"
                    label="Deposit to the address"
                    disabled
                  />
                </div>
                <div class="w-full" v-if="depositTag">
                  <BaseInput
                    v-model="depositTag"
                    shape="rounded"
                    type="text"
                    icon="ph:copy-fill"
                    label="Use this tag"
                    disabled
                  />
                </div>
              </div>
              <BaseButton color="info" flavor="outline" @click="copyAddress">{{
                $t('Copy')
              }}</BaseButton>
            </div>
          </BaseCard>
          <qrcode
            class="col-span-1 sm:col-span-4 md:col-span-3 lg:col-span-2"
            type="image/webp"
            :color="{ dark: '#000000ff', light: '#ffffffff' }"
            :value="depositAddress"
            :options="{ width: 100 }"
          ></qrcode>
        </div>

         <hr class="border-gray-200 dark:border-gray-700" />
        <BaseHeading
          as="h3"
          size="2xl"
          weight="bold"
          class="text-muted-800 dark:text-white"
        >
          <Icon name="line-md:loading-twotone-loop" class="h-6 w-6 mr-2" />
          {{ $t('Submit Transaction') }}
        </BaseHeading>
        <div class="pl-8 space-y-5">
          <p>
            {{
              $t(
                'After you have sent the transaction, please enter the transaction hash below',
              )
            }}.
          </p>
          <BaseInput
            v-model="transactionHash"
            id="transactionHash"
            shape="rounded"
            label="Enter the transaction hash:"
            placeholder="Enter the transaction hash..."
          />

          <div>
            <label for="guide" class="text-muted-800 dark:text-white"
              >{{ $t('Example of a transaction hash') }}:</label
            >
            <img
              id="guide"
              src="/img/guide/deposit/txHash.png"
              class="rounded-lg shadow"
            />
          </div>
        </div>
         <hr class="border-gray-200 dark:border-gray-700" />
        <div>
          <BaseButton
            class="w-full"
            color="success"
            @click="submitTransaction"
            :disabled="!transactionHash"
            >{{ $t('Submit') }}</BaseButton
          >
        </div>
      </template>
    </div>

    <!-- Step 3: Waiting for Verification -->
    <div v-if="step === 3">
      <div
        v-if="depositStatus === 'PENDING'"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="info">
            <Icon name="svg-spinners:blocks-shuffle-3" class="h-12 w-12" />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">
            {{ $t('Waiting for Verification') }}
          </h1>
          <p>
            {{
              $t(
                'Your transaction is currently pending and is waiting to be verified. Please refrain from closing the modal or refreshing the page until the verification process is complete. This may take a few moments, but rest assured that we are working diligently to ensure that your transaction is processed as quickly and securely as possible. Thank you for your patience and cooperation',
              )
            }}.
          </p>
          <p>{{ $t('Remaining time') }}: {{ remainingTime }}</p>
          <BaseButtonAction
            @click="cancelDeposit"
            color="danger"
            flavor="outline"
          >
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Cancel') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div
        v-if="depositStatus === 'CANCELLED'"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="danger">
            <Icon
              name="line-md:sunny-filled-loop-to-moon-alt-filled-loop-transition"
              class="h-12 w-12"
            />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">{{ $t('Transaction Cancelled') }}</h1>
          <p>
            {{
              $t(
                "We're sorry to inform you that your transaction has been cancelled. We apologize for any inconvenience this may have caused. Please try again at your earliest convenience. If you continue to experience difficulties with your transaction, please contact our customer support team for assistance. Thank you for your understanding",
              )
            }}.
          </p>
          <BaseButtonAction
            :to="`/user/${
              flutter ? 'flutter/' : ''
            }wallets/spot/${currency.toLowerCase()}`"
          >
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div
        v-if="depositStatus === 'FAILED'"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="danger">
            <Icon
              name="line-md:sunny-filled-loop-to-moon-alt-filled-loop-transition"
              class="h-12 w-12"
            />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">{{ $t('Transaction Failed') }}</h1>
          <p>
            {{
              $t(
                "We're sorry to inform you that your transaction has failed. Please double-check that the information you entered is correct and try again. If you continue to experience difficulties, please contact our customer support team for assistance",
              )
            }}.
          </p>
          <BaseButtonAction
            :to="`/user/${
              flutter ? 'flutter/' : ''
            }wallets/spot/${currency.toLowerCase()}`"
          >
            <Icon name="line-md:close" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div
        v-if="depositStatus === 'USED'"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="danger">
            <Icon name="ph:check-circle-duotone" class="h-12 w-12" />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">{{ $t('Transaction Used') }}</h1>
          <p>
            {{
              $t(
                "We're sorry, but the transaction hash you entered is invalid or has already been used. Please double-check that the information you entered is correct and try again. If you believe there has been an error, please contact our customer support team for assistance",
              )
            }}.
          </p>
          <BaseButtonAction
            :to="`/user/${
              flutter ? 'flutter/' : ''
            }wallets/spot/${currency.toLowerCase()}`"
          >
            <Icon name="line-md:close" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div
        v-if="depositStatus === 'COMPLETED'"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="success">
            <Icon name="ph:check-circle-duotone" class="h-12 w-12" />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">{{ $t('Transaction Verified') }}</h1>
          <p>
            {{
              $t(
                'Congratulations! Your transaction has been successfully verified and completed. Thank you for choosing our service to carry out your transaction. If you have any questions or concerns regarding your transaction, please do not hesitate to contact our customer support team for assistance. Thank you for your trust in us, and we look forward to serving you again in the future',
              )
            }}.
          </p>
          <BaseButtonAction
            :to="`/user/${
              flutter ? 'flutter/' : ''
            }wallets/spot/${currency.toLowerCase()}`"
          >
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div
        v-if="depositStatus === 'EXPIRED'"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="danger">
            <Icon
              name="line-md:sunny-filled-loop-to-moon-alt-filled-loop-transition"
              class="h-12 w-12"
            />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">{{ $t('Transaction Expired') }}</h1>
          <p>
            {{
              $t(
                "We're sorry to inform you that your transaction has expired. This may be due to inactivity or an issue with your payment method. Please double-check that the information you entered is correct and try again. If you continue to experience difficulties, please contact our customer support team for assistance",
              )
            }}.
          </p>
          <BaseButtonAction
            :to="`/user/${
              flutter ? 'flutter/' : ''
            }wallets/spot/${currency.toLowerCase()}`"
          >
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
      <div
        v-if="depositStatus === 'TIMEOUT'"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="danger">
            <Icon
              name="line-md:sunny-filled-loop-to-moon-alt-filled-loop-transition"
              class="h-12 w-12"
            />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">{{ $t('Transaction Timeout') }}</h1>
          <p>
            {{
              $t(
                "We're sorry to inform you that your transaction has timed out. This may be due to inactivity or an issue with your payment method. Please double-check that the information you entered is correct and try again. If you continue to experience difficulties, please contact our customer support team for assistance",
              )
            }}.
          </p>
          <BaseButtonAction
            :to="`/user/${
              flutter ? 'flutter/' : ''
            }wallets/spot/${currency.toLowerCase()}`"
          >
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>{{ $t('Go Back') }}</span>
          </BaseButtonAction>
        </div>
      </div>
    </div>
  </TairoContentWrapper>
</template>
