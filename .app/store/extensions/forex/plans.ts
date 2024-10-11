import type { ForexPlan } from '~~/types'
export const useForexPlanStore = defineStore({
  id: 'forexPlan',

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
        const { getForexPlans } = useForex()
        const response = await getForexPlans()
        this.plans = response.data.result
      } catch (error) {
        console.error('Error fetching deposit plans:', error)
      }
      this.loading = false
    },
    async selectPlan(plan: ForexPlan) {
      this.selectedPlan = plan
    },
    async selectPlanById(id: number) {
      this.selectedPlan = this.plans.find((m) => m.id === id) || null
    },
  },
})
