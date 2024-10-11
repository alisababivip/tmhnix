import type { P2POfferDispute } from '~~/types'

export const useUserP2PDisputesStore = defineStore({
  id: 'userP2PDisputes',

  state: () => ({
    disputes: [] as P2POfferDispute[],
    loading: false,
    selectedDispute: null as P2POfferDispute | null,
  }),

  getters: {
    getDisputeById: (state) => (id: number) =>
      state.disputes.find((dispute) => dispute.id === id),
  },

  actions: {
    async fetchP2PDisputes() {
      this.loading = true
      try {
        const { getUserP2PDisputes } = useP2P()
        const response = await getUserP2PDisputes()
        this.disputes = response.data.result
      } catch (error) {
        console.error('Error fetching user P2P disputes:', error)
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
