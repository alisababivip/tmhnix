import type {
  EcosystemMarket,
  EcosystemOrder,
  ExchangeWatchlist,
} from '~~/types'

export const useEcoMarketStore = defineStore('ecoMarket', {
  // State
  state: () => ({
    markets: [] as EcosystemMarket[],
    selected: [] as number[],
    selectedMarket: null as EcosystemMarket | null,
    loading: true,
    orders: [] as EcosystemOrder[],
    watchlists: [] as ExchangeWatchlist[],
    ordersNextPageState: null as string | null,
  }),

  // Getters
  getters: {
    items(state) {
      return state.markets
    },
  },

  // Actions
  actions: {
    async fetchWatchlists() {
      this.loading = true

      const { getWatchlists } = useEcosystem()
      try {
        const response = await getWatchlists()
        this.watchlists = response.data.result
      } catch (error) {
        console.log(error)
      }

      this.loading = false
    },
    updateItem(itemToUpdate: any, newItem: any) {
      itemToUpdate.priceStatus = newItem.priceStatus
      itemToUpdate.changeStatus = newItem.changeStatus
      itemToUpdate.price = newItem.price
      itemToUpdate.change = newItem.change
      itemToUpdate.baseVolume = newItem.baseVolume
      itemToUpdate.quoteVolume = newItem.quoteVolume
    },
    appendMarketData(data: any[]) {
      data.forEach((item) => {
        const market = this.markets.find((m: any) => m.symbol === item.symbol)
        if (market) {
          this.updateItem(market, item)
        }

        const watchlist = this.watchlists.find(
          (w: any) => w.symbol === item.symbol,
        )
        if (watchlist) {
          this.updateItem(watchlist, item)
        }
      })
    },
    async fetchMarkets() {
      this.loading = true

      // Using the composable to fetch markets
      const { getMarkets } = useEcosystem()
      const response = await getMarkets()
      this.markets = response.data.result

      this.loading = false
    },

    async fetchOrders(symbol) {
      this.loading = true

      // Using the composable to fetch orders
      const { getOrders } = useEcosystem()
      try {
        const response = await getOrders(symbol)
        if (response.status === 'success') {
          this.orders = response.data.result
        }
      } catch (error) {
        console.log(error)
      }

      this.loading = false
    },
  },
})
