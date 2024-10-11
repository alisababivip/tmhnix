import type { Investment } from '~~/types'

export const useAiTradingInvestmentStore = defineStore({
  // unique id of the store across your application
  id: 'aiInvestment',

  // a function that returns a fresh state
  state: () => ({
    investments: [] as Investment[],
    activeInvestments: [] as Investment[],
    loading: false,
  }),

  // optional getters
  getters: {
    count(state) {
      // getter function to count Investments
      return state.investments.length
    },
  },

  // actions/mutations
  actions: {
    async fetchActiveInvestments() {
      const { getActiveAITradings } = useAiTrading()
      const response = await getActiveAITradings()
      if (response.status === 'success') {
        this.activeInvestments = response.data.result ?? null
      }
    },
    async fetchInvestments() {
      const { getAITradings } = useAiTrading()
      const response = await getAITradings()
      if (response.status === 'success') {
        this.investments = response.data.result ?? null
      }
    },
  },
})
