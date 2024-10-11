export const useEcosystemMasterWalletStore = defineStore({
  // unique id of the store across your application
  id: 'ecosystemMasterWallet',

  // a function that returns a fresh state
  state: () => ({
    wallets: [] as MasterWallet[],
    loading: false,
  }),

  // optional getters
  getters: {
    count(state) {
      // getter function to count Investments
      return state.wallets.length
    },
  },

  // actions/mutations
  actions: {
    async fetchWallets() {
      const { getMasterWallets } = useEcosystem()
      const response = await getMasterWallets()
      if (response.status === 'success') {
        this.wallets = response.data.result ?? null
      }
    },
    setWallets(wallets: MasterWallet[]) {
      this.wallets = wallets
    },
  },
})
