import type { ForexCurrency } from '~~/types' // Import your ForexCurrency type if you have it defined

export const useForexCurrencyStore = defineStore({
  id: 'forexCurrency',

  // State
  state: () => ({
    currencies: [] as ForexCurrency[],
    loading: false,
    selectedCurrency: null as ForexCurrency | null,
  }),

  // Getters
  getters: {
    getCurrencyById: (state) => (id: number) =>
      state.currencies.find((currency) => currency.id === id),
  },

  // Actions
  actions: {
    async fetchForexCurrencies() {
      this.loading = true
      try {
        // Replace with your actual API call
        const { getForexCurrencies } = useForex()
        const response = await getForexCurrencies()
        this.currencies = response.data.result
      } catch (error) {
        console.error('Error fetching currencies:', error)
      }
      this.loading = false
    },

    async removeCurrency(id: number) {
      const index = this.currencies.findIndex((m) => m.id === id)
      this.currencies.splice(index, 1)
    },

    async selectCurrency(currency: ForexCurrency) {
      this.selectedCurrency = currency
    },

    async selectCurrencyById(id: number) {
      this.selectedCurrency = this.currencies.find((m) => m.id === id) || null
    },
  },
})
