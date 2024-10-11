import type { InvestmentPlan } from '~~/types'
export const useInvestmentPlanStore = defineStore({
  id: 'InvestmentPlan',

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
        const { getAdminInvestmentPlans } = useInvestment()
        const response = await getAdminInvestmentPlans()
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
    async selectPlan(plan: InvestmentPlan) {
      this.selectedPlan = plan
    },
    async selectPlanById(id: number) {
      this.selectedPlan = this.plans.find((m) => m.id === id) || null
    },

    async updateInvestmentPlansStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update plans' status by IDs
        // Assuming you have a composable function like `updateInvestmentPlanStatus` to do this
        const { updateInvestmentPlanStatus } = useInvestment()
        const response = await updateInvestmentPlanStatus(ids, status)

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
