import type { ForexAccount } from '~~/types'

export const useForexAccountStore = defineStore({
  // unique id of the store across your application
  id: 'forexAccount',

  // a function that returns a fresh state
  state: () => ({
    accounts: [] as ForexAccount[],
    loading: false,
  }),

  // actions/mutations
  actions: {
    async fetchAccounts() {
      const { getForexAccounts } = useForex()
      const response = await getForexAccounts()
      if (response.status === 'success') {
        this.accounts = response.data.result as ForexAccount[]
      }
    },
  },
})
