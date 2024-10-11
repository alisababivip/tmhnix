<script setup lang="ts">
import { useEcoMarketStore } from '~~/store/extensions/ecosystem/market'
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'

const props = defineProps({
  isBootstrap: {
    type: Boolean,
    default: false,
    required: false,
  },
})
const ecoSocketStore = useEcosystemSocketStore()
const marketStore = useMarketStore()
const socketStore = useSocketStore()
const ecoMarketStore = useEcoMarketStore()
const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)
const isEcoEnabled = computed(() => extensions.value['ecosystem'])
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const hasHotMarkets = computed(() => {
  return marketStore.markets.some((market) => market.is_hot)
})

const hasTrendingMarkets = computed(() => {
  return marketStore.markets.some((market) => market.is_trending)
})

const initializeMarkets = async () => {
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }
  marketStore.loading = true
  if (marketStore.markets.length === 0 && settings.value?.spot_exchange) {
    await marketStore.fetchMarkets()
  }
  marketStore.loading = false
  if (isEcoEnabled.value && ecoMarketStore.markets.length === 0) {
    await ecoMarketStore.fetchMarkets()
    ecoMarketStore.markets.forEach((ecoMarket) => {
      ecoMarket.is_eco = true
      const marketIndex = marketStore.markets.findIndex(
        (market) => market.symbol === ecoMarket.symbol,
      )
      if (marketIndex !== -1) {
        marketStore.markets[marketIndex] = ecoMarket
      } else {
        marketStore.markets.push(ecoMarket)
      }
    })
  }
}

onMounted(async () => {
  await initializeMarkets()

  if (settings.value?.spot_exchange) {
    await initializeWorkerAndTickers()
    if (isConnected.value) {
      socketStore.createSocket('tickers')
    }
  }
  if (isEcoEnabled.value) {
    await ecoSocketStore.createSocket('exchange')
    subscribeToTrade()
  }
  window.addEventListener('beforeunload', handleClose)
})

onUnmounted(() => {
  if (isConnected.value) {
    handleClose()
  }
  window.removeEventListener('beforeunload', handleClose)
})

const filter = ref(
  !hasTrendingMarkets.value
    ? !hasHotMarkets.value
      ? 'gainers'
      : 'hot'
    : 'trending',
)

const filteredItems = computed(() => {
  const marketItems = marketStore.markets
  switch (filter.value) {
    case 'trending':
      return marketItems
        .filter((item) => item.is_trending)
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 10)
    case 'hot':
      return marketItems
        .filter((item) => item.is_hot)
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 10)
    case 'gainers':
      return marketItems
        .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
        .slice(0, 10)
    case 'losers':
      return marketItems
        .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
        .slice(0, 10)
    default:
      return marketItems
  }
})

const { getTickers } = useExchange()
const isConnected = ref(false)
const initializeWorkerAndTickers = async () => {
  try {
    // Initialize previous markets and tickers
    const previousMarkets = marketStore.markets.map((market) => ({
      symbol: market.symbol,
      price: market.price,
    }))
    const response = await getTickers()
    if (response.status === 'success') {
      isConnected.value = true
      socketStore.isConnected = true
      const data = JSON.stringify({ watchTickers: response.data.result })
      const tickers = {
        data,
        previousMarkets,
      }

      worker.postMessage(JSON.stringify(tickers))
    }
  } catch (error) {
    socketStore.isConnected = false
    console.error('Error initializing worker and tickers:', error)
  }
}

const handleClose = async () => {
  if (settings.value?.spot_exchange) {
    socketStore.closeSocket('tickers')
  }
  if (isEcoEnabled.value) {
    await unsubscribeFromTrade()
    await ecoSocketStore.closeSocket('exchange')
  }
  worker.terminate()
}

