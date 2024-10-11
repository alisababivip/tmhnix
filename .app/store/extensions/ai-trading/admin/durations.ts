import type { AiTradingDuration } from '~~/types' // Import your AiTradingDuration type if you have it defined

export const useAiTradingDurationStore = defineStore({
  id: 'adminAiTradingDuration',

  // State
  state: () => ({
    durations: [] as AiTradingDuration[],
    loading: false,
    selectedDuration: null as AiTradingDuration | null,
  }),

  // Getters
  getters: {
    getDurationById: (state) => (id: number) =>
      state.durations.find((duration) => duration.id === id),
  },

  // Actions
  actions: {
    async fetchAiTradingDurations() {
      this.loading = true
      try {
        // Replace with your actual API call
        const { getAITradingDurations } = useAiTrading()
        const response = await getAITradingDurations()
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

    async selectDuration(duration: AiTradingDuration) {
      this.selectedDuration = duration
    },

    async selectDurationById(id: number) {
      this.selectedDuration = this.durations.find((m) => m.id === id) || null
    },
  },
})
