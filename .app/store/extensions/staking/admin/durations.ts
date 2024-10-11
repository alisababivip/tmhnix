import type { StakingDuration } from '~~/types'

export const useAdminStakingDurationsStore = defineStore({
  id: 'adminStakingDurations',

  state: () => ({
    durations: [] as StakingDuration[],
    loading: false,
  }),

  getters: {
    getDurationById: (state) => (id: number) =>
      state.durations.find((duration) => duration.id === id),
  },

  actions: {
    async fetchStakingDurations() {
      this.loading = true
      try {
        const { getAdminStakingDurations } = useStaking()
        const response = await getAdminStakingDurations()
        this.durations = response.data.result
      } catch (error) {
        console.error('Error fetching staking durations:', error)
      }
      this.loading = false
    },
    async addDuration(duration: StakingDuration) {
      this.durations.push(duration)
    },
    async removeDuration(id: number) {
      const index = this.durations.findIndex((o) => o.id === id)
      if (index !== -1) this.durations.splice(index, 1)
    },
  },
})
