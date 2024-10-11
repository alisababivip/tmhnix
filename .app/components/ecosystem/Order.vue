<script setup lang="ts">
import { useEcosystemWalletStore } from '~~/store/extensions/ecosystem/wallets/user'
import { useEcoMarketStore } from '~~/store/extensions/ecosystem/market'
const ecoMarketStore = useEcoMarketStore()
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
const ecosystemWalletStore = useEcosystemWalletStore()
const wallets = computed(() => ecosystemWalletStore.wallets) as any
const { createWallet, createOrder, getTokens } = useEcosystem()
async function createEcoWallet(currency: string) {
  try {
    const response = await createWallet(currency as string)
    wallets.value[props.currency] = response.data.result
  } catch (error) {
    isGeneratingFailed.value = true
  }
}

const tokens: any = ref([])
const amountPrecision = computed(() => {
  const precision =
    Number(marketStore.selectedMarket?.metadata?.precision?.amount) || 4
  return Math.abs(precision)
})

const isLoading = ref(false)
onMounted(async () => {
  if (userStore.isLoggedIn) {
    isLoading.value = true
    if (ecosystemWalletStore.wallets.length === 0) {
      await ecosystemWalletStore.fetchWallets(false, false)
    }

    if (
      wallets.value[props.currency] === undefined ||
      wallets.value[props.currency] === null ||
      (wallets.value[props.currency] &&
        wallets.value[props.currency].type !== 'ECO')
    ) {
      await createEcoWallet(props.currency)
    }
    if (
      wallets.value[props.pair] === undefined ||
      wallets.value[props.pair] === null ||
      (wallets.value[props.pair] && wallets.value[props.pair].type !== 'ECO')
    ) {
      await createEcoWallet(props.pair)
    }
    isLoading.value = false
  }
  const response = await getTokens()
  if (response.status === 'success') {
    tokens.value = response.data.result
  }
})

const currencyWallet = computed(() => {
  return wallets.value[props.currency] || null
})

const pairWallet = computed(() => {
  return wallets.value[props.pair] || null
})

const activeItem = ref('SPOT')
const isActive = (menuItem: string) => {
  return activeItem.value === menuItem
}
const setActive = (menuItem: string) => {
  activeItem.value = menuItem
}

const type = computed(() => marketStore.order.type)
const isType = (menuItem: string) => {
  return type.value === menuItem
}
const setType = (menuItem: string) => {
  marketStore.order.type = menuItem
  marketStore.order.price =
    type.value === 'MARKET'
      ? 0
      : side.value === 'BUY'
        ? bestAsk.value
        : bestBid.value
}

const showOrderContent = ref(false)

const viewport = useViewport()
const selectedSide = ref('')
const toggleSide = (side: string) => {
  if (viewport.isLessThan('sm')) {
    if (selectedSide.value === side) {
      showOrderContent.value = !showOrderContent.value
      selectedSide.value = showOrderContent.value ? side : ''
    } else {
      showOrderContent.value = true
      selectedSide.value = side
    }
  }
  setSide(side)
}

const side = computed(() => marketStore.order.side)
const setSide = (button: string) => {
  marketStore.order.side = button
  marketStore.order.amount = 0
  marketStore.order.price =
    type.value === 'MARKET'
      ? 0
      : side.value === 'BUY'
        ? bestAsk.value
        : bestBid.value
  marketStore.order.percentage = 0
}

const isOrdering = ref(false)

const makerFee = computed(() => {
  return marketStore.selectedMarket?.metadata?.maker || 0
})

const takerFee = computed(() => {
  return marketStore.selectedMarket?.metadata?.taker || 0
})

const amount = computed(() => {
  return marketStore.order?.amount || 0
})

const minAmount = computed(() => {
  return marketStore.selectedMarket?.metadata?.limits?.amount?.min || 0
})

const minCost = computed(() => {
  return marketStore.selectedMarket?.metadata?.limits?.cost?.min || 0
})

const bestAsk = computed(() => {
  return marketStore.bestAsk
})

const bestBid = computed(() => {
  return marketStore.bestBid
})

const price = computed(() => {
  return isType('MARKET')
    ? marketStore.order.side === 'BUY'
      ? bestAsk.value
      : bestBid.value
    : marketStore.order.price || 0
})

