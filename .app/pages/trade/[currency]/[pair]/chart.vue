<script setup lang="ts">
import { useEcoMarketStore } from '~~/store/extensions/ecosystem/market'
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
const ecoSocketStore = useEcosystemSocketStore()
definePageMeta({
  layout: 'empty',
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
</script>

<template>
  <div>
    <div class="w-full h-screen">
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
  </div>
</template>
