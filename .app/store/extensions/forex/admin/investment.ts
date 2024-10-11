import type { Investment } from '~~/types'

export const useForexInvestmentStore = defineStore({
  // unique id of the store across your application
  id: 'adminForexInvestment',

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
      const { getAdminForexInvestments } = useForex()
      const response = await getAdminForexInvestments()
      if (response.status === 'success') {
        this.investments = response.data.result
      }
      this.loading = false
    },

    async fetchUserInvestment() {
      const { getForexInvestments } = useForex()
      const response = await getForexInvestments()
      if (response.status === 'success') {
        this.userInvestment = response.data.result ?? null
      }
    },
  },
})
