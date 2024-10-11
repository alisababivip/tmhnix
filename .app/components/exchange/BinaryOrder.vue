<script setup lang="ts">
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
const props = defineProps({
  currency: {
    type: String,
    required: true,
  },
  pair: {
    type: String,
    required: true,
  },
})

const marketStore = useMarketStore()
const userStore = useUserStore()
const isGeneratingFailed = ref(false)
const walletStore = useWalletStore()
const settingsStore = useSettingsStore()
const route = useRoute()
const { isPractice } = route.query
const { createSpotWallet } = useWallet()
async function createWallet(currency: string) {
  try {
    const data = await createSpotWallet(currency as string)
    walletStore.wallet = data.data.result
  } catch (error) {
    isGeneratingFailed.value = true
  }
}

const pairWallet = computed(() => {
  return walletStore.wallet || null
})

const activeItem = ref('RISE_FALL')
const isActive = (menuItem: string) => {
  return activeItem.value === menuItem
}
const setActive = (menuItem: string) => {
  activeItem.value = menuItem
}

const isOrdering = computed(() => marketStore.loading)

const bestAsk = computed(() => {
  return marketStore.bestAsk
})

const minAmount = computed(() => {
  return props.pair === 'USDT'
    ? 1
    : marketStore.selectedMarket?.metadata?.limits?.amount?.min
})

const amountPrecision = computed(() => {
  const precision =
    Number(marketStore.selectedMarket?.metadata?.precision?.amount) || 4
  return Math.abs(precision)
})

const { createBinaryOrder } = useExchange()
const { toast } = useUtils()
async function storeOrder(side: string) {
  if (!userStore.isLoggedIn) {
    return
  }
  if (marketStore.order.amount === 0 || marketStore.order.amount === null) {
    toast.dangerText('Please enter an amount')
    return
  }

  const order: any = {
    market: marketStore.selectedMarket?.id,
    price: bestAsk.value,
    amount: marketStore.order.amount,
    side: side,
    type: activeItem.value,
    symbol: `${props.currency}/${props.pair}`,
    closed_at: marketStore.order.closed_at,
    profit: Number(settingsStore.settings?.binary_trading_profit_percentage),
  }
  if (isPractice) {
    order['is_demo'] = true
  }

  try {
    const response = await createBinaryOrder(order)
    toast.successText('Order placed successfully')
    marketStore.order.amount = 0
    marketStore.binaryPositions.push(response.data.result)

    if (!isPractice) {
      walletStore.wallet.balance -= order.amount
    }
  } catch (error) {
    toast.danger(error as any)
  }
}

const isExpirationModalOpen = ref(false)
const currentTime = ref(new Date())
const selectedTimezone = ref('Etc/UTC')

function toUtcTime(date: Date | number): Date {
  return zonedTimeToUtc(date, selectedTimezone.value)
}

function toZonedTime(date: Date | number): Date {
  return utcToZonedTime(date, selectedTimezone.value)
}

function setExpirationDate(date: Date) {
  const timeString = toTimeString(date)
  selectedExpirationTimeString.value = timeString
  marketStore.order.closed_at = date.getTime() // Save as timestamp
  isExpirationModalOpen.value = false
}

watch(marketStore.binaryExpirationTimes, () => {
  // Get the next available expiration time
  const nextTime = marketStore.binaryExpirationTimes[0]
  if (nextTime && nextTime.getTime() >= marketStore.order.closed_at) {
    // Use the timestamp directly
    marketStore.order.closed_at = nextTime.getTime()
  }
})

// Computed property to calculate profit percentage
const profitPercentage = computed(() => {
  return settingsStore.settings?.binary_trading_profit_percentage
})

