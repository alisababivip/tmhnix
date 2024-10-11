import type { EcosystemToken } from '~~/types'

export const useEcosystemCurrencyStore = defineStore('ecosystemCurrency', {
  // State
  state: () => ({
    currencies: [] as EcosystemToken[],
    loading: true,
    selectedCurrency: null as EcosystemToken | null,
  }),

  // Getters
  getters: {
    items(state) {
      return state.currencies
    },
  },

  // Actions
  actions: {
    async fetchCurrencies() {
      this.loading = true

      // Using the composable to fetch currencies
      const { getTokens } = useEcosystem() // Define this composable
      const response = await getTokens()
      this.currencies = response.data.result

      this.loading = false
    },

    selectCurrency(currency: EcosystemToken | null) {
      this.selectedCurrency = currency // Handle currency selection logic here
    },
  },
})
