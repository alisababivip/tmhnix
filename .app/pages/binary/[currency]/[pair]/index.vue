<script setup lang="ts">
definePageMeta({
  layout: 'nav',
})

const marketStore = useMarketStore()
const socketStore = useSocketStore()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const route = useRoute()
const router = useRouter()
const isPractice = computed(() => route.query.isPractice === 'true')
const currency = computed(() => route.params.currency)
const pair = computed(() => route.params.pair)
const pageTitle = computed(() => currency.value + '/' + pair.value)
useHead({
  title: pageTitle.value,
})

const isTradeSocketOpen = ref(false)
const isTickersSocketOpen = ref(false)

onMounted(async () => {
  if (!settings.value?.binary_trading_practice && isPractice.value) {
    router.push('/binary/' + currency.value + '/' + pair.value)
  }
  if (!settings.value?.spot_exchange && !settings.value?.binary_trading) {
    router.push('/user')
  }
  if (marketStore.markets.length === 0) {
    await marketStore.fetchMarkets()
    marketStore.selectMarketBySymbol(currency.value + '/' + pair.value)
  }
  if (!isTradeSocketOpen.value) {
    socketStore.createSocket('trade')
    isTradeSocketOpen.value = true
  }
  if (!isTickersSocketOpen.value) {
    socketStore.createSocket('tickers')
    isTickersSocketOpen.value = true
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (!to.path.startsWith('/binary')) {
    socketStore.closeSocket('trade')
    socketStore.closeSocket('tickers')
    isTradeSocketOpen.value = false
    isTickersSocketOpen.value = false
  }
  next()
})

const isOrderCollapsed = ref(false)
const isOrdersCollapsed = ref(false)

const toggleOrderCollapse = () => {
  isOrderCollapsed.value = !isOrderCollapsed.value
}
const toggleOrdersCollapse = () => {
  isOrdersCollapsed.value = !isOrdersCollapsed.value
}
</script>

<template>
  <div
    style="font-family: BinancePlex, Arial, sans-serif !important"
    :class="{
      binaryContainerOrderCollapsed: isOrderCollapsed,
      binaryContainerOrdersCollapsed: isOrdersCollapsed,
      binaryContainerOrdersOrderCollapsed:
        isOrderCollapsed && isOrdersCollapsed,
    }"
    class="binaryContainer bg-slate-100 dark:bg-black h-[calc(100vh-64px)] relative mt-16"
  >
    <div class="binaryTicker">
      <ExchangeTicker :currency="currency" :pair="pair" />
    </div>
    <div class="binaryChart rounded-r-lg shadow">
      <ExchangeChart
        :currency="currency"
        :pair="pair"
        class="rounded-lg"
        :isBinary="true"
      />
    </div>
    <div class="binaryOrder flex" v-if="$viewport.isGreaterOrEquals('sm')">
      <div class="h-full flex items-center justify-center relative z-50">
        <div
          class="h-24 border-gray-200 bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center border rounded relative hover:bg-info-500 dark:hover:bg-info-500 dark:border-black group transition-all duration-300 cursor-pointer"
          @click="toggleOrderCollapse"
        >
          <Icon
            :name="`line-md:chevron-small-${
              isOrderCollapsed ? 'left' : 'right'
            }`"
            class="h-2 w-2 absolute rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-info-500 -start-0.5 z-50 group-hover:h-4 group-hover:w-4 group-hover:-start-1.5 transition-all duration-300"
          />
        </div>
      </div>
      <ExchangeBinaryOrder
        :currency="currency"
        :pair="pair"
        v-if="!isOrderCollapsed"
      />
      <div
        v-else
        class="bg-white dark:bg-gray-900 p-1 h-full rounded-l-lg"
      ></div>
    </div>

    <div
      class="collapseBinaryOrdersButton flex justify-center items-center"
      v-if="$viewport.isGreaterOrEquals('sm')"
    >
      <div
        class="w-24 border-gray-200 bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center hover:bg-info-500 dark:hover:bg-info-500 dark:border-black border rounded relative group transition-all duration-300 cursor-pointer"
        @click="toggleOrdersCollapse"
      >
        <Icon
          :name="`line-md:chevron-small-${isOrdersCollapsed ? 'up' : 'down'}`"
          class="h-2 w-2 group-hover:h-4 group-hover:w-4 absolute rounded-full cursor-pointer bg-gray-100 dark:bg-gray-700 group-hover:bg-info-500 -top-0.5 group-hover:-top-1.5 start-50 transition-all duration-300"
        />
      </div>
    </div>
    <div id="orders" class="binaryOrders">
      <ExchangeBinaryOrders
        :currency="currency"
        :pair="pair"
        v-if="!isOrdersCollapsed"
        class="h-full bg-white dark:bg-gray-900 rounded-tr-lg shadow"
      />
      <div
        v-if="isOrdersCollapsed"
        class="bg-white dark:bg-gray-900 p-1 w-full rounded-tr-lg"
      ></div>
    </div>
    <ExchangeBinaryOrder
      v-if="$viewport.isLessThan('sm')"
      :currency="currency"
      :pair="pair"
    />
  </div>
</template>
