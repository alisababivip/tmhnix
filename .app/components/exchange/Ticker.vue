<script setup lang="ts">
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

const socketStore = useSocketStore()
const marketStore = useMarketStore()
const state = ref({
  percentage: 0,
  percentage_class: '',
  baseVolume: 0,
  quoteVolume: 0,
  high: 0,
  low: 0,
})

function createWorker() {
  return new Worker(
    URL.createObjectURL(
      new Blob(
        [
          `
self.onmessage = (event) => {
  const rawData = event.data;

  if (!rawData) {
    return;
  }
  const data = JSON.parse(rawData);

  if (data.watchTicker === undefined || data.watchTicker === null) {
    return;
  }

  const processedData = {
    last: data.watchTicker.last,
    percentage: data.watchTicker.percentage,
    baseVolume: data.watchTicker.baseVolume,
    quoteVolume: data.watchTicker.quoteVolume,
    high: data.watchTicker.high,
    low: data.watchTicker.low,
  };

  // Send processed data back to the main thread
  self.postMessage(JSON.stringify(processedData));
};
          `,
        ],
        { type: 'text/javascript' },
      ),
    ),
  )
}

const worker = createWorker()

watch(
  () => socketStore.tradeData,
  (newData) => {
    worker.postMessage(newData)
  },
  { immediate: true },
)

const { getTicker } = useExchange()
// Watch for the socket to open if it's not already when the component is mounted
onMounted(async () => {
  try {
    const response = await getTicker(`${props.currency}/${props.pair}`)
    if (response.status === 'success') {
      const ticker = {
        watchTicker: response.data.result,
      }
      worker.postMessage(JSON.stringify(ticker))
    }
  } catch (error) {
    console.error(error)
  }

  if (!isSubscribed) {
    subscribeToTrade()
  }
  window.addEventListener('beforeunload', handleClose)
})

let isSubscribed = false

const subscribeToTrade = () => {
  // Access the actual state from the proxy
  const isSocketOpen = socketStore.isSocketOpen.trade
  if (isSocketOpen && !isSubscribed) {
    socketStore.subscribe('trade', {
      symbol: `${props.currency}/${props.pair}`,
      type: 'watchTicker',
    })
    isSubscribed = true
  }
}

const unsubscribeFromTrade = () => {
  if (isSubscribed) {
    socketStore.unsubscribe('trade', {
      symbol: `${props.currency}/${props.pair}`,
      type: 'watchTicker',
    })
    isSubscribed = false
  }
}

