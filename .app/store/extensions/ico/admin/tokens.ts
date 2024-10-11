import type { IcoToken } from '~~/types'
export const useIcoTokenStore = defineStore({
  id: 'icoAdminToken',

  // State
  state: () => ({
    tokens: [] as IcoToken[],
    loading: false,
    selectedToken: null as IcoToken | null,
  }),

  // Getters
  getters: {
    getTokenById: (state) => (id: number) =>
      state.tokens.find((token) => token.id === id),
  },

  // Actions
  actions: {
    async fetchIcoTokens() {
      this.loading = true
      try {
        const { getAdminIcoTokens } = useIco()
        const response = await getAdminIcoTokens()
        this.tokens = response.data.result
      } catch (error) {
        console.error('Error fetching deposit tokens:', error)
      }
      this.loading = false
    },
    async removeToken(id: number) {
      const index = this.tokens.findIndex((m) => m.id === id)
      this.tokens.splice(index, 1)
    },
    async selectToken(token: IcoToken) {
      this.selectedToken = token
    },
    async selectTokenById(id: number) {
      this.selectedToken = this.tokens.find((m) => m.id === id) || null
    },
  },
})
