import type {
  BinaryOrder,
  ExchangeMarket,
  ExchangeMarketMetaData,
  ExchangeOrder,
  ExchangeWatchlist,
} from '~~/types'

export const useMarketStore = defineStore('market', {
  // State
  state: () => ({
    markets: [] as ExchangeMarket[],
    selected: [] as number[],
    selectedMarket: null as ExchangeMarket | null,
    bestAsk: 0,
    bestBid: 0,
    bestAskClass: '',
    loading: true,
    orders: [] as ExchangeOrder[],
    binaryPositions: [] as BinaryOrder[],
    binaryExpirationTimes: [] as Date[],
    watchlists: [] as ExchangeWatchlist[],
    order: {
      amount: 0,
      price: 0,
      stopLossPrice: null,
      takeProfitPrice: null,
      type: 'LIMIT',
      side: 'BUY',
      percentage: 0,
      closed_at: null,
    },
  }),

  // Getters
  getters: {
    items(state) {
      return state.markets
    },
    getBinaryLivePositions(state) {
      return state.binaryPositions.filter(
        (order) => order.is_demo === false && order.status !== 'PENDING',
      )
    },
    getBinaryPracticePositions(state) {
      return state.binaryPositions.filter(
        (order) => order.is_demo === true && order.status !== 'PENDING',
      )
    },
  },

  // Actions
  actions: {
    async fetchWatchlists() {
      this.loading = true

      const { getWatchlists } = useExchange()
      try {
        const response = await getWatchlists()
        this.watchlists = response.data.result
      } catch (error) {
        console.log(error)
      }

      this.loading = false
    },
    setOrderData(price: string, side: string) {
      this.order.price = Number(price.replace(/,/g, ''))
      this.order.side = side
    },
    updateItem(itemToUpdate: any, newItem: any, isEco: boolean = false) {
      itemToUpdate.baseVolume = newItem.baseVolume
      itemToUpdate.quoteVolume = newItem.quoteVolume
      itemToUpdate.priceStatus = newItem.priceStatus
      itemToUpdate.changeStatus = newItem.changeStatus
      itemToUpdate.price = newItem.price
      itemToUpdate.change = newItem.change
    },
    updateHistory(symbol, newHistory) {
      const market = this.markets.find((m) => m.symbol === symbol)
      if (market) {
        if (!market.history) {
          market.history = []
        }
        market.history = newHistory
      }
    },
    appendMarketData(data, historyData) {
      if (Array.isArray(data)) {
        // Handle array
        data.forEach((item) => {
          const market = this.markets.find((m: any) => m.symbol === item.symbol)
          if (market) {
            this.updateItem(market, item, market.is_eco === true)
          }

          const watchlist = this.watchlists.find(
            (w: any) => w.symbol === item.symbol,
          )
          if (watchlist) {
            this.updateItem(watchlist, item, market.is_eco === true)
          }
        })
      } else if (typeof data === 'object') {
        // Handle object
        for (const [symbol, item] of Object.entries(data)) {
          const market = this.markets.find((m: any) => m.symbol === symbol)
          if (market) {
            this.updateItem(market, item, market.is_eco === true)
          }

          const watchlist = this.watchlists.find(
            (w: any) => w.symbol === symbol,
          )
          if (watchlist) {
            this.updateItem(watchlist, item, market.is_eco === true)
          }
        }
      }
      if (historyData) {
        for (const [symbol, newHistory] of Object.entries(historyData)) {
          this.updateHistory(symbol, newHistory)
        }
      }
    },
    async fetchMarkets() {
      this.loading = true

      // Using the composable to fetch markets
      const { getMarkets } = useExchange()
      const response = await getMarkets()
      this.markets = response.data.result

      this.loading = false
    },

    async fetchOrders() {
      this.loading = true

      // Using the composable to fetch orders
      const { getOrders } = useExchange()
      try {
        const response = await getOrders()
        this.orders = response.data.result
      } catch (error) {
        console.log(error)
      }

      this.loading = false
    },

    async fetchBinaryPositions(type = 'ALL') {
      this.loading = true

      // Using the composable to fetch orders
      const { getBinaryOrders } = useExchange()
      try {
        const response = await getBinaryOrders(type)
        this.binaryPositions = response.data.result
      } catch (error) {
        console.log(error)
      }

      this.loading = false
    },

    async cancelBinaryPosition(uuid: string, percentage: number) {
      // Using the composable to cancel an order
      const { cancelBinaryOrder } = useExchange()
      try {
        const response = await cancelBinaryOrder(uuid, percentage)
        if (response.status === 'success') {
          this.binaryPositions = this.binaryPositions.filter(
            (order) => order.uuid !== uuid,
          )
        }
        return response
      } catch (error) {
        return error
      }
    },

    async updateMarket(
      id: number,
      metadata: ExchangeMarketMetaData,
      is_trending?: boolean,
      is_hot?: boolean,
    ) {
      try {
        // Using the composable to update the market
        const { updateMarket } = useExchange()
        const response = await updateMarket(id, metadata, is_trending, is_hot)

        // Find and replace the market
        const index = this.markets.findIndex((market) => market.id === id)
        if (index !== -1) {
          this.markets[index] = response.data.result
        }

        // Update selectedMarket if it was the updated market
        if (this.selectedMarket?.id === id) {
          this.selectedMarket = response.data.result
        }
        return response
      } catch (error) {
        return error
      }
    },

    async updateMarketsStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update markets' status by IDs
        // Assuming you have a composable function like `updateMarketsStatus` to do this
        const { updateMarketsStatus } = useExchange()
        const response = await updateMarketsStatus(ids, status)

        // Update the markets in the state
        this.markets = this.markets.map((market) =>
          ids.includes(market.id) ? { ...market, status } : market,
        )

        return response
      } catch (error) {
        return error
      }
    },

    selectMarket(market: ExchangeMarket | null) {
      this.selectedMarket = market // Handle market selection logic here
    },
    selectMarketBySymbol(symbol: string) {
      const market = this.markets.find((m) => m.symbol === symbol)
      if (market) {
        this.selectedMarket = market
      }
    },
  },
})
