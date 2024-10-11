import type { AiTradingPlan } from '~~/types'
export const useAiTradingPlanStore = defineStore({
  id: 'adminAiTradingPlan',

  // State
  state: () => ({
    plans: [] as AiTradingPlan[],
    loading: false,
    selectedPlan: null as AiTradingPlan | null,
  }),

  // Getters
  getters: {
    getPlanById: (state) => (id: number) =>
      state.plans.find((plan) => plan.id === id),
  },

  // Actions
  actions: {
    async fetchAiTradingPlans() {
      this.loading = true
      try {
        const { getAdminAITradingPlans } = useAiTrading()
        const response = await getAdminAITradingPlans()
        this.plans = response.data.result
      } catch (error) {
        console.error('Error fetching deposit plans:', error)
      }
      this.loading = false
    },
    async removePlan(id: number) {
      const index = this.plans.findIndex((m) => m.id === id)
      this.plans.splice(index, 1)
    },
    async selectPlan(plan: AiTradingPlan) {
      this.selectedPlan = plan
    },
    async selectPlanById(id: number) {
      this.selectedPlan = this.plans.find((m) => m.id === id) || null
    },

    async updateAiTradingPlansStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update plans' status by IDs
        // Assuming you have a composable function like `updateAiTradingPlanStatus` to do this
        const { updateAiTradingPlanStatus } = useAiTrading()
        const response = await updateAiTradingPlanStatus(ids, status)

        // Update the plans in the state
        this.plans = this.plans.map((plan) =>
          ids.includes(plan.id) ? { ...plan, status } : plan,
        )

        return response
      } catch (error) {
        return error
      }
    },
  },
})
