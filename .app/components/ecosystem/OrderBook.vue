<script setup lang="ts">
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
const ecoSocketStore = useEcosystemSocketStore()
const { priceFormatter } = useUtils()

const state = reactive({
  showMoreAsks: false,
  showMoreBids: false,
  sideLength: 20,
  best_ask: '',
  best_ask_icon: '',
  activeItem: 'pills-graph',
  asks: Array.from({ length: 20 }, () => [0, 0, 0]),
  bids: Array.from({ length: 20 }, () => [0, 0, 0]),
  bestAsker: 0,
  showDepth: false,
})

const orderBookDiv = ref<any>(null)

const viewport = useViewport()

const orderBookDivWidth = computed(() => {
  return orderBookDiv.value?.clientWidth || 0
})

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

const pricePrecision = computed(() => {
  const precision =
    Number(marketStore.selectedMarket?.metadata?.precision?.price) || 4
  return Math.abs(precision)
})

const amountPrecision = computed(() => {
  const precision =
    Number(marketStore.selectedMarket?.metadata?.precision?.amount) || 4
  return Math.abs(precision)
})

const formattedAsks = computed(() => {
  const asks = state.asks
  return asks.map(({ price, volume, width }) => [
    priceFormatter(price, pricePrecision.value),
    priceFormatter(volume, amountPrecision.value),
    priceFormatter(price * volume, pricePrecision.value),
    width,
  ])
})

const formattedBids = computed(() => {
  const bids = state.bids
  return bids.map(({ price, volume, width }) => [
    priceFormatter(price, pricePrecision.value),
    priceFormatter(volume, amountPrecision.value),
    priceFormatter(price * volume, pricePrecision.value),
    width,
  ])
})

const worker = new Worker(
  URL.createObjectURL(
    new Blob(
      [
        `
  function calculateWidths(asks, bids, orderBookDivWidth,shouldReverseAsks,shouldInvertBidsWidth) {
    let totalAsksVolume = asks.reduce((total, ask) => total + ask.volume, 0);
    let totalBidsVolume = bids.reduce((total, bid) => total + bid.volume, 0);

    let accumulatedAsksVolume = 0;
    asks.forEach((ask, index) => {
      accumulatedAsksVolume += ask.volume;
      ask.width = (accumulatedAsksVolume / totalAsksVolume) * orderBookDivWidth;
    });

    let accumulatedBidsVolume = 0;
    if (shouldInvertBidsWidth) {
      bids.forEach((bid, index) => {
        accumulatedBidsVolume += bid.volume;
        bid.width = (accumulatedBidsVolume / totalBidsVolume) * orderBookDivWidth;
      });
    } else {
      bids.reverse().forEach((bid, index) => {
        accumulatedBidsVolume += bid.volume;
        bid.width = (accumulatedBidsVolume / totalBidsVolume) * orderBookDivWidth;
      });
    }

    // Reverse the asks to get the right order conditionally
    if (shouldReverseAsks) {
      asks.reverse();
    }

    return { asks, bids };
  }

  function processOrderData(data, orderBookDivWidth, shouldReverseAsks,shouldInvertBidsWidth) {
    let factor = 0.1; // Change this as needed

    let asks = data.asks.slice(0, data.sideLength);
    let bids = data.bids.slice(0, data.sideLength);

    // Convert bids and asks to the desired format
    asks = asks.map(([price, volume]) => ({ price, volume, width: 0 }));
    bids = bids.map(([price, volume]) => ({ price, volume, width: 0 }));

    // Sort asks in ascending order by price and bids in descending order
    asks.sort((a, b) => a.price - b.price);
    bids.sort((a, b) => a.price - b.price);

    const result = calculateWidths(asks, bids, orderBookDivWidth, shouldReverseAsks, shouldInvertBidsWidth);

    return result;
  }

  self.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const { orderbookData, orderBookDivWidth, shouldReverseAsks, shouldInvertBidsWidth } = data;

    if (orderbookData === undefined || orderbookData === null) return;

    const result = processOrderData(orderbookData, orderBookDivWidth, shouldReverseAsks, shouldInvertBidsWidth);
    self.postMessage(result);
  };
    `,
      ],
      { type: 'text/javascript' },
    ),
  ),
)

