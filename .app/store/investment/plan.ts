import type { InvestmentPlan } from '~~/types'
export const useUserInvestmentPlanStore = defineStore({
  id: 'userInvestmentPlan',

  // State
  state: () => ({
    plans: [] as InvestmentPlan[],
    loading: false,
    selectedPlan: null as InvestmentPlan | null,
  }),

  // Getters
  getters: {
    getPlanById: (state) => (id: number) =>
      state.plans.find((plan) => plan.id === id),
  },

  // Actions
  actions: {
    async fetchInvestmentPlans() {
      this.loading = true
      try {
        const { getInvestmentPlans } = useInvestment()
        const response = await getInvestmentPlans()
        this.plans = response.data.result
      } catch (error) {
        console.error('Error fetching deposit plans:', error)
      }
      this.loading = false
    },
    async selectPlan(plan: InvestmentPlan) {
      this.selectedPlan = plan
    },
    async selectPlanById(id: number) {
      this.selectedPlan = this.plans.find((m) => m.id === id) || null
    },
  },
})
