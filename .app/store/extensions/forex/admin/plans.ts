import type { ForexPlan } from '~~/types'
export const useForexPlanStore = defineStore({
  id: 'adminForexPlan',

  // State
  state: () => ({
    plans: [] as ForexPlan[],
    loading: false,
    selectedPlan: null as ForexPlan | null,
  }),

  // Getters
  getters: {
    getPlanById: (state) => (id: number) =>
      state.plans.find((plan) => plan.id === id),
  },

  // Actions
  actions: {
    async fetchForexPlans() {
      this.loading = true
      try {
        const { getAdminForexPlans } = useForex()
        const response = await getAdminForexPlans()
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
    async selectPlan(plan: ForexPlan) {
      this.selectedPlan = plan
    },
    async selectPlanById(id: number) {
      this.selectedPlan = this.plans.find((m) => m.id === id) || null
    },

    async updateForexPlansStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update plans' status by IDs
        // Assuming you have a composable function like `updateForexPlanStatus` to do this
        const { updateForexPlanStatus } = useForex()
        const response = await updateForexPlanStatus(ids, status)

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
