export const useEcosystemAdminTokenStore = defineStore({
  // unique id of the store across your application
  id: 'ecosystemAdminToken',

  // a function that returns a fresh state
  state: () => ({
    tokens: [] as Token[],
    loading: false,
  }),

  // optional getters
  getters: {
    count(state) {
      // getter function to count Investments
      return state.tokens.length
    },
  },

  // actions/mutations
  actions: {
    async fetchTokens() {
      const { getAdminTokens } = useEcosystem()
      const response = await getAdminTokens()
      if (response.status === 'success') {
        this.tokens = response.data.result ?? null
      }
    },
    async fetchTokensAll() {
      const { getAdminTokensAll } = useEcosystem()
      const response = await getAdminTokensAll()
      if (response.status === 'success') {
        this.tokens = response.data.result ?? null
      }
    },
  },
})
