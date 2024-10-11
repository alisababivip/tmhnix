import { defineStore } from 'pinia'

export const useEcosystemWalletStore = defineStore('ecosystemWallet', {
  state: () => ({
    wallet: null,
    wallets: [],
    loading: false,
  }),
  getters: {
    getWallet: (state) => (currency: string) => {
      return state.wallets[currency]
    },
  },

  actions: {
    async fetchWallets(
      transactions: boolean = true,
      addresses: boolean = true,
    ) {
      const { getWallets } = useEcosystem()
      this.loading = true
      try {
        const response = await getWallets(transactions, addresses)
        let wallets = {}
        if (
          response?.status === 'success' &&
          response?.data?.result &&
          response?.data?.result.length > 0
        ) {
          response.data.result.map((wallet) => {
            wallets[wallet.currency] = wallet
          })
          this.wallets = wallets
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },

    async fetchWallet(currency: string) {
      let response = null
      const { getWallet } = useEcosystem()
      response = await getWallet(currency)
      this.wallet = response?.data?.result ?? null
    },
  },
})
