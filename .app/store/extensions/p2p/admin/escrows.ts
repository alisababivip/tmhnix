import type { P2PEscrow } from '~~/types'

export const useAdminP2PEscrowStore = defineStore({
  id: 'adminP2PEscrow',

  state: () => ({
    escrows: [] as P2PEscrow[],
    loading: false,
    selectedEscrow: null as P2PEscrow | null,
  }),

  getters: {
    getEscrowById: (state) => (id: number) =>
      state.escrows.find((escrow) => escrow.id === id),
  },

  actions: {
    async fetchP2PEscrows() {
      this.loading = true
      try {
        const { getAdminP2PEscrows } = useP2P()
        const response = await getAdminP2PEscrows()
        this.escrows = response.data.result
      } catch (error) {
        console.error('Error fetching P2P escrows:', error)
      }
      this.loading = false
    },
    async removeEscrow(id: number) {
      const index = this.escrows.findIndex((escrow) => escrow.id === id)
      if (index !== -1) this.escrows.splice(index, 1)
    },
    async selectEscrow(escrow: P2PEscrow) {
      this.selectedEscrow = escrow
    },
    async selectEscrowById(id: number) {
      this.selectedEscrow = this.getEscrowById(id)
    },
  },
})
