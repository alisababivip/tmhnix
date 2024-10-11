import type { StakingLog } from '~~/types'

export const useAdminStakingLogsStore = defineStore({
  id: 'adminStakingLogs',

  state: () => ({
    logs: [] as StakingLog[],
    loading: false,
  }),

  actions: {
    async fetchStakingLogs() {
      this.loading = true
      try {
        const { getAdminStakingLogs } = useStaking()
        const response = await getAdminStakingLogs()
        this.logs = response.data.result
      } catch (error) {
        console.error('Error fetching staking logs:', error)
      }
      this.loading = false
    },
  },
})