watch(
  () => socketStore.isSocketOpen.trade, // Watch the specific property
  (isSocketOpen) => {
    if (isSocketOpen) {
      subscribeToTrade()
    } else {
      unsubscribeFromTrade()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  handleClose()
  window.removeEventListener('beforeunload', handleClose)
})

const handleClose = () => {
  unsubscribeFromTrade()
  worker.terminate()
}

const getClass = (last: number, bestAsk: number): string => {
  if (Number(last) > Number(bestAsk)) {
    return 'text-success-500 dark:text-success-400'
  } else if (Number(last) < Number(bestAsk)) {
    return 'text-danger-500 dark:text-danger-500'
  } else {
    return 'text-gray-800 dark:text-gray-100'
  }
}

// Listen to messages from the worker
worker.onmessage = (event) => {
  // Parse the data returned from the worker
  const processedData = JSON.parse(event.data)

  marketStore.bestAskClass =
    getClass(processedData.last, marketStore.bestAsk) ||
    'text-gray-800 dark:text-gray-200'

  marketStore.bestAsk = Number(processedData.last)

  state.value.percentage = Number(processedData.percentage)
  state.value.percentage_class = getClass(Number(processedData.percentage), 0)
  state.value.baseVolume = processedData.baseVolume
  state.value.quoteVolume = processedData.quoteVolume
  state.value.high = processedData.high
  state.value.low = processedData.low
}

const isMarketsOpen = ref(false)
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 shadow relative h-full"
    :class="{
      'rounded-r-lg': $viewport.isGreaterOrEquals('sm'),
    }"
  >
    <div
      class="flex text-xs text-white items-center space-x-1 px-1.5 h-full"
      v-if="$viewport.isGreaterOrEquals('xs')"
    >
      <div
        class="flex-1 px-5 flex items-center text-lg relative text-gray-800 dark:text-gray-200 cursor-pointer"
        @click="isMarketsOpen = true"
      >
        {{ currency }}/{{ pair }}
        <Icon
          :name="`icons8:chevron-${isMarketsOpen ? 'up' : 'down'}-round`"
          class="h-5 w-5 ml-2"
        />
      </div>
      <div class="flex-1 shadow p-2 bg-white dark:bg-gray-800 rounded-md">
        <div
          :class="
            marketStore.bestAskClass || 'text-gray-800 dark:text-gray-100'
          "
          class="font-bold"
        >
          {{ marketStore.bestAsk }}
        </div>
        <div>
          <span
            :class="
              state.percentage_class || 'text-gray-800 dark:text-gray-100'
            "
            >{{ state.percentage }} %</span
          >
        </div>
      </div>
      <div
        class="text-black dark:text-gray-100 flex-1 shadow p-2 bg-white dark:bg-gray-800 rounded-md"
      >
        <div class="text-gray-400 dark:text-gray-400">
          {{ $t('Volume') }}
        </div>
        <div>{{ Number(state.baseVolume).toFixed(2) }}</div>
      </div>
      <div
        v-if="state.high"
        class="text-black dark:text-gray-100 flex-1 shadow p-2 bg-white dark:bg-gray-800 rounded-md"
      >
        <div class="text-gray-400 dark:text-gray-400">{{ $t('High') }}</div>
        <div>{{ state.high }}</div>
      </div>
      <div
        class="text-black dark:text-gray-100 flex-1 shadow p-2 bg-white dark:bg-gray-800 rounded-md"
      >
        <div class="text-gray-400 dark:text-gray-400">{{ $t('Low') }}</div>
        <div>{{ state.low }}</div>
      </div>
    </div>
    <div v-else class="grid grid-cols-2 text-white items-center px-1.5 h-full">
      <div class="col-span-1 flex flex-col">
        <div
          class="flex-1 flex items-center relative text-gray-800 dark:text-gray-200 cursor-pointer group"
          @click="isMarketsOpen = true"
        >
          <span class="group-hover:text-warning-400">
            {{ currency }}/{{ pair }}</span
          >
          <Icon
            :name="`icons8:chevron-${isMarketsOpen ? 'up' : 'down'}-round`"
            class="h-4 w-4 ml-2 group-hover:text-warning-400"
          />
        </div>
        <div class="flex gap-3 items-center justify-start">
          <span
            class="text-xl font-bold"
            :class="
              marketStore.bestAskClass || 'text-gray-800 dark:text-gray-100'
            "
          >
            {{ marketStore.bestAsk }}
          </span>
          <span
            class="text-xs"
            :class="
              state.percentage_class || 'text-gray-800 dark:text-gray-100'
            "
          >
            {{ state.percentage }} %
          </span>
        </div>
      </div>
      <div class="col-span-1 grid grid-cols-2 text-xxs">
        <!-- First nested col -->
        <div class="col-span-1">
          <div class="flex flex-col" v-if="state.high">
            <span class="text-gray-400 dark:text-gray-400"
              >{{ $t('24h High') }}:</span
            >
            <span class="text-gray-800 dark:text-gray-100">{{
              state.high
            }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400 dark:text-gray-400"
              >{{ $t('24h Low') }}:</span
            >
            <span class="text-gray-800 dark:text-gray-100">{{
              state.low
            }}</span>
          </div>
        </div>
        <!-- Second nested col -->
        <div class="col-span-1">
          <div class="flex flex-col">
            <span class="text-gray-400 dark:text-gray-400"
              >{{ $t('24h Vol') }} ({{ currency }}):</span
            >
            <span class="text-gray-800 dark:text-gray-100">{{
              state.baseVolume.toFixed(2)
            }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400 dark:text-gray-400"
              >{{ $t('24h Vol') }} ({{ pair }}):</span
            >
            <span class="text-gray-800 dark:text-gray-100">{{
              state.quoteVolume.toFixed(2)
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <TairoModal :open="isMarketsOpen" size="md" @close="isMarketsOpen = false">
      <ExchangeMarkets />
    </TairoModal>
  </div>
</template>

<style scoped>
.image-container {
  width: calc(2.5 * 40px);
  overflow: hidden;
}

.image-overlap {
  transition: transform 0.3s ease-in-out;
}

.image-container:hover .image-overlap:first-child {
  transform: translateX(-12%);
}

.image-container:hover .image-overlap:last-child {
  transform: translateX(12%);
}
.text-xxs {
  font-size: 9px;
  line-height: 12px;
}
</style>
