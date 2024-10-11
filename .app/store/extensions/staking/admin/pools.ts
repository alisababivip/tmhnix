import type { StakingPool } from '~~/types'

export const useAdminStakingPoolsStore = defineStore({
  id: 'adminStakingPools',

  state: () => ({
    pools: [] as StakingPool[],
    loading: false,
    selectedPool: null as StakingPool | null,
  }),

  getters: {
    getPoolById: (state) => (id: number) =>
      state.pools.find((pool) => pool.id === id),
  },

  actions: {
    async fetchStakingPools() {
      this.loading = true
      try {
        const { getAdminStakingPools } = useStaking()
        const response = await getAdminStakingPools()
        this.pools = response.data.result
      } catch (error) {
        console.error('Error fetching staking pools:', error)
      }
      this.loading = false
    },
    async removePool(id: number) {
      const index = this.pools.findIndex((p) => p.id === id)
      if (index !== -1) this.pools.splice(index, 1)
    },
    async selectPool(pool: StakingPool) {
      this.selectedPool = pool
    },
    async selectPoolById(id: number) {
      this.selectedPool = this.getPoolById(id)
    },
  },
})
