import type { AiTradingPlan } from '~~/types'
export const useAiTradingPlanStore = defineStore({
  id: 'aiTradingPlan',

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
        const { getAITradingPlans } = useAiTrading()
        const response = await getAITradingPlans()
        this.plans = response.data.result
      } catch (error) {
        console.error('Error fetching deposit plans:', error)
      }
      this.loading = false
    },
    async selectPlan(plan: AiTradingPlan) {
      this.selectedPlan = plan
    },
    async selectPlanById(id: number) {
      this.selectedPlan = this.plans.find((m) => m.id === id) || null
    },
  },
})
