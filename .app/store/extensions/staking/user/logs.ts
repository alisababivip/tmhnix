import type { JSONResponse, StakingLog } from '~~/types'

export const useStakingLogsStore = defineStore({
  id: 'userStakingLogs',

  state: () => ({
    logs: [] as StakingLog[],
    loading: false,
  }),

  actions: {
    async fetchStakingLogs() {
      this.loading = true
      try {
        const { getStakingLogs } = useStaking()
        const response = (await getStakingLogs()) as JSONResponse
        this.logs = response.data.result
      } catch (error) {
        console.error('Error fetching user staking logs:', error)
      }
      this.loading = false
    },
  },
})
