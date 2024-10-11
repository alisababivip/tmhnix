import type { Referral } from '~~/types'

export const useAdminReferralStore = defineStore({
  id: 'adminReferral',

  state: () => ({
    nodes: [] as Node[],
    selectedNode: null as Node | null,
    referrals: [] as Referral[],
    selectedReferral: null as Referral | null,
    loading: false,
  }),

  getters: {
    getReferralById: (state) => (id: number) =>
      state.referrals.find((referral) => referral.id === id),
    getNodeByUserId: (state) => (userId: number) =>
      state.nodes.find((node) => node.userId === userId),
  },

  actions: {
    async fetchAllNodes() {
      this.loading = true
      try {
        const { getAllNodes } = useMlm()
        const response = await getAllNodes()
        this.nodes = response.data.result
      } catch (error) {
        console.error('Error fetching nodes:', error)
      }
      this.loading = false
    },
    async selectNodeByUserId(userId: number) {
      this.selectedNode = this.getNodeByUserId(userId)
    },
    async fetchAllReferrals() {
      this.loading = true
      try {
        const { getAllReferrals } = useMlm()
        const response = await getAllReferrals()
        this.referrals = response.data.result
      } catch (error) {
        console.error('Error fetching referrals:', error)
      }
      this.loading = false
    },
    async updateReferralStatus(id: number, status: string) {
      try {
        const { updateReferralStatus } = useMlm()
        await updateReferralStatus(id, status)
        // Update the local referral status if needed
      } catch (error) {
        console.error('Error updating referral status:', error)
      }
    },
    async selectReferral(referral: Referral) {
      this.selectedReferral = referral
    },
    async selectReferralById(id: number) {
      this.selectedReferral = this.getReferralById(id)
    },
  },
})