function createWorker() {
  return new Worker(
    URL.createObjectURL(
      new Blob(
        [
          `
function formatChange(change) {
  if (change < 0.01 && change > -0.01) {
    return { value: '0.00', status: 'text-gray-500 dark:text-gray-500' };
  }
  return {
    value: change,
    status: change > 0 ? 'text-green-500 dark:text-green-500' : 'text-red-500 dark:text-red-500'
  };
}

self.onmessage = (event) => {
  const { data, isEco, previousMarkets } = JSON.parse(event.data);
  let processedData = null;

  if (isEco) {
    processedData = {};
    for (const [symbol, tickerData] of Object.entries(data)) {
      processedData[symbol] = processEcoTicker(tickerData);
    }
  } else {
    const tickers = JSON.parse(data);
    processedData = processStandardTicker(tickers.watchTickers, previousMarkets);
  }

  self.postMessage(JSON.stringify(processedData));
};


function processEcoTicker(watchTicker) {
  if (!Array.isArray(watchTicker) || watchTicker.length === 0) {
    return;
  }

  const latestTicker = watchTicker[watchTicker.length - 1];
  const oldestTicker = watchTicker[0];
  const percentage = ((latestTicker.close - oldestTicker.open) / oldestTicker.open) * 100;
  const changeData = formatChange(percentage.toFixed(2));
  const change = changeData.value;
  const changeStatus = changeData.status;

    priceStatus = latestTicker.close > oldestTicker.close
      ? 'text-green-500 dark:text-green-500'
      : latestTicker.close < oldestTicker.close
      ? 'text-red-500 dark:text-red-500'
      : '';

  return {
    price: latestTicker.close,
    change: change > 0 ? '+' + change : change,
    baseVolume: latestTicker.volume,
    quoteVolume: latestTicker.volume * latestTicker.close,
    changeStatus,
    priceStatus,
  };
}

function processStandardTicker(watchTickers, previousMarkets) {
  if (!watchTickers) return [];

  return Object.entries(watchTickers).map(([symbol, tickerData]) => {
    const { last: price, baseVolume, quoteVolume, change } = tickerData;
    const previousMarket = previousMarkets.find(m => m.symbol === symbol);

    const formattedChange = formatChange(change);
    const priceStatus = getPriceStatus(previousMarket, price);

    return {
      symbol,
      price,
      change: formattedChange.value > 0 ? '+' + formattedChange.value : formattedChange.value,
      priceStatus,
      changeStatus: formattedChange.status,
      baseVolume,
      quoteVolume,
    };
  });
}

function formatChange(change) {
  const status = change > 0 ? 'text-green-500 dark:text-green-500'
              : change < 0 ? 'text-red-500 dark:text-red-500'
              : 'text-gray-500 dark:text-gray-500';

  return { value: Number(change).toFixed(2), status };
}

function getPriceStatus(previousMarket, currentPrice) {
  if (!previousMarket) return '';

  const { price: previousPrice } = previousMarket;
  return previousPrice < currentPrice ? 'text-green-500 dark:text-green-500'
       : previousPrice > currentPrice ? 'text-red-500 dark:text-red-500'
       : '';
}
          `,
        ],
        { type: 'text/javascript' },
      ),
    ),
  )
}

const worker = createWorker()

watch(
  () => socketStore.tickersData,
  (newData) => {
    if (!newData) return

    // Prepare the previous markets data by extracting only necessary properties
    const previousMarkets = marketStore.markets.map((market) => ({
      symbol: market.symbol,
      price: market.price,
    }))

    worker.postMessage(
      JSON.stringify({
        data: newData,
        isEco: false,
        previousMarkets: previousMarkets,
      }),
    )
  },
  { immediate: true },
)

const lastTwoDaysData = ref({})

watch(
  () => ecoSocketStore.tickers,
  (newData) => {
    if (!newData) return

    for (const [symbol, tickerData] of Object.entries(newData)) {
      if (!lastTwoDaysData.value[symbol]) {
        lastTwoDaysData.value[symbol] = Array.isArray(tickerData)
          ? [...tickerData]
          : [tickerData] // copy the array
      } else {
        if (Array.isArray(tickerData)) {
          lastTwoDaysData.value[symbol].push(...tickerData) // append data to existing array
        } else {
          lastTwoDaysData.value[symbol].push(tickerData) // append single data
        }
        // Keep only the last 2 items
        lastTwoDaysData.value[symbol] = lastTwoDaysData.value[symbol].slice(-2)
      }
    }

    worker.postMessage(
      JSON.stringify({
        data: lastTwoDaysData.value,
        isEco: true,
      }),
    )
  },
  { immediate: true },
)

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

