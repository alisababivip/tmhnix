import type { ForexAccount } from '~~/types' // Import your ForexAccount type if you have it defined

export const useForexAccountStore = defineStore({
  id: 'adminForexAccount',

  // State
  state: () => ({
    accounts: [] as ForexAccount[],
    loading: false,
    selectedAccount: null as ForexAccount | null,
  }),

  // Getters
  getters: {
    getAccountById: (state) => (id: number) =>
      state.accounts.find((account) => account.id === id),
  },

  // Actions
  actions: {
    async fetchForexAccounts() {
      this.loading = true
      try {
        // Replace with your actual API call
        const { getAdminForexAccounts } = useForex()
        const response = await getAdminForexAccounts()
        this.accounts = response.data.result
      } catch (error) {
        console.error('Error fetching accounts:', error)
      }
      this.loading = false
    },

    async removeAccount(id: number) {
      const index = this.accounts.findIndex((m) => m.id === id)
      this.accounts.splice(index, 1)
    },

    async selectAccount(account: ForexAccount) {
      this.selectedAccount = account
    },

    async selectAccountById(id: number) {
      this.selectedAccount = this.accounts.find((m) => m.id === id) || null
    },
  },
})