watch(
  () => marketStore.order.percentage,
  (newVal) => {
    if (!userStore.isLoggedIn) return

    const isBuySide = marketStore.order.side === 'BUY'
    const availableBalance =
      wallets.value[isBuySide ? props.pair : props.currency]?.balance || 0

    const amountBeforeFees = isBuySide
      ? (availableBalance / price.value) * (newVal / 100)
      : availableBalance * (newVal / 100)

    marketStore.order.amount = Number(
      amountBeforeFees.toFixed(amountPrecision.value),
    )
  },
)

// Compute total fees
const totalFees = computed(() => {
  const feePercentage = side.value === 'BUY' ? takerFee.value : makerFee.value
  return (amount.value * price.value * feePercentage) / 100
})

// Compute total amount
const totalAmount = computed(() => {
  if (side.value === 'BUY') {
    return amount.value + totalFees.value
  }

  // Calculate the amount based on the selling price and then subtract the total fees
  return amount.value * price.value - totalFees.value
})

// Compute total cost
const totalCost = computed(() => {
  if (side.value === 'BUY') {
    return amount.value * price.value * (1 + takerFee.value / 100)
  }
  // For 'SELL', the cost is just the amount
  return amount.value
})

const { toast } = useUtils()
async function storeOrder() {
  if (!userStore.isLoggedIn) {
    toast.dangerText('Please login to place an order')
    return
  }
  if (isType('LIMIT') && marketStore.order.price === 0) {
    toast.dangerText('Please enter a price')
    return
  }
  if (marketStore.order.amount === 0) {
    toast.dangerText('Please enter an amount')
    return
  }

  if (
    side.value === 'BUY'
      ? totalCost.value > pairWallet.value.balance
      : totalCost.value > currencyWallet.value.balance
  ) {
    toast.dangerText('Insufficient balance')
    return
  }

  const price = isType('MARKET')
    ? side.value === 'BUY'
      ? bestAsk.value
      : bestBid.value
    : marketStore.order.price

  if (price === 0) {
    toast.dangerText('Please enter a price')
    return
  }

  const order = {
    symbol: `${props.currency}/${props.pair}`,
    amount: marketStore.order.amount,
    price: price,
    type: marketStore.order.type,
    side: marketStore.order.side,
  }

  isOrdering.value = true
  try {
    const response = await createOrder(
      order.symbol,
      order.type,
      order.side,
      order.amount,
      order.price,
    )
    toast.response(response)
    if (response.status === 'success') {
      marketStore.order.amount = 0
      marketStore.order.percentage = 0
      ecoMarketStore.orders.push(response.data.result)
      await ecosystemWalletStore.fetchWallets()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isOrdering.value = false
}
const isDeveloping = ref(true)
</script>

<template>
  <div
    class="bg-white shadow w-full"
    :class="{
      'rounded-l-lg h-full dark:bg-gray-900': $viewport.isGreaterOrEquals('sm'),
      'absolute bottom-0 dark:bg-gray-800': $viewport.isLessThan('sm'),
      'h-[400px]': showOrderContent && $viewport.isLessThan('sm'),
    }"
  >
    <div
      class="flex w-full relative px-2 py-3"
      v-if="$viewport.isLessThan('sm')"
    >
      <!-- Buy Button -->
      <BaseButton
        shape="straight"
        shadow="flat"
        class="w-1/2 transition-all duration-300 translate-x-2 hover:translate-x-3 rounded-tl-md rounded-bl-md"
        :color="
          selectedSide === 'BUY' ||
          ($viewport.isLessThan('sm') && selectedSide === '')
            ? 'success'
            : 'muted'
        "
        @click="toggleSide('BUY')"
        style="clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%)"
      >
        <span class="text-md font-heading">{{ $t('Buy') }}</span>
      </BaseButton>

      <!-- Sell Button -->
      <BaseButton
        shape="straight"
        shadow="flat"
        class="w-1/2 transition-all duration-300 -translate-x-2 hover:-translate-x-3 rounded-tr-md rounded-br-md"
        :color="
          selectedSide === 'SELL' ||
          ($viewport.isLessThan('sm') && selectedSide === '')
            ? 'danger'
            : 'muted'
        "
        @click="toggleSide('SELL')"
        style="clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%)"
      >
        <span class="text-md font-heading">{{ $t('Sell') }}</span>
      </BaseButton>
    </div>
    <div
      class="h-full dark:bg-gray-900"
      :class="{
        'pt-1': $viewport.isLessThan('sm'),
      }"
      v-show="showOrderContent || $viewport.isGreaterOrEquals('sm')"
    >
      <div
        class="w-full bg-gray-100 dark:bg-gray-800 rounded-tl-lg"
        v-if="$viewport.isGreaterOrEquals('sm') && !isDeveloping"
      >
        <ul
          id="myTab"
          class="nf flex-cols -mb-px flex overflow-x-hidden text-center rounded-tl-lg"
          role="tablist"
        >
          <li role="presentation">
            <button
              id="spot-tab"
              class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
              type="button"
              role="tab"
              aria-controls="spot"
              :aria-selected="isActive('SPOT') ? true : false"
              :class="!isActive('SPOT') ? 'inactive-tab' : 'active-tab'"
              @click="setActive('SPOT')"
            >
              {{ $t('Spot') }}
            </button>
          </li>
          <li role="presentation">
            <button
              id="grid-tab"
              class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
              type="button"
              role="tab"
              aria-controls="grid"
              :aria-selected="isActive('GRID') ? true : false"
              :class="!isActive('GRID') ? 'inactive-tab' : 'active-tab'"
              @click="setActive('GRID')"
            >
              {{ $t('Grid') }}
            </button>
          </li>
        </ul>
      </div>
      <div
        id="spot"
        class="relative"
        :class="{
          hidden: !isActive('SPOT'),
          'pt-1 h-[calc(100%-32px)] ': !isDeveloping,
          'rounded-tl-lg h-full ': isDeveloping,
        }"
        role="tabpanel"
        aria-labelledby="spot-tab"
      >
        <div
          class="w-full bg-gray-100 dark:bg-gray-800 nf flex-cols -mb-px flex overflow-x-hidden text-center"
          :class="{
            'rounded-tl-lg': isDeveloping,
          }"
        >
          <button
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            type="button"
            :class="
              !isType('MARKET') ? 'inactive-tab' : 'active-tab active-sub-tab'
            "
            @click="setType('MARKET')"
          >
            {{ $t('Market') }}
          </button>
          <button
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            type="button"
            :class="
              !isType('LIMIT') ? 'inactive-tab' : 'active-tab active-sub-tab'
            "
            @click="setType('LIMIT')"
          >
            {{ $t('Limit') }}
          </button>
          <!-- <button
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            type="button"
            :class="
              !isType('STOP_LIMIT')
                ? 'inactive-tab'
                : 'active-tab active-sub-tab'
            "
            @click="setType('STOP_LIMIT')"
          >
            {{ $t('Stop Limit') }}
          </button> -->
        </div>

        <div class="space-y-2 pt-2">
          <div
            class="flex w-full relative"
            v-if="$viewport.isGreaterOrEquals('sm')"
          >
            <BaseButton
              shape="straight"
              shadow="flat"
              class="w-1/2 transition-all duration-300 translate-x-2 hover:translate-x-3 rounded-tl-md rounded-bl-md"
              :color="side === 'BUY' ? 'success' : 'muted'"
              @click="setSide('BUY')"
              style="clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%)"
            >
              <span class="text-md font-heading">{{ $t('Buy') }}</span>
            </BaseButton>
            <BaseButton
              shape="straight"
              shadow="flat"
              class="w-1/2 transition-all duration-300 -translate-x-2 hover:-translate-x-3 rounded-tr-md rounded-br-md"
              :color="side === 'SELL' ? 'danger' : 'muted'"
              @click="setSide('SELL')"
              style="clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%)"
            >
              <span class="text-md font-heading">{{ $t('Sell') }}</span>
            </BaseButton>
          </div>
          <div class="flex justify-between px-2 text-xs">
            <span class="text-gray-500 dark:text-gray-400">{{
              $t('Available')
            }}</span>
            <span class="text-gray-700 dark:text-gray-200">{{
              side === 'BUY'
                ? (pairWallet?.balance.toFixed(amountPrecision || 2) || 0) +
                  ' ' +
                  pair
                : (currencyWallet?.balance.toFixed(amountPrecision || 2) || 0) +
                  ' ' +
                  currency
            }}</span>
          </div>
          <div class="px-2">
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full duration-300"
              enter-to-class="opacity-100 translate-x-0 duration-300"
              leave-active-class="transform-gpu duration-300"
              leave-from-class="opacity-100 translate-x-0 duration-300"
              leave-to-class="opacity-0 -translate-x-full duration-300"
            >
              <div
                key="marketBestPrice"
                v-if="isType('MARKET')"
                style="inset: 0px; border: 1px dashed rgba(243, 243, 243, 0.08)"
                class="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-md text-sm flex text-center justify-center"
              >
                {{ $t('Best Market Price') }}
              </div>
              <TairoGroupInput
                v-else
                key="limitPrice"
                v-model="marketStore.order.price"
                shape="rounded"
                autocomplete="off"
                label="Price"
                placeholder="Price"
                type="number"
                :inputText="pair"
                min="0"
              />
              <!-- <TairoGroupInput
                v-if="isType('STOP_LIMIT')"
                key="stopLossPrice"
                v-model="marketStore.order.stopLossPrice"
                shape="rounded"
                autocomplete="off"
                placeholder="Stop Loss"
                type="number"
                :inputText="pair"
                min="0"
              />
              <TairoGroupInput
                v-if="isType('STOP_LIMIT')"
                key="takeProfitPrice"
                v-model="marketStore.order.takeProfitPrice"
                shape="rounded"
                autocomplete="off"
                placeholder="Take Profit"
                type="number"
                :inputText="pair"
                min="0"
              /> -->
              <TairoGroupInput
                v-model="marketStore.order.amount"
                key="amount"
                shape="rounded"
                autocomplete="off"
                placeholder="Amount"
                label="Amount"
                type="number"
                :inputText="currency"
                :min="minAmount"
                :step="minAmount"
              />
              <div key="orderRange" class="pb-10">
                <ExchangeOrderRange
                  range="0"
                  :min="0"
                  :max="100"
                  :isLeverage="false"
                  :currency="currency"
                  :pair="pair"
                />
              </div>
            </TransitionGroup>
          </div>
        </div>
        <div
          class="w-full absolute space-y-2"
          :class="{
            'bottom-20': $viewport.isLessThan('sm'),
            'bottom-2': $viewport.isGreaterOrEquals('sm'),
          }"
        >
          <hr class="border-gray-200 dark:border-gray-700" />
          <div class="flex justify-between px-2 text-xs" key="fees">
            <span class="text-gray-500 dark:text-gray-400"
              >{{ side === 'BUY' ? 'Taker' : 'Maker' }} {{ $t('Fees') }}</span
            >
            <span class="text-gray-700 dark:text-gray-200" :key="side"
              >{{ side === 'BUY' ? takerFee : makerFee }}%</span
            >
          </div>
          <div class="flex justify-between px-2 text-xs" key="total">
            <span class="text-gray-500 dark:text-gray-400">{{
              $t('Cost')
            }}</span>
            <span
              :key="side"
              :class="{
                'text-success-500':
                  side === 'BUY'
                    ? totalCost >= minCost
                    : totalAmount >= minCost,
                'text-danger-500':
                  side === 'BUY' ? totalCost < minCost : totalAmount < minCost,
                'text-gray-700 dark:text-gray-300': totalCost === 0,
              }"
              >{{ totalCost.toFixed(amountPrecision) }}
              {{ side === 'BUY' ? pair : currency }}</span
            >
          </div>

          <div class="px-2">
            <BaseButton
              v-if="userStore.isLoggedIn"
              :disabled="
                isOrdering ||
                !wallets[currency] ||
                !wallets[pair] ||
                side === 'BUY'
                  ? totalCost < minCost
                  : totalAmount < minCost
              "
              :loading="isOrdering || isLoading"
              key="buyButton"
              shape="rounded"
              shadow="flat"
              class="w-full"
              :color="
                !wallets[currency] || !wallets[pair]
                  ? 'danger'
                  : side === 'BUY'
                    ? 'success'
                    : 'danger'
              "
              @click="storeOrder"
            >
              <span v-if="!wallets[currency] || !wallets[pair]">{{
                $t('Wallet Generation Failed')
              }}</span>
              <span v-else class="text-lg font-heading">{{
                side === 'BUY' ? 'Buy' : 'Sell'
              }}</span>
            </BaseButton>

            <div
              v-else
              style="inset: 0px; border: 1px dashed rgba(243, 243, 243, 0.08)"
              class="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-md text-sm flex text-center justify-center"
            >
              <NuxtLink class="text-warning-500 mr-1" to="/login">{{
                $t('Login')
              }}</NuxtLink>
              {{ $t('or') }}
              <NuxtLink class="text-warning-500 ml-1" to="/register">{{
                $t('Register')
              }}</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
