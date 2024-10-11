import type { ForexLog } from '~~/types'

export const useForexInvestmentStore = defineStore({
  // unique id of the store across your application
  id: 'forexInvestment',

  // a function that returns a fresh state
  state: () => ({
    investments: [] as ForexLog[],
    investment: null as ForexLog | null,
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
    async fetchInvestments() {
      const { getForexInvestments } = useForex()
      const response = await getForexInvestments()
      if (response.status === 'success') {
        this.investments = response.data.result
      }
    },
    async fetchInvestment() {
      const { getForexActiveInvestment } = useForex()
      const response = await getForexActiveInvestment()
      if (response.status === 'success') {
        this.investment = response.data.result
      }
    },
  },
})
