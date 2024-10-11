<script setup lang="ts">
import type { User } from '~~/types'
const route = useRoute()
const sessionId = route.query.session_id
const isLoading = ref(true)
const paymentStatus = ref(null)
const lineItems = ref([])
const userStore = useUserStore()
const user = userStore.getProfile as User
const { depositFiat } = useWallet()
const walletStore = useWalletStore()

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})
onMounted(async () => {
  try {
    const response = await fetch(`/api/ipn/stripe/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
      }),
    })

    const result = await response.json()
    paymentStatus.value = result.payment_status
    lineItems.value = result.line_items.map((item: any) => ({
      id: item.id,
      description: item.description,
      currency: item.currency.toUpperCase(),
      amount: item.amount_subtotal / 100,
    }))

    if (paymentStatus.value === 'paid' && lineItems.value[0]) {
      // Make a transaction after a successful payment
      const transaction = {
        type: 'DEPOSIT',
        amount: lineItems.value[0].amount,
        fee: lineItems.value[1].amount,
        reference_id: sessionId,
        status: 'COMPLETED',
        metadata: {
          method: 'STRIPE',
        },
        description: `Deposit of ${lineItems.value[0].amount} ${lineItems.value[0].currency} to ${user?.first_name} ${user?.last_name} wallet`,
      }
      await depositFiat(transaction as any, lineItems.value[0].currency)
      await walletStore.fetchWallets()
    }
  } catch (error) {
    console.error(error)
    paymentStatus.value = 'failed'
  } finally {
    isLoading.value = false
  }
})

const total = computed(() => {
  return lineItems.value.reduce((acc, item) => {
    return acc + item.amount
  }, 0)
})
</script>
<template>
  <div v-if="isLoading">
    <div class="my-auto text-center flex-col justify-center space-y-5">
      <BaseIconBox size="2xl" shape="full" color="info">
        <Icon name="svg-spinners:blocks-shuffle-3" class="h-12 w-12" />
      </BaseIconBox>
      <h1 class="text-2xl font-bold">{{ $t('Processing Payment') }}...</h1>
      <p>{{ $t('Please wait while we process your payment') }}.</p>
    </div>
  </div>
  <div v-else>
    <div
      v-if="paymentStatus === 'paid'"
      class="my-auto text-center flex-col justify-center space-y-5"
    >
      <div class="flex justify-center">
        <TairoCheckAnimated color="success" size="lg" />
      </div>
      <h1 class="text-2xl font-bold">{{ $t('Payment Successful') }}!</h1>
      <p>
        {{
          $t(
            'Your payment has been processed successfully. Here are the details',
          )
        }}:
      </p>
      <div>
        <BaseCard>
          <div class="overflow-hidden font-sans">
            <div>
              <div
                class="border-muted-200 dark:border-muted-700 flex flex-col justify-between gap-y-8 border-b p-8 sm:flex-row sm:items-center"
              >
                <BaseHeading as="h3" size="md" weight="medium" lead="none">
                  Order #{{ sessionId }}
                </BaseHeading>
              </div>
              <div class="flex flex-col">
                <table
                  class="divide-muted-200 dark:divide-muted-700 min-w-full divide-y"
                >
                  <thead class="font-sans">
                    <tr>
                      <th
                        scope="col"
                        class="text-muted-400 py-3.5 pe-3 ps-4 text-left text-xs font-medium uppercase sm:ps-6"
                      >
                        {{ $t('Description') }}
                      </th>
                      <th
                        scope="col"
                        class="text-muted-400 hidden px-3 py-3.5 text-start text-xs font-medium uppercase sm:table-cell"
                      >
                        {{ $t('Currency') }}
                      </th>
                      <th
                        scope="col"
                        class="text-muted-400 py-3.5 pe-4 ps-3 text-center text-xs font-medium uppercase sm:pe-6 md:pe-0"
                      >
                        {{ $t('Amount') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="font-sans">
                    <tr
                      v-for="(item, index) in lineItems"
                      :key="index"
                      class="border-muted-200 dark:border-muted-700"
                      :class="{
                        'border-b': index !== lineItems.length - 1,
                      }"
                    >
                      <td class="py-4 pe-3 ps-4 text-sm sm:ps-6 text-start">
                        <div
                          class="text-muted-800 dark:text-muted-100 font-medium"
                        >
                          {{ item.description }}
                        </div>
                        <div class="text-muted-400 mt-0.5 text-xs">
                          {{ formatPrice(item.amount, item.currency) }}
                        </div>
                      </td>
                      <td
                        class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-start text-sm sm:table-cell"
                      >
                        {{ item.currency }}
                      </td>
                      <td
                        class="text-muted-400 hidden px-3 py-4 text-center text-sm sm:table-cell"
                      >
                        {{ formatPrice(item.amount, item.currency) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
            <div
              class="border-t border-muted-200 dark:border-muted-700 px-8 py-5 sm:px-6"
            >
              <strong>{{ $t('Congratulations') }}!</strong>
              {{ $t('You have successfully deposited') }}
              {{ formatPrice(total, lineItems[0].currency) }}
              {{ $t('to your') }} {{ lineItems[0].currency }}
              {{ $t('wallet') }}.
            </div>
          </div>
        </BaseCard>
      </div>
      <BaseButtonAction :to="`/user/${flutter ? 'flutter/' : ''}wallets/fiat`">
        <Icon name="lucide:arrow-left" class="h-3 w-3" />
        <span>{{ $t('Go Back') }}</span>
      </BaseButtonAction>
    </div>
    <div v-else>
      <BaseIconBox size="2xl" shape="full" color="danger">
        <Icon name="line-md:close" class="h-16 w-16" />
      </BaseIconBox>
      <h1>{{ $t('Payment Failed') }}!</h1>
      <p>
        {{
          $t(
            'There was an issue processing your payment. Please try again later',
          )
        }}
        .
      </p>
    </div>
  </div>
</template>
