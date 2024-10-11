<script setup lang="ts">
import { useEcoMarketStore } from '~~/store/extensions/ecosystem/market'
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
const ecoSocketStore = useEcosystemSocketStore()
definePageMeta({
  layout: 'nav',
})

const marketStore = useMarketStore()
const socketStore = useSocketStore()
const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser) as any
const ecoMarketStore = useEcoMarketStore()

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const route = useRoute()
const currency = computed(() => route.params.currency)
const pair = computed(() => route.params.pair)

const pageTitle = computed(() => currency.value + '/' + pair.value)
useHead({
  title: pageTitle.value,
})

const isTradeSocketOpen = ref(false)
const isTickersSocketOpen = ref(false)
const market = computed(() => marketStore.selectedMarket)
const router = useRouter()

onMounted(async () => {
  if (!settings.value?.spot_exchange) {
    router.push('/user')
  }
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }
  if (marketStore.markets.length === 0) {
    await marketStore.fetchMarkets()
  }
  if (extensions.value['ecosystem'] && ecoMarketStore.markets.length === 0) {
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
  marketStore.selectMarketBySymbol(currency.value + '/' + pair.value)
  if (market.value) {
    if (market.value?.is_eco) {
      if (!isTradeSocketOpen.value) {
        ecoSocketStore.createSocket('exchange')
        isTradeSocketOpen.value = true
      }
    } else {
      if (!isTradeSocketOpen.value) {
        socketStore.createSocket('trade')
        isTradeSocketOpen.value = true
      }
      if (!isTickersSocketOpen.value) {
        socketStore.createSocket('tickers')
        isTickersSocketOpen.value = true
      }
    }
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (!to.path.startsWith('/trade')) {
    if (market.value) {
      if (market.value?.is_eco) {
        ecoSocketStore.closeSocket('exchange')
      } else {
        socketStore.closeSocket('trade')
        socketStore.closeSocket('tickers')
      }
    }
    isTradeSocketOpen.value = false
    isTickersSocketOpen.value = false
  }
  next()
})

const isOrderCollapsed = ref(false)
const isOrderBookCollapsed = ref(false)
const isTradesCollapsed = ref(false)
const isTradesOrdersCollapsed = ref(false)

const toggleOrderCollapse = () => {
  isOrderCollapsed.value = !isOrderCollapsed.value
}

const toggleOrderBookCollapse = () => {
  isOrderBookCollapsed.value = !isOrderBookCollapsed.value
}

const toggleTradesCollapse = () => {
  isTradesCollapsed.value = !isTradesCollapsed.value
}

const toggleTradesOrdersCollapse = () => {
  isTradesCollapsed.value = false
  isTradesOrdersCollapsed.value = !isTradesOrdersCollapsed.value
}
</script>

<template>
  <div>
    <div
      v-if="market"
      style="font-family: BinancePlex, Arial, sans-serif !important"
      :class="{
        tradingContainerOrderCollapsed: isOrderCollapsed,
        tradingContainerOrderBookCollapsed: isOrderBookCollapsed,
        tradingContainerOrderAndOrderBookCollapsed:
          isOrderCollapsed && isOrderBookCollapsed,
        tradingContainerTradesCollapsed: isTradesCollapsed,
        tradingContainerTradesOrdersCollapsed: isTradesOrdersCollapsed,
        tradingContainerTradesOrdersOrderbookCollapsed:
          isTradesOrdersCollapsed && isOrderBookCollapsed,
        tradingContainerTradesOrdersOrderCollapsed:
          isTradesOrdersCollapsed && isOrderCollapsed,
        tradingContainerTradesOrdersOrderbookOrderCollapsed:
          isTradesOrdersCollapsed && isOrderBookCollapsed && isOrderCollapsed,
      }"
      class="tradingContainer bg-slate-100 dark:bg-black h-[calc(100vh-64px)] relative mt-16"
    >
      <div class="Ticker">
        <EcosystemTicker
          :currency="currency"
          :pair="pair"
          v-if="market?.is_eco"
        />
        <ExchangeTicker :currency="currency" :pair="pair" v-else />
      </div>
      <div
        class="Chart bg-gray-100 dark:bg-gray-800 rounded-r-lg shadow"
        :class="{
          'mt-0.5': $viewport.isGreaterOrEquals('md'),
        }"
        v-if="$viewport.isGreaterOrEquals('md') || $viewport.isLessThan('sm')"
      >
        <EcosystemChart
          :currency="currency"
          :pair="pair"
          class="rounded-lg"
          v-if="market?.is_eco"
        />
        <ExchangeChart
          :currency="currency"
          :pair="pair"
          class="rounded-lg"
          v-else
        />
      </div>

      <div
        class="ChartAndInfo rounded-r-lg"
        v-if="$viewport.isLessThan('md') && $viewport.isGreaterOrEquals('sm')"
      >
        <EcosystemChartAndInfo
          :currency="currency"
          :pair="pair"
          v-if="market?.is_eco"
        />
        <ExchangeChartAndInfo :currency="currency" :pair="pair" v-else />
      </div>
      <div class="Orderbook flex" v-if="$viewport.isGreaterOrEquals('md')">
        <div class="h-full flex items-center justify-center relative">
          <div
            class="h-24 border-gray-200 bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center border rounded relative hover:bg-info-500 dark:hover:bg-info-500 dark:border-black group transition-all duration-300 cursor-pointer"
            @click="toggleOrderBookCollapse"
          >
            <Icon
              :name="`line-md:chevron-small-${
                isOrderBookCollapsed ? 'left' : 'right'
              }`"
              class="h-2 w-2 absolute rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-info-500 -start-0.5 z-50 group-hover:h-4 group-hover:w-4 group-hover:-start-1.5 transition-all duration-300"
            />
          </div>
        </div>
        <template v-if="!isOrderBookCollapsed">
          <EcosystemOrderBook
            :currency="currency"
            :pair="pair"
            v-if="market?.is_eco"
          />
          <ExchangeOrderBook :currency="currency" :pair="pair" v-else />
        </template>
        <div
          v-else
          class="bg-white dark:bg-gray-900 p-1 h-full rounded-lg"
        ></div>
      </div>
      <div class="Order flex" v-if="$viewport.isGreaterOrEquals('sm')">
        <div class="h-full flex items-center justify-center relative z-10">
          <div
            class="h-24 border-gray-200 bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center border rounded relative hover:bg-info-500 dark:hover:bg-info-500 dark:border-black group transition-all duration-300 cursor-pointer"
            @click="toggleOrderCollapse"
          >
            <Icon
              :name="`line-md:chevron-small-${
                isOrderCollapsed ? 'left' : 'right'
              }`"
              class="h-2 w-2 absolute rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-info-500 -start-0.5 z-20 group-hover:h-4 group-hover:w-4 group-hover:-start-1.5 transition-all duration-300"
            />
          </div>
        </div>
        <template v-if="!isOrderCollapsed">
          <EcosystemOrder
            :currency="currency"
            :pair="pair"
            v-if="market?.is_eco"
          />
          <ExchangeOrder :currency="currency" :pair="pair" v-else />
        </template>
        <div
          v-else
          class="bg-white dark:bg-gray-900 p-1 h-full rounded-l-lg"
        ></div>
      </div>

      <div
        class="collapseTradesOrdersButton flex justify-center items-center"
        v-if="$viewport.isGreaterOrEquals('md')"
      >
        <div
          class="w-24 border-gray-200 bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center hover:bg-info-500 dark:hover:bg-info-500 dark:border-black border rounded relative group transition-all duration-300 cursor-pointer"
          @click="toggleTradesOrdersCollapse"
        >
          <Icon
            :name="`line-md:chevron-small-${
              isTradesOrdersCollapsed ? 'up' : 'down'
            }`"
            class="h-2 w-2 group-hover:h-4 group-hover:w-4 absolute rounded-full cursor-pointer bg-gray-100 dark:bg-gray-700 group-hover:bg-info-500 -top-0.5 group-hover:-top-1.5 start-50 transition-all duration-300"
          />
        </div>
      </div>

      <div class="Trades flex" v-if="$viewport.isGreaterOrEquals('md')">
        <div
          class="h-full flex items-center justify-center relative"
          v-if="!isTradesOrdersCollapsed"
        >
          <div
            class="h-24 border-gray-200 bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center border rounded relative hover:bg-info-500 dark:hover:bg-info-500 dark:border-black group transition-all duration-300 cursor-pointer"
            @click="toggleTradesCollapse"
          >
            <Icon
              :name="`line-md:chevron-small-${
                isTradesCollapsed ? 'left' : 'right'
              }`"
              class="h-2 w-2 absolute rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-info-500 -start-0.5 z-50 group-hover:h-4 group-hover:w-4 group-hover:-start-1.5 transition-all duration-300"
            />
          </div>
        </div>
        <template v-if="!isTradesCollapsed && !isTradesOrdersCollapsed">
          <EcosystemTrades
            :currency="currency"
            :pair="pair"
            v-if="market?.is_eco"
          />
          <ExchangeTrades v-else :currency="currency" :pair="pair" />
        </template>
        <div
          v-if="isTradesCollapsed"
          class="bg-white dark:bg-gray-900 p-1 h-full rounded-tl-lg"
        ></div>
        <div
          v-if="isTradesOrdersCollapsed"
          class="bg-white dark:bg-gray-900 p-1 w-full rounded-tl-lg"
        ></div>
      </div>
      <div id="orders" class="Orders" v-if="$viewport.isGreaterOrEquals('sm')">
        <template v-if="!isTradesOrdersCollapsed">
          <EcosystemOrders
            v-if="market?.is_eco"
            :currency="currency"
            :pair="pair"
            class="h-full bg-white dark:bg-gray-900 rounded-tr-lg shadow"
          />
          <ExchangeOrders
            v-else
            :currency="currency"
            :pair="pair"
            class="h-full bg-white dark:bg-gray-900 rounded-tr-lg shadow"
          />
        </template>
        <div
          v-if="isTradesOrdersCollapsed"
          class="bg-white dark:bg-gray-900 p-1 w-full rounded-tr-lg"
        ></div>
      </div>
      <div v-if="$viewport.isLessThan('sm')" class="Info">
        <EcosystemInfo
          :currency="currency"
          :pair="pair"
          v-if="market?.is_eco"
        />
        <ExchangeInfo :currency="currency" :pair="pair" v-else />
      </div>
      <template v-if="$viewport.isLessThan('sm')">
        <EcosystemOrder
          v-if="market?.is_eco"
          :currency="currency"
          :pair="pair" />
        <ExchangeOrder v-else :currency="currency" :pair="pair"
      /></template>
    </div>
  </div>
</template>
