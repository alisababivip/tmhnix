import type { JSONResponse, StakingPool } from '~~/types'

export const useStakingPoolsStore = defineStore({
  id: 'userStakingPools',

  state: () => ({
    pools: [] as StakingPool[],
    loading: false,
  }),

  actions: {
    async fetchStakingPools() {
      this.loading = true
      try {
        const { getStakingPools } = useStaking()
        const response = (await getStakingPools()) as JSONResponse
        this.pools = response.data.result
      } catch (error) {
        console.error('Error fetching user staking pools:', error)
      }
      this.loading = false
    },
  },
})
