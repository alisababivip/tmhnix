import type { ForexSignal } from '~~/types' // Import your ForexSignal type if you have it defined

export const useForexSignalStore = defineStore({
  id: 'forexSignal',

  // State
  state: () => ({
    signals: [] as ForexSignal[],
    loading: false,
    selectedSignal: null as ForexSignal | null,
  }),

  // Getters
  getters: {
    getSignalById: (state) => (id: number) =>
      state.signals.find((signal) => signal.id === id),
  },

  // Actions
  actions: {
    async fetchForexSignals() {
      this.loading = true
      try {
        // Replace with your actual API call
        const { getForexSignals } = useForex()
        const response = await getForexSignals()
        this.signals = response.data.result
      } catch (error) {
        console.error('Error fetching signals:', error)
      }
      this.loading = false
    },

    async removeSignal(id: number) {
      const index = this.signals.findIndex((m) => m.id === id)
      this.signals.splice(index, 1)
    },

    async selectSignal(signal: ForexSignal) {
      this.selectedSignal = signal
    },

    async selectSignalById(id: number) {
      this.selectedSignal = this.signals.find((m) => m.id === id) || null
    },
  },
})
