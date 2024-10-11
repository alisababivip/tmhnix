<script setup lang="ts">
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
const ecoSocketStore = useEcosystemSocketStore()
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
const state = ref({
  percentage: 0,
  percentage_class: '',
  baseVolume: 0,
  quoteVolume: 0,
  high: 0,
  low: 0,
})
const lastTwoDaysData = ref([])

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

  const watchTicker = JSON.parse(rawData);
  if (!Array.isArray(watchTicker) || watchTicker.length === 0) {
    return;
  }

  const latestTicker = watchTicker[watchTicker.length - 1];
  const oldestTicker = watchTicker[0];

  if (!latestTicker || !oldestTicker) {
    return;
  }

  const last = latestTicker.close;
  const baseVolume = latestTicker.volume;
  const quoteVolume = latestTicker.volume * latestTicker.close;
  const high = latestTicker.high;
  const low = latestTicker.low;

  // Calculate percentage based on the oldest and latest ticker data
  const percentage = ((latestTicker.close - oldestTicker.open) / oldestTicker.open) * 100;

  const processedData = {
    last,
    percentage,
    baseVolume,
    quoteVolume,
    high,
    low,
  };

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
  () => ecoSocketStore.ticker,
  (newData) => {
    if (newData) {
      if (lastTwoDaysData.value.length === 0) {
        // Fill both slots with the same data if empty
        lastTwoDaysData.value = [newData, newData]
      } else if (lastTwoDaysData.value.length === 1) {
        lastTwoDaysData.value.push(newData)
      } else if (lastTwoDaysData.value.length === 2) {
        lastTwoDaysData.value = [lastTwoDaysData.value[1], newData]
      }
      worker.postMessage(JSON.stringify(lastTwoDaysData.value))
    }
  },
  { immediate: true },
)

const { getTicker } = useEcosystem()

onMounted(async () => {
  try {
    const response = await getTicker(`${props.currency}/${props.pair}`)
    if (
      Array.isArray(response.data.result) &&
      response.data.result.length > 0
    ) {
      lastTwoDaysData.value = response.data.result
      worker.postMessage(JSON.stringify(lastTwoDaysData.value))
    }
  } catch (error) {
    console.error('API Error: ', error)
  }
  subscribeToTrade()
  window.addEventListener('beforeunload', handleClose)
})

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
  worker.terminate()
}

const subscribeToTrade = () => {
  try {
    ecoSocketStore.subscribe('exchange', {
      method: 'ticker',
      symbol: `${props.currency}/${props.pair}`,
    })
  } catch (error) {
    console.error('Socket Error: ', error)
  }
}

const unsubscribeFromTrade = () => {
  ecoSocketStore.unsubscribe('exchange', {
    method: 'ticker',
    symbol: `${props.currency}/${props.pair}`,
  })
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
            >{{ Number(state.percentage || 0).toFixed(2) }} %</span
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
          <div class="flex flex-col">
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
