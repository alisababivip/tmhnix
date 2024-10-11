import type { P2POfferDispute } from '~~/types'

export const useAdminP2PDisputesStore = defineStore({
  id: 'adminP2PDisputes',

  state: () => ({
    disputes: [] as P2POfferDispute[],
    loading: false,
    selectedDispute: null as P2POfferDispute | null,
    dispute: null as P2POfferDispute | null,
  }),

  getters: {
    getDisputeById: (state) => (id: number) =>
      state.disputes.find((dispute) => dispute.id === id),
  },

  actions: {
    async fetchP2PDisputes() {
      this.loading = true
      try {
        const { getAdminP2PDisputes } = useP2P()
        const response = await getAdminP2PDisputes()
        this.disputes = response.data.result
      } catch (error) {
        console.error('Error fetching P2P disputes:', error)
      }
      this.loading = false
    },
    async fetchP2PDispute(id: number) {
      this.loading = true
      try {
        const { getAdminP2PDispute } = useP2P()
        const response = await getAdminP2PDispute(id)
        this.dispute = response.data.result
      } catch (error) {
        console.error('Error fetching P2P dispute:', error)
      }
      this.loading = false
    },
    async removeDispute(id: number) {
      const index = this.disputes.findIndex((dispute) => dispute.id === id)
      if (index !== -1) this.disputes.splice(index, 1)
    },
    async selectDispute(dispute: P2POfferDispute) {
      this.selectedDispute = dispute
    },
    async selectDisputeById(id: number) {
      this.selectedDispute = this.getDisputeById(id)
    },
  },
})
