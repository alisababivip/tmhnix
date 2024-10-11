import type { P2PTrade } from '~~/types'

export const useUserP2PTradesStore = defineStore({
  id: 'userP2PTrades',

  state: () => ({
    trades: [] as P2PTrade[],
    loading: false,
    selectedTrade: null as P2PTrade | null,
    trade: null as P2PTrade | null,
  }),

  getters: {
    getTradeById: (state) => (id: number) =>
      state.trades.find((trade) => trade.id === id),
  },

  actions: {
    async fetchP2PTrades() {
      this.loading = true
      try {
        const { getUserP2PTrades } = useP2P()
        const response = await getUserP2PTrades()
        this.trades = response.data.result
      } catch (error) {
        console.error('Error fetching P2P trades:', error)
      }
      this.loading = false
    },
    async selectTradeById(id: number) {
      this.selectedTrade = this.getTradeById(id)
    },
    async fetchP2PTrade(uuid: string) {
      this.loading = true
      try {
        const { getUserP2PTrade } = useP2P()
        const response = await getUserP2PTrade(uuid)
        this.trade = response.data.result
      } catch (error) {
        console.error('Error fetching P2P trade:', error)
      }
      this.loading = false
    },
  },
})
