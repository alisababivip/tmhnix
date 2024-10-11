import type { IcoAllocation } from '~~/types'
export const useIcoAllocationStore = defineStore({
  id: 'icoAdminAllocation',

  // State
  state: () => ({
    allocations: [] as IcoAllocation[],
    loading: false,
    selectedAllocation: null as IcoAllocation | null,
  }),

  // Getters
  getters: {
    getAllocationById: (state) => (id: number) =>
      state.allocations.find((allocation) => allocation.id === id),
  },

  // Actions
  actions: {
    async fetchIcoAllocations() {
      this.loading = true
      try {
        const { getAdminIcoAllocations } = useIco()
        const response = await getAdminIcoAllocations()
        this.allocations = response.data.result
      } catch (error) {
        console.error('Error fetching deposit allocations:', error)
      }
      this.loading = false
    },
    async removeAllocation(id: number) {
      const index = this.allocations.findIndex((m) => m.id === id)
      this.allocations.splice(index, 1)
    },
    async selectAllocation(allocation: IcoAllocation) {
      this.selectedAllocation = allocation
    },
    async selectAllocationById(id: number) {
      this.selectedAllocation =
        this.allocations.find((m) => m.id === id) || null
    },
  },
})
