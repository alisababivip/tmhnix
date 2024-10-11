import type { P2PTrade } from '~~/types'

export const useAdminP2PTradesStore = defineStore({
  id: 'adminP2PTrades',

  state: () => ({
    trades: [] as P2PTrade[],
    loading: false,
    selectedTrade: null as P2PTrade | null,
  }),

  getters: {
    getTradeById: (state) => (id: number) =>
      state.trades.find((trade) => trade.id === id),
  },

  actions: {
    async fetchP2PTrades() {
      this.loading = true
      try {
        const { getAdminP2PTrades } = useP2P()
        const response = await getAdminP2PTrades()
        this.trades = response.data.result
      } catch (error) {
        console.error('Error fetching P2P trades:', error)
      }
      this.loading = false
    },
    async removeTrade(id: number) {
      const index = this.trades.findIndex((trade) => trade.id === id)
      if (index !== -1) this.trades.splice(index, 1)
    },
    async selectTrade(trade: P2PTrade) {
      this.selectedTrade = trade
    },
    async selectTradeById(id: number) {
      this.selectedTrade = this.getTradeById(id)
    },
  },
})
