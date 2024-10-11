import type { Transaction } from '~~/types'

export const useForexTransactionStore = defineStore({
  // unique id of the store across your application
  id: 'forexTransactions',

  // a function that returns a fresh state
  state: () => ({
    transactions: [] as Transaction[],
    loading: false,
  }),

  // optional getters
  getters: {
    count(state) {
      // getter function to count Transactions
      return state.transactions.length
    },
  },

  // actions/mutations
  actions: {
    async fetchTransactions() {
      const { getForexTransactions } = useForex()
      const response = await getForexTransactions()
      if (response.status === 'success') {
        this.transactions = response.data.result ?? null
      }
    },
  },
})