watch(
  () => ecoSocketStore.orderbook,
  (newData) => {
    if (!newData) {
      return
    }

    const message = {
      orderbookData: newData,
      orderBookDivWidth: orderBookDivWidth.value,
      shouldReverseAsks: viewport.isGreaterOrEquals('md'),
      shouldInvertBidsWidth: viewport.isLessThan('md'),
    }

    worker.postMessage(JSON.stringify(message))
  },
  { immediate: true },
)

worker.onmessage = function (event) {
  const { asks, bids } = event.data

  // Reset all elements to their initial state of [0, 0, 0]
  for (let i = 0; i < state.asks.length; i++) {
    state.asks[i] = [0, 0, 0]
  }

  for (let i = 0; i < state.bids.length; i++) {
    state.bids[i] = [0, 0, 0]
  }

  // Update asks from the last index with new data
  for (let i = 0; i < asks.length; i++) {
    state.asks[state.asks.length - 1 - i] = asks[asks.length - 1 - i]
  }

  // Update bids from the first index with new data
  for (let i = 0; i < bids.length; i++) {
    state.bids[i] = bids[i]
  }

  if (bids.length > 0) {
    marketStore.bestBid = bids[0].price
  }
}

let reconnectInterval: NodeJS.Timeout

onMounted(async () => {
  if (!marketStore.selectedMarket) {
    marketStore.selectMarketBySymbol(props.currency + '/' + props.pair)
  }

  // try {
  //   const response = await getOrderbook(
  //     `${props.currency}/${props.pair}`,
  //     state.sideLength,
  //   )
  //   const orderbook = {
  //     watchOrderBook: response.data.result,
  //   }
  //   const message = {
  //     rawData: JSON.stringify(orderbook),
  //     orderBookDivWidth: orderBookDivWidth.value,
  //     shouldReverseAsks: viewport.isGreaterOrEquals('md'),
  //     shouldInvertBidsWidth: viewport.isLessThan('md'),
  //   }

  //   worker.postMessage(JSON.stringify(message))
  // } catch (error) {}

  subscribeToTrade()
  scrollToEnd()
  window.addEventListener('beforeunload', handleClose)
})

const subscribeToTrade = () => {
  if (ecoSocketStore.isSocketOpen) {
    ecoSocketStore.subscribe('exchange', {
      method: 'orderbook',
      symbol: `${props.currency}/${props.pair}`,
      limit: state.sideLength,
    })
  }
}

const unsubscribeFromTrade = () => {
  ecoSocketStore.unsubscribe('exchange', {
    method: 'orderbook',
    symbol: `${props.currency}/${props.pair}`,
    limit: state.sideLength,
  })
}

watch(
  () => ecoSocketStore.isSocketOpen,
  (isSocketOpen) => {
    if (isSocketOpen) {
      subscribeToTrade()
    } else {
      unsubscribeFromTrade()
    }
  },
)

onBeforeUnmount(() => {
  handleClose()
  window.removeEventListener('beforeunload', handleClose)
})

const handleClose = () => {
  unsubscribeFromTrade()
  if (reconnectInterval) {
    clearInterval(reconnectInterval)
  }
  worker.terminate()
}

