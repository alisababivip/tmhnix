import type { Investment } from '~~/types'

export const useAiTradingInvestmentStore = defineStore({
  // unique id of the store across your application
  id: 'adminAiInvestment',

  // a function that returns a fresh state
  state: () => ({
    investments: [] as Investment[],
    userInvestment: null,
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
      this.loading = true
      const { getAdminAITradings } = useAiTrading()
      const response = await getAdminAITradings()
      if (response.status === 'success') {
        this.investments = response.data.result
      }
      this.loading = false
    },

    async fetchUserInvestment() {
      const { getAITradings } = useAiTrading()
      const response = await getAITradings()
      if (response.status === 'success') {
        this.userInvestment = response.data.result ?? null
      }
    },
  },
})
