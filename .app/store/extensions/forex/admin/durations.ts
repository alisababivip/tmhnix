import type { ForexDuration } from '~~/types' // Import your ForexDuration type if you have it defined

export const useForexDurationStore = defineStore({
  id: 'forexDuration',

  // State
  state: () => ({
    durations: [] as ForexDuration[],
    loading: false,
    selectedDuration: null as ForexDuration | null,
  }),

  // Getters
  getters: {
    getDurationById: (state) => (id: number) =>
      state.durations.find((duration) => duration.id === id),
  },

  // Actions
  actions: {
    async fetchForexDurations() {
      this.loading = true
      try {
        // Replace with your actual API call
        const { getForexDurations } = useForex()
        const response = await getForexDurations()
        this.durations = response.data.result
      } catch (error) {
        console.error('Error fetching durations:', error)
      }
      this.loading = false
    },

    async removeDuration(id: number) {
      const index = this.durations.findIndex((m) => m.id === id)
      this.durations.splice(index, 1)
    },

    async selectDuration(duration: ForexDuration) {
      this.selectedDuration = duration
    },

    async selectDurationById(id: number) {
      this.selectedDuration = this.durations.find((m) => m.id === id) || null
    },
  },
})
