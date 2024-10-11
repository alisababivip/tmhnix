<script setup lang="ts">
import { useEcoMarketStore } from '~~/store/extensions/ecosystem/market'
const marketStore = useMarketStore()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const activeItem = ref('')
const route = useRoute()
const ecoMarketStore = useEcoMarketStore()
const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)
const isEcoEnabled = computed(() => extensions.value['ecosystem'])

const getUrlType = () => {
  switch (route.path.split('/')[1]) {
    case 'trade':
      return 'TRADE'
    case 'binary':
      return 'BINARY'
    case 'forex':
      return 'FOREX'
    case 'ai-trading':
      return 'AI_TRADING'
    case 'futures':
      return 'FUTURES'
    default:
      return 'TRADE'
  }
}

// Computed property to filter the watchlist
const filteredWatchlist = computed(() => {
  const filterType = getUrlType()

  if (filterType) {
    return marketStore.watchlists.filter((item) => item.type === filterType)
  }

  return marketStore.watchlists
})

onMounted(async () => {
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }
  if (marketStore.markets.length === 0) {
    await marketStore.fetchMarkets()
  }
  if (isEcoEnabled.value && ecoMarketStore.markets.length === 0) {
    await ecoMarketStore.fetchMarkets()
  }
  if (isEcoEnabled.value && ecoMarketStore.markets.length > 0) {
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
  if (marketStore.watchlists.length === 0 && isLoggedIn.value) {
    await marketStore.fetchWatchlists()
  }
  if (marketTabs.value.length > 0) {
    setActive(marketTabs.value[0])
  }
})

onUnmounted(() => {
  worker.terminate()
})

const isActive = (menuItem) => {
  return activeItem.value === menuItem
}

const setActive = (menuItem) => {
  activeItem.value = menuItem
}

const scrollLeft = () => {
  const nfElement = document.querySelector('.nf')
  const leftPos = nfElement.scrollLeft
  nfElement.scroll({ left: leftPos - 200, behavior: 'smooth' })
}

const scrollRight = () => {
  const nfElement = document.querySelector('.nf')
  const leftPos = nfElement.scrollLeft
  nfElement.scroll({ left: leftPos + 200, behavior: 'smooth' })
}

const filteredMarkets = computed(() => {
  const result = {}
  marketStore.markets.forEach((item) => {
    if (item.pair.includes('-') || item.pair.includes(':')) return
    const pair = item.pair
    if (!result[pair]) {
      result[pair] = []
    }
    result[pair].push(item)
  })
  return result
})
const marketTabs = computed(() => Object.keys(filteredMarkets.value))

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
  const { data, previousMarkets } = JSON.parse(event.data);
  const parsedData = JSON.parse(data);
  const watchTickers = parsedData.watchTickers;
  if (!watchTickers) return;

  const processedData = Object.keys(watchTickers).map((symbol) => {
    const previousMarket = previousMarkets.find((m) => m.symbol === symbol);
    const price = watchTickers[symbol].last;
    const baseVolume = watchTickers[symbol].baseVolume;
    const quoteVolume = watchTickers[symbol].quoteVolume;
    const changeData = formatChange(watchTickers[symbol].change);
    const change = changeData.value;
    const changeStatus = changeData.status;

    let priceStatus = '';

    if (previousMarket) {
      priceStatus = previousMarket.price < price
        ? 'text-green-500 dark:text-green-500'
        : previousMarket.price > price
        ? 'text-red-500 dark:text-red-500'
        : '';
    }

    return {
      symbol,
      price,
      change: change > 0 ? '+' + change : change,
      priceStatus,
      changeStatus,
      baseVolume,
      quoteVolume,
    };
  });

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
const socketStore = useSocketStore()

watch(
  () => socketStore.tickersData,
  (newData) => {
    if (!newData) return

    // Prepare the previous markets data by extracting only necessary properties
    const previousMarkets = marketStore.markets.map((market) => ({
      symbol: market.symbol,
      price: market.price,
    }))

    worker.postMessage(JSON.stringify({ data: newData, previousMarkets }))
  },
  { immediate: true },
)

worker.onmessage = (event) => {
  const processedData = JSON.parse(event.data)

  // Update the market store
  marketStore.appendMarketData(processedData)
}
</script>

<template>
  <div class="w-full h-full relative">
    <div class="mb-4 flex border-gray-200 dark:border-gray-800">
      <button
        class="-mb-px text-gray-600 dark:text-gray-300 bg-gray-200 px-1 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-tl-lg"
        @click.prevent="scrollLeft()"
      >
        <Icon name="tabler:chevron-left" class="h-3 w-3" />
      </button>
      <ul
        id="myTab"
        class="nf flex-cols -mb-px flex overflow-x-hidden bg-gray-200 text-center text-sm font-medium dark:bg-gray-800 w-full"
        role="tablist"
      >
        <li v-if="isLoggedIn">
          <a
            class="inline-block px-2 py-1 text-gray-600 dark:text-gray-300"
            :class="
              !isActive('watchlist')
                ? 'cursor-pointer inactive-tab'
                : 'active-tab'
            "
            @click="setActive('watchlist')"
            ><Icon name="uit:favorite" class="h-3 w-3"
          /></a>
        </li>
        <li v-for="(item, index) in marketTabs" :key="index">
          <small>
            <a
              class="inline-block px-2 py-1 text-gray-600 dark:text-gray-300"
              :class="
                !isActive(item) ? 'cursor-pointer inactive-tab' : 'active-tab'
              "
              @click="setActive(item)"
              >{{ item }}</a
            ></small
          >
        </li>
      </ul>
      <button
        class="-mb-px text-gray-600 dark:text-gray-300 bg-gray-200 px-1 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-tr-lg"
        @click.prevent="scrollRight()"
      >
        <Icon name="tabler:chevron-right" class="h-3 w-3" />
      </button>
    </div>
    <div id="myTabContent" class="px-3">
      <ExchangeMarketsList
        v-if="activeItem === 'watchlist'"
        :key="filteredWatchlist.length"
        :list="Object.values(filteredWatchlist)"
        :is-logged-in="isLoggedIn"
        :uuid="user?.uuid"
        :is-favorite="true"
      />
      <div
        v-for="(item, key, index) in filteredMarkets"
        :key="index"
        :class="isActive(key) ? '' : 'hidden'"
      >
        <template v-if="activeItem === key">
          <ExchangeMarketsList
            :key="item.length"
            :list="Object.values(item)"
            :is-logged-in="isLoggedIn"
            :uuid="user?.uuid"
          />
        </template>
      </div>
    </div>
  </div>
</template>