const AsksBody = ref<HTMLElement>()
function scrollToEnd() {
  if (AsksBody.value && viewport.isGreaterOrEquals('md')) {
    AsksBody.value.scrollTo({
      top: AsksBody.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}
function showBids() {
  state.showMoreBids = true
  state.showMoreAsks = false
  state.showDepth = false
}

function showAsks() {
  state.showMoreBids = false
  state.showMoreAsks = true
  state.showDepth = false
  scrollToEnd()
}

function showAll() {
  state.showMoreBids = false
  state.showMoreAsks = false
  state.showDepth = false
  scrollToEnd()
}

function showDepth() {
  state.showDepth = true
  state.showMoreBids = false
  state.showMoreAsks = false
  scrollToEnd()
}

const orderbookAsksClass = computed(() => ({
  'h-[46%]':
    !state.showMoreBids &&
    !state.showMoreAsks &&
    !state.showDepth &&
    viewport.isGreaterOrEquals('md'),
  'h-[92%]': state.showMoreAsks && viewport.isGreaterOrEquals('md'),
  'h-[50%]': state.showDepth && viewport.isGreaterOrEquals('md'),
  'h-0': state.showMoreBids,
  'h-full': viewport.isLessThan('md'),
}))

const marketPriceClass = computed(() => ({
  'h-[8%]': !state.showMoreBids && !state.showMoreAsks && !state.showDepth,
  hidden: state.showDepth,
}))

const orderbookBidsClass = computed(() => ({
  'h-[46%]':
    !state.showMoreBids &&
    !state.showMoreAsks &&
    !state.showDepth &&
    viewport.isGreaterOrEquals('md'),
  'h-[92%]': state.showMoreBids && viewport.isGreaterOrEquals('md'),
  'h-[50%]': state.showDepth && viewport.isGreaterOrEquals('md'),
  'h-0': state.showMoreAsks,
  'rounded-b-lg h-full':
    viewport.isLessThan('md') && viewport.isGreaterOrEquals('xs'),
}))
</script>

<template>
  <div
    class="h-full w-full bg-white dark:bg-gray-900 shadow"
    :class="{
      'rounded-lg': $viewport.isGreaterOrEquals('md'),
    }"
    ref="orderBookDiv"
  >
    <ul
      class="flex px-1 pt-1 h-10"
      role="tablist"
      v-if="$viewport.isGreaterOrEquals('md')"
    >
      <li class="px-1 pt-1">
        <button
          :class="{
            'text-gray-300 dark:text-gray-600':
              (state.showMoreAsks && state.showMoreBids) ||
              state.showDepth ||
              state.showMoreAsks ||
              state.showMoreBids,
          }"
          @click.prevent="showAll()"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 8.5 h2 v5 h-2 v-5 z" fill="#5EEAD4"></path>
            <path d="M3 2.5 h2 v5 h-2 v-5 z" fill="#F43F5E"></path>
            <path
              d="M6 2.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 5.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 8.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 11.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
          </svg>
        </button>
      </li>
      <li class="px-1 pt-1">
        <button
          :class="{
            'text-gray-300 dark:text-gray-600': !state.showMoreBids,
          }"
          @click.prevent="showBids()"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 2.5 h2 v11 h-2 v-5 z" fill="#5EEAD4"></path>
            <path
              d="M6 2.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 5.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 8.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 11.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
          </svg>
        </button>
      </li>
      <li class="px-1 pt-1">
        <button
          :class="{
            'text-gray-300 dark:text-gray-600': !state.showMoreAsks,
          }"
          @click.prevent="showAsks()"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 2.5 h2 v11 h-2 v-5 z" fill="#F43F5E"></path>
            <path
              d="M6 2.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 5.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 8.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
            <path
              d="M6 11.5 h7 v2 h-7 v-2 z"
              fill="currentColor"
              fill-opacity="0.9"
            ></path>
          </svg>
        </button>
      </li>
      <li class="px-1 pt-1">
        <button
          @click.prevent="showDepth()"
          :class="{
            'text-gray-300 dark:text-gray-600': !state.showDepth,
          }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 16 16"
          >
            <!-- Red Triangle (Top half, 90-degree angle at top right, pointy end at bottom) -->
            <polygon
              points="2.5,2.5 11.5,2.5 11.5,7.9"
              :fill="state.showDepth ? '#F43F5E' : 'currentColor'"
            />

            <!-- Green Triangle (Bottom half, 90-degree angle at bottom left, pointy end at top) -->
            <polygon
              points="2.5,14 11.5,14 11.5,8.1"
              :fill="state.showDepth ? '#5EEAD4' : 'currentColor'"
            />
          </svg>
        </button>
      </li>
    </ul>
    <div
      class="OrderbookGrid flex xs:flex-row md:flex-col justify-between"
      :class="{
        'rounded-b-lg': $viewport.isGreaterOrEquals('sm'),
        'h-[calc(100%)]':
          $viewport.isGreaterOrEquals('sm') && $viewport.isLessThan('md'),
        'h-[calc(100%-2.5rem)]': $viewport.isGreaterOrEquals('md'),
        'h-full': $viewport.isLessThan('sm'),
      }"
      ref="orderBookDiv"
    >
      <div class="OrderbookAsks flex flex-col" :class="orderbookAsksClass">
        <div
          class="orderbook-header"
          v-if="!state.showMoreBids && !state.showDepth"
        >
          <div class="text-start" style="padding-left: 5px">
            {{ $t('Price') }}
          </div>
          <div class="text-center" v-if="$viewport.isGreaterOrEquals('xs')">
            {{ $t('Amount') }}
          </div>
          <div class="text-end" style="padding-right: 5px">
            {{ $t('Total') }}
          </div>
        </div>
        <div
          class="orderbook-content overflow-y-scroll no-scrollbar"
          ref="AsksBody"
        >
          <ExchangeOrderbookItem
            :data="formattedAsks"
            type="ask"
            :show-less="state.showMoreBids"
            :show-depth="state.showDepth"
          />
        </div>
      </div>

      <div
        class="marketPrice text-sm"
        :class="marketPriceClass"
        v-if="!state.showDepth && $viewport.isGreaterOrEquals('md')"
      >
        <div class="px-3 py-2">
          <span class="">{{ $t('Market Price') }}: </span
          ><span :class="marketStore.bestAskClass" class="font-bold">{{
            marketStore.bestAsk
          }}</span>
        </div>
      </div>

      <div class="OrderbookBids flex flex-col" :class="orderbookBidsClass">
        <div
          class="orderbook-header"
          v-if="
            (state.showMoreBids && !state.showMoreAsks && !state.showDepth) ||
            $viewport.isLessThan('md')
          "
        >
          <div class="pl-2 text-start">{{ $t('Price') }}</div>
          <div class="text-center" v-if="$viewport.isGreaterOrEquals('xs')">
            {{ $t('Amount') }}
          </div>
          <div class="text-end">{{ $t('Total') }}</div>
        </div>
        <div
          class="orderbook-content overflow-y-scroll no-scrollbar"
          :class="{
            'rounded-b-lg': $viewport.isGreaterOrEquals('md'),
          }"
        >
          <ExchangeOrderbookItem
            :data="formattedBids"
            type="bid"
            :show-less="state.showMoreAsks"
            :show-depth="state.showDepth"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orderbook-header {
  display: flex;
  justify-content: space-between;
  padding: 5px;
}

.OrderbookAsks,
.OrderbookBids {
  font-size: 12px;
  width: 100%; /* Ensure items take full width of the orderbook div */
  padding-left: 2px;
  overflow-y: auto; /* Allow scrolling if content overflows */
}

.orderbook-content {
  flex-grow: 1; /* Allow the content to take up available space */
  overflow-y: scroll; /* Allow scrolling if content overflows */
}

/* Hide scrollbar for Chrome, Safari, and Opera */
.orderbook-content::-webkit-scrollbar {
  width: 0px;
}

/* Hide scrollbar for IE, Edge, and Firefox */
.orderbook-content {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.marketPrice {
  display: flex;
  align-items: center; /* Center content vertically */
  justify-content: center; /* Center content horizontally */
}
</style>