const subscribeToTrade = async () => {
  if (ecoSocketStore.isSocketOpen) {
    await ecoSocketStore.subscribe('exchange', {
      method: 'tickers',
    })
  }
}

const unsubscribeFromTrade = () => {
  ecoSocketStore.unsubscribe('exchange', {
    method: 'tickers',
  })
}

worker.onmessage = (event) => {
  const processedData = JSON.parse(event.data)

  // Update the market store
  marketStore.appendMarketData(processedData)
}
const filteredMarketsText = computed(() => {
  switch (filter.value) {
    case 'trending':
      return 'Trending Markets'
    case 'hot':
      return 'Hot Markets'
    case 'gainers':
      return 'Top Gainers'
    case 'losers':
      return 'Top Losers'
    default:
      return 'Markets'
  }
})

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return (volume / 1_000_000_000).toFixed(1) + 'B'
  } else if (volume >= 1_000_000) {
    return (volume / 1_000_000).toFixed(1) + 'M'
  } else if (volume >= 1_000) {
    return (volume / 1_000).toFixed(0) + 'K'
  } else {
    return volume.toFixed(2).toString()
  }
}

const currency = (symbol: string) => {
  return symbol.split('/')[0]
}
</script>

<template>
  <div class="my-10">
    <TairoContentWrapper>
      <template #left>
        <BaseHeading tag="h2" size="xl" weight="bold">
          <span>{{ filteredMarketsText }}</span>
        </BaseHeading>
      </template>
      <template #right>
        <div class="flex xs:flex-col sm:flex-row w-full gap-2 z-40">
          <BaseButton
            v-if="hasTrendingMarkets"
            @click="filter = 'trending'"
            :color="filter === 'trending' ? 'warning' : ''"
            flavor="pastel"
            condensed
          >
            {{ $t('Trending') }}
          </BaseButton>
          <BaseButton
            v-if="hasHotMarkets"
            @click="filter = 'hot'"
            :color="filter === 'hot' ? 'warning' : ''"
            flavor="pastel"
            condensed
          >
            {{ $t('Hot') }}
          </BaseButton>
          <BaseButton
            @click="filter = 'gainers'"
            :color="filter === 'gainers' ? 'warning' : ''"
            flavor="pastel"
            condensed
          >
            {{ $t('Top Gainers') }}
          </BaseButton>
          <BaseButton
            @click="filter = 'losers'"
            :color="filter === 'losers' ? 'warning' : ''"
            flavor="pastel"
            condensed
          >
            {{ $t('Top Losers') }}
          </BaseButton>
        </div>
      </template>

      <div class="w-full sm:pt-3">
        <div class="table-responsive" v-if="isBootstrap">
          <table class="table">
            <thead>
              <tr>
                <th class="text-start market-col">Market</th>
                <th class="price-col">Price</th>
                <th class="change-col">Change</th>
                <th class="volume-col">Volume</th>
                <th class="text-end action-col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="marketStore.loading" v-for="index in 5" :key="index">
                <td colspan="5">
                  <div class="placeholder" style="height: 20px"></div>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in filteredItems" :key="item.id">
                <td class="text-start market-col">
                  <div class="d-flex justify-content-start gap-1">
                    <img
                      :src="`/img/crypto/${currency(
                        item.symbol.toLowerCase(),
                      )}.png`"
                      class="h-6 w-6 rounded-full mr-2"
                    />
                    {{ item.symbol }}
                  </div>
                </td>
                <td class="price-col" :class="item.priceStatus">
                  <span v-if="item.price">{{ item.price }}</span>
                  <div v-else class="placeholder" style="height: 20px"></div>
                </td>
                <td class="change-col" :class="item.changeStatus">
                  <span v-if="item.change">{{ item.change }}%</span>
                  <div v-else class="placeholder" style="height: 20px"></div>
                </td>
                <td class="volume-col">
                  <span v-if="item.quoteVolume">{{
                    formatVolume(item.quoteVolume)
                  }}</span>
                  <div v-else class="placeholder" style="height: 20px"></div>
                </td>
                <td class="text-end action-col">
                  <NuxtLink :to="`/trade/${item.symbol}`">
                    <BaseButton condensed color="success" flavor="outline">
                      {{ $t('Trade') }}
                    </BaseButton>
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TairoFlexTable class="md:pt-0 sm:pt-5 md:mt-0 sm:mt-5 z-10" v-else>
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transform-gpu"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <TairoFlexTableRow
              v-if="marketStore.loading"
              v-for="index in 5"
              :key="index"
            >
              <template #start>
                <TairoFlexTableCell
                  type="grow"
                  class="md:justify-start"
                  data-content="Symbol"
                >
                  <BasePlaceload
                    class="h-[46px] w-[46px] shrink-0 rounded-xl"
                  />
                </TairoFlexTableCell>
              </template>
              <template #end>
                <TairoFlexTableCell
                  class="text-end md:text-start"
                  data-content="Status"
                  light
                >
                  <BasePlaceload class="h-3 w-24 rounded-lg" />
                </TairoFlexTableCell>
                <TairoFlexTableCell
                  class="text-end md:text-start"
                  data-content="Status"
                  light
                >
                  <BasePlaceload class="h-3 w-24 rounded-lg" />
                </TairoFlexTableCell>
                <TairoFlexTableCell
                  class="text-end md:text-start"
                  data-content="Status"
                  light
                >
                  <BasePlaceload class="h-3 w-24 rounded-lg" />
                </TairoFlexTableCell>
                <TairoFlexTableCell
                  type="grow"
                  class="md:justify-end text-end"
                  data-content="Actions"
                >
                  <BasePlaceload class="h-8 w-16 rounded-lg" />
                </TairoFlexTableCell>
              </template>
            </TairoFlexTableRow>

            <TableFlexTableRow
              v-else
              v-for="(item, index) in filteredItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Market"
                  :hide-label="index > 0"
                  :title="item.symbol"
                />
                <!-- :logo="`/img/crypto/${currency(
                    item.symbol.toLowerCase(),
                  )}.png`" -->
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Price"
                  :hide-label="index > 0"
                  class="w-full sm:w-28 md:w-36 lg:w-40"
                  :class="item.priceStatus"
                >
                  <span v-if="item.price">{{ item.price }}</span>
                  <BasePlaceload v-else class="h-3 w-16 rounded-lg" />
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="24h Change"
                  :hide-label="index > 0"
                  class="w-full sm:w-28 md:w-36 lg:w-40"
                  :class="item.changeStatus"
                >
                  <span v-if="item.change">{{ item.change }}%</span>
                  <BasePlaceload v-else class="h-3 w-16 rounded-lg" />
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Volume"
                  :hide-label="index > 0"
                  class="w-full sm:w-28 md:w-36 lg:w-40"
                >
                  <span v-if="item.quoteVolume">{{
                    formatVolume(item.quoteVolume)
                  }}</span>
                  <BasePlaceload v-else class="h-3 w-16 rounded-lg" />
                </TableFlexTableCell>

                <TableFlexTableCell
                  label="action"
                  :hide-label="index > 0"
                  class="w-full sm:w-28 md:w-36 lg:w-40"
                >
                  <NuxtLink :to="`/trade/${item.symbol}`">
                    <BaseButton condensed color="success" flavor="outline">
                      {{ $t('Trade') }}
                    </BaseButton>
                  </NuxtLink>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TransitionGroup>
        </TairoFlexTable>
      </div>
    </TairoContentWrapper>
  </div>
</template>

<style scoped>
.table th,
.table td {
  vertical-align: middle; /* Center rows vertically */
}
.market-col {
  width: 20%;
}
.price-col {
  width: 20%;
}
.change-col {
  width: 20%;
}
.volume-col {
  width: 20%;
}
.action-col {
  width: 20%;
}
</style>
