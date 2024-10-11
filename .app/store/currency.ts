import type { ExchangeCurrency } from '~~/types' // Make sure to import the correct type

export const useCurrencyStore = defineStore('currency', {
  // State
  state: () => ({
    currencies: [] as ExchangeCurrency[],
    loading: true,
    selectedCurrency: null as ExchangeCurrency | null,
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
      const { getCurrencies } = useExchange() // Define this composable
      const response = await getCurrencies()
      this.currencies = response.data.result

      this.loading = false
    },

    async updateCurrency(id: number, currencyData: Partial<ExchangeCurrency>) {
      try {
        // Using the composable to update the currency
        const { updateCurrency } = useExchange() // Define this composable
        const response = await updateCurrency(id, currencyData)

        // Find and replace the currency
        const index = this.currencies.findIndex(
          (currency) => currency.id === id,
        )
        if (index !== -1) {
          this.currencies[index] = response.data.result
        }

        // Update selectedCurrency if it was the updated currency
        if (this.selectedCurrency?.id === id) {
          this.selectedCurrency = response.data.result
        }
        return response
      } catch (error) {
        return error
      }
    },

    async updateCurrenciesStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update Currencies' status by IDs
        // Assuming you have a composable function like `updateCurrenciesStatus` to do this
        const { updateCurrenciesStatus } = useExchange()
        const response = await updateCurrenciesStatus(ids, status)

        // Update the Currencies in the state
        this.currencies = this.currencies.map((currency) =>
          ids.includes(currency.id) ? { ...currency, status } : currency,
        )

        return response
      } catch (error) {
        return error
      }
    },

    selectCurrency(currency: ExchangeCurrency | null) {
      this.selectedCurrency = currency // Handle currency selection logic here
    },
  },
})