function getRemainingTime(date: Date): string {
  const remainingSec = Math.max(
    0,
    Math.floor(
      (date.getTime() - toUtcTime(currentTime.value).getTime()) / 1000,
    ),
  )
  const min = Math.floor(remainingSec / 60)
  const sec = remainingSec % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function toTimeString(time: Date | number | null): string {
  if (time === null) return ''
  const date = toZonedTime(time instanceof Date ? time : new Date(time))
  return date.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
}

function isSelectedTime(time: Date) {
  return time.getTime() === marketStore.order.closed_at
}

const selectedExpirationTimeString = ref('')

onMounted(async () => {
  if (userStore.isLoggedIn && !isPractice) {
    if (!walletStore.wallet || walletStore.wallet?.currency !== props.pair) {
      await walletStore.fetchWallet(props.pair, 'SPOT')
    }
    if (
      walletStore.wallet === undefined ||
      walletStore.wallet === null ||
      walletStore.wallet?.currency !== props.pair
    ) {
      await createWallet(props.pair)
    }
  }
})

const workerCode = `
  let expirationTimes = [];

  function generateExpirationDates() {
    expirationTimes = [];
    const now = new Date(); // Start with the current UTC time

    // Round to the next full minute
    now.setSeconds(0);
    now.setMilliseconds(0);
    now.setMinutes(now.getMinutes() + 1);

    let nextTime = now;

    const expirationIntervals = [
      { count: 5, interval: 1 },
      { count: 5, interval: 5 },
      { count: 2, interval: 15 },
      { count: 1, interval: 30 },
      { count: 1, interval: 60 },
    ];

    for (const { count, interval } of expirationIntervals) {
      for (let i = 0; i < count; i++) {
        nextTime = new Date(nextTime.getTime() + interval * 60 * 1000);
        expirationTimes.push(nextTime); // Store in UTC
      }
    }
  }

  self.onmessage = (event) => {
    switch (event.data.type) {
      case 'updateCurrentTime':
        setInterval(() => {
          const currentTime = new Date();
          self.postMessage({ type: 'updateCurrentTime', currentTime });
        }, 1000);
        break;
      case 'updateExpirationDates':
        setInterval(() => {
          const now = new Date();

          // Remove expired dates and regenerate them
          if (expirationTimes[0] && now >= expirationTimes[0]) {
            expirationTimes.shift();
            generateExpirationDates();
          }

          self.postMessage({ type: 'updateExpirationDates', expirationTimes });
        }, 1000);
        break;
    }
  };

  // Initial generation of expiration dates
  generateExpirationDates();
`

const blob = new Blob([workerCode], { type: 'text/javascript' })
const worker = new Worker(URL.createObjectURL(blob))

worker.onmessage = (event) => {
  switch (event.data.type) {
    case 'updateCurrentTime':
      currentTime.value = toZonedTime(event.data.currentTime)
      break
    case 'updateExpirationDates':
      marketStore.binaryExpirationTimes = event.data.expirationTimes
      if (
        marketStore.binaryExpirationTimes.length > 0 &&
        marketStore.binaryExpirationTimes[0].getTime() >=
          marketStore.order.closed_at
      ) {
        const initialTime = marketStore.binaryExpirationTimes[0].getTime()
        marketStore.order.closed_at = initialTime
        selectedExpirationTimeString.value = toTimeString(initialTime)
      }
      break
  }
}

// Start the intervals in the worker
worker.postMessage({ type: 'updateCurrentTime' })
worker.postMessage({ type: 'updateExpirationDates' })

const showOrderContent = ref(false)

const toggleContent = (side: string) => {
  showOrderContent.value = !showOrderContent.value
}
</script>

<template>
  <div
    class="bg-white shadow w-full"
    :class="{
      'rounded-l-lg h-full dark:bg-gray-900': $viewport.isGreaterOrEquals('sm'),
      ' absolute bottom-0 dark:bg-gray-800  z-50': $viewport.isLessThan('sm'),
      'h-auto max-h-full': showOrderContent && $viewport.isLessThan('sm'),
    }"
  >
    <div
      class="flex w-full relative px-2 py-3"
      v-if="$viewport.isLessThan('sm')"
    >
      <BaseButton
        shape="rounded"
        shadow="flat"
        class="w-full"
        @click="toggleContent"
        condensed
      >
        <span class="text-md font-heading">
          <Icon
            :name="`line-md:chevron-down`"
            class="h-4 w-4"
            v-if="showOrderContent"
          />
          <span v-else>
            <Icon :name="`line-md:chevron-up`" class="h-4 w-4" />
            {{ $t('Order') }}</span
          >
        </span>
      </BaseButton>
    </div>
    <div
      class="h-full dark:bg-gray-900"
      :class="{
        'pb-5': $viewport.isLessThan('sm'),
      }"
      v-show="showOrderContent || $viewport.isGreaterOrEquals('sm')"
    >
      <div
        class="w-full bg-gray-100 dark:bg-gray-800 rounded-tl-lg"
        v-if="$viewport.isGreaterOrEquals('sm')"
      >
        <ul
          id="myTab"
          class="nf flex-cols -mb-px flex overflow-x-hidden text-center rounded-tl-lg"
          role="tablist"
        >
          <li role="presentation">
            <button
              id="rise-fall-tab"
              class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
              type="button"
              role="tab"
              aria-controls="rise-fall"
              :aria-selected="isActive('RISE_FALL') ? true : false"
              :class="!isActive('RISE_FALL') ? 'inactive-tab' : 'active-tab'"
              @click="setActive('RISE_FALL')"
            >
              {{ $t('RISE/FALL') }}
            </button>
          </li>
        </ul>
      </div>
      <div
        id="rise-fall"
        class="pt-1 h-[calc(100%-32px)] relative"
        :class="{ hidden: !isActive('RISE_FALL') }"
        role="tabpanel"
        aria-labelledby="rise-fall-tab"
      >
        <div class="space-y-2 pt-2">
          <div
            class="flex justify-between text-xs"
            :class="{
              'px-2 flex-col': $viewport.isGreaterOrEquals('sm'),
              'px-4 flex-row': $viewport.isLessThan('sm'),
            }"
          >
            <div class="text-gray-500 dark:text-gray-400">
              {{ $t('Balance') }}
            </div>
            <div v-if="isPractice" class="text-gray-700 dark:text-gray-200">
              {{ $t('Unlimited') }}
            </div>
            <div v-else class="text-gray-700 dark:text-gray-200">
              {{
                (pairWallet?.balance.toFixed(amountPrecision || 2) || 0) +
                ' ' +
                pair
              }}
            </div>
          </div>
          <div
            class="space-y-2"
            :class="{
              'px-2': $viewport.isGreaterOrEquals('sm'),
              'px-4': $viewport.isLessThan('sm'),
            }"
          >
            <BaseInput
              v-model="marketStore.order.amount"
              key="amount"
              shape="rounded"
              autocomplete="off"
              placeholder="Amount"
              type="number"
              :min="minAmount"
              :step="minAmount"
              :max="pairWallet?.balance || 0"
              :error="
                marketStore?.order?.amount > pairWallet?.balance
                  ? 'Insufficient balance'
                  : false
              "
            />
            <BaseInput
              v-model="selectedExpirationTimeString"
              key="closed_at"
              shape="rounded"
              autocomplete="off"
              placeholder="Expiration"
              type="text"
              readonly
              @click="isExpirationModalOpen = true"
              :class="{
                'cursor-pointer': !isExpirationModalOpen,
                'cursor-not-allowed': isExpirationModalOpen,
              }"
            />
            <div class="text-center">
              <div>
                <span class="text-gray-500 dark:text-gray-400">{{
                  $t('Profit')
                }}</span>
              </div>
              <div class="text-success-500">
                <span class="text-xl">+</span
                ><span class="text-4xl">{{ profitPercentage }}</span
                ><span class="text-xl">%</span>
              </div>
              <div class="text-success-500 text-md mt-2">
                +{{
                  Number(
                    (marketStore.order.amount * profitPercentage) / 100,
                  ).toFixed(2)
                }}
                {{ pair }}
              </div>
            </div>

            <div
              class="pt-5 w-full flex gap-3 justify-center items-center"
              :class="{
                'flex-col': $viewport.isGreaterOrEquals('sm'),
                'flex-row': $viewport.isLessThan('sm'),
              }"
            >
              <div
                :class="{
                  'w-32': $viewport.isGreaterOrEquals('md'),
                  'w-full': $viewport.isLessThan('md'),
                }"
                v-if="userStore.isLoggedIn"
              >
                <TairoButton
                  :disabled="
                    isOrdering ||
                    !marketStore.bestAsk ||
                    marketStore?.order?.amount > pairWallet?.balance ||
                    marketStore?.order?.amount < minAmount.value
                  "
                  :loading="isOrdering || !marketStore.bestAsk"
                  :isSquare="$viewport.isGreaterOrEquals('md') ? true : false"
                  key="buyButton"
                  shape="rounded"
                  shadow="flat"
                  class="w-full transition duration-300 ease-in-out transform hover:scale-110"
                  color="success"
                  @click="storeOrder('RISE')"
                  ><div
                    :class="{
                      'flex flex-col items-center':
                        $viewport.isGreaterOrEquals('md'),
                    }"
                  >
                    <Icon
                      name="ph:trend-up-duotone"
                      :class="{
                        'h-8 w-8': $viewport.isGreaterOrEquals('md'),
                        'h-5 w-5': $viewport.isLessThan('md'),
                      }"
                    />
                    <span
                      class="font-heading"
                      :class="{
                        'text-lg': $viewport.isGreaterOrEquals('md'),
                        'text-md': $viewport.isLessThan('md'),
                      }"
                    >
                      {{ $t('Rise') }}
                    </span>
                  </div>
                </TairoButton>
              </div>
              <div
                v-if="userStore.isLoggedIn"
                :class="{
                  'w-32': $viewport.isGreaterOrEquals('md'),
                  'w-full': $viewport.isLessThan('md'),
                }"
              >
                <TairoButton
                  :disabled="
                    isOrdering ||
                    !marketStore.bestAsk ||
                    marketStore?.order?.amount > pairWallet?.balance ||
                    marketStore?.order?.amount < minAmount.value
                  "
                  :loading="isOrdering || !marketStore.bestAsk"
                  :isSquare="$viewport.isGreaterOrEquals('md') ? true : false"
                  key="buyButton"
                  shape="rounded"
                  shadow="flat"
                  class="w-full transition duration-300 ease-in-out transform hover:scale-110"
                  color="red"
                  @click="storeOrder('FALL')"
                  ><div
                    :class="{
                      'flex flex-col items-center':
                        $viewport.isGreaterOrEquals('md'),
                    }"
                  >
                    <span
                      class="font-heading"
                      :class="{
                        'text-lg': $viewport.isGreaterOrEquals('md'),
                        'text-md': $viewport.isLessThan('md'),
                      }"
                    >
                      {{ $t('Fall') }}
                    </span>
                    <Icon
                      name="ph:trend-down-duotone"
                      :class="{
                        'h-8 w-8': $viewport.isGreaterOrEquals('md'),
                        'h-5 w-5': $viewport.isLessThan('md'),
                      }"
                    />
                  </div>
                </TairoButton>
              </div>

              <div
                v-else
                style="inset: 0px; border: 1px dashed rgba(243, 243, 243, 0.08)"
                class="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-md text-sm flex xs:flex-row sm:flex-col text-center justify-center"
              >
                <NuxtLink class="text-warning-500 mr-1" to="/login">{{
                  $t('Login')
                }}</NuxtLink>
                {{ $t('or') }}
                <NuxtLink class="text-warning-500 mx-1" to="/register">{{
                  $t('Register')
                }}</NuxtLink>
                {{ $t('to trade') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TairoModal
      :open="isExpirationModalOpen"
      size="sm"
      @close="isExpirationModalOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Select Expiration Time') }}
          </h3>

          <BaseButtonClose @click="isExpirationModalOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="mx-auto w-full text-center">
        <div class="mx-auto w-full text-center">
          <p>
            <span class="font-medium mr-2">{{ $t('Profit') }}</span>
            <span
              class="text-md font-medium bg-success-500 text-white rounded-md px-2 py-1"
              >{{ profitPercentage }}%</span
            >
          </p>
          <table class="table-fixed w-full">
            <thead>
              <tr>
                <th class="w-1/2 px-1 py-2">{{ $t('Time') }}</th>
                <th class="w-1/2 px-1 py-2">{{ $t('Remaining') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="time in marketStore.binaryExpirationTimes"
                :key="time"
                @click="setExpirationDate(time)"
                class="hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer border-gray-200 dark:border-gray-700"
                :class="{
                  'bg-info-200 dark:bg-info-900': isSelectedTime(time),
                  'border-b':
                    time !==
                    marketStore.binaryExpirationTimes[
                      marketStore.binaryExpirationTimes.length - 1
                    ],
                }"
              >
                <td class="px-1 py-1">{{ toTimeString(time) }}</td>
                <td class="px-1 py-1 flex items-center justify-center">
                  <Icon
                    name="ant-design:field-time-outlined"
                    class="h-5 w-5 inline-block mr-1"
                  />
                  <span
                    class="text-sm font-medium inline-block text-gray-500 dark:text-gray-400"
                    >{{ getRemainingTime(time) }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
